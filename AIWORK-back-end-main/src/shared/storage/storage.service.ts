import { Injectable, OnModuleInit, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, GetObjectCommandOutput, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from 'src/config';

@Injectable()
export class StorageService implements OnModuleInit {
	private readonly logger = new Logger(StorageService.name);
	private s3Client: S3Client | null = null;
	private readonly storageConfig = config.storage;

	async onModuleInit() {
		if (!this.storageConfig.enabled) {
			this.logger.warn('Storage is disabled. Skipping initialization.');
			return;
		}

		try {
			// If endpoint is provided, it's MinIO; otherwise it's AWS S3
			const isMinIO = !!this.storageConfig.endpoint;
			const protocol = this.storageConfig.useSSL ? 'https' : 'http';
			const defaultPort = this.storageConfig.useSSL ? 443 : 80;
			const port = this.storageConfig.port || defaultPort;
			// Don't append port if it's the default port for the protocol
			const portSuffix = port === defaultPort ? '' : `:${port}`;
			const endpoint = isMinIO
				? `${protocol}://${this.storageConfig.endpoint}${portSuffix}`
				: undefined;

			this.s3Client = new S3Client({
				endpoint: endpoint,
				region: this.storageConfig.region || 'us-east-1',
				credentials: {
					accessKeyId: this.storageConfig.accessKey,
					secretAccessKey: this.storageConfig.secretKey,
				},
				forcePathStyle: isMinIO, // MinIO requires path-style addressing
			});

			// Ensure bucket exists
			await this.ensureBucketExists();

			this.logger.log(`Storage service initialized (${isMinIO ? 'MinIO' : 'AWS S3'})`);
		} catch (error) {
			this.logger.error('Failed to initialize storage service', error);
			throw error;
		}
	}

	/**
	 * Ensure the bucket exists, create it if it doesn't
	 */
	private async ensureBucketExists(): Promise<void> {
		if (!this.s3Client) {
			return;
		}

		try {
			// Check if bucket exists
			await this.s3Client.send(
				new HeadBucketCommand({
					Bucket: this.storageConfig.bucket,
				})
			);
			this.logger.log(`Bucket ${this.storageConfig.bucket} exists`);
		} catch (error: any) {
			// If bucket doesn't exist, create it
			if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
				try {
					await this.s3Client.send(
						new CreateBucketCommand({
							Bucket: this.storageConfig.bucket,
						})
					);
					this.logger.log(`Bucket ${this.storageConfig.bucket} created`);
				} catch (createError) {
					this.logger.error(`Failed to create bucket ${this.storageConfig.bucket}`, createError);
					throw createError;
				}
			} else {
				this.logger.error(`Failed to check bucket ${this.storageConfig.bucket}`, error);
				throw error;
			}
		}
	}

	/**
	 * Upload a file to S3/MinIO
	 */
	async uploadFile(
		file: Buffer,
		key: string,
		bucket?: string,
		contentType?: string
	): Promise<{ key: string; bucket: string; url?: string }> {
		if (!this.isEnabled()) {
			throw new BadRequestException('Storage service is not enabled');
		}

		if (!file || file.length === 0) {
			throw new BadRequestException('File buffer is empty');
		}

		const targetBucket = bucket || this.storageConfig.bucket;

		try {
			await this.s3Client.send(
				new PutObjectCommand({
					Bucket: targetBucket,
					Key: key,
					Body: file,
					ContentType: contentType || 'application/octet-stream',
				})
			);

			this.logger.log(`File uploaded: ${key} to bucket ${targetBucket}`);

			return {
				key,
				bucket: targetBucket,
			};
		} catch (error) {
			this.logger.error(`Failed to upload file ${key}`, error);
			throw error;
		}
	}

	/**
	 * Download a file from S3/MinIO
	 */
	async downloadFile(key: string, bucket?: string): Promise<Buffer> {
		if (!this.isEnabled()) {
			throw new BadRequestException('Storage service is not enabled');
		}

		const targetBucket = bucket || this.storageConfig.bucket;

		try {
			const response: GetObjectCommandOutput = await this.s3Client.send(
				new GetObjectCommand({
					Bucket: targetBucket,
					Key: key,
				})
			);

			if (!response.Body) {
				throw new NotFoundException(`File ${key} not found or empty`);
			}

			// Convert stream to buffer
			const chunks: Uint8Array[] = [];
			for await (const chunk of response.Body as any) {
				chunks.push(chunk);
			}
			const buffer = Buffer.concat(chunks);

			this.logger.log(`File downloaded: ${key} from bucket ${targetBucket}`);

			return buffer;
		} catch (error: any) {
			if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
				throw new NotFoundException(`File ${key} not found`);
			}
			this.logger.error(`Failed to download file ${key}`, error);
			throw error;
		}
	}

	/**
	 * List files in a bucket with optional prefix
	 */
	async listFiles(prefix?: string, bucket?: string): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
		if (!this.isEnabled()) {
			throw new BadRequestException('Storage service is not enabled');
		}

		const targetBucket = bucket || this.storageConfig.bucket;

		try {
			const response = await this.s3Client.send(
				new ListObjectsV2Command({
					Bucket: targetBucket,
					Prefix: prefix,
				})
			);

			const files = (response.Contents || []).map((object) => ({
				key: object.Key || '',
				size: object.Size || 0,
				lastModified: object.LastModified || new Date(),
			}));

			this.logger.log(`Listed ${files.length} files from bucket ${targetBucket}${prefix ? ` with prefix ${prefix}` : ''}`);

			return files;
		} catch (error) {
			this.logger.error(`Failed to list files from bucket ${targetBucket}`, error);
			throw error;
		}
	}

	/**
	 * Generate a presigned URL for temporary file access
	 */
	async getPresignedUrl(
		key: string,
		expiresIn: number = 3600,
		bucket?: string
	): Promise<{ url: string; expiresIn: number }> {
		if (!this.isEnabled()) {
			throw new BadRequestException('Storage service is not enabled');
		}

		const targetBucket = bucket || this.storageConfig.bucket;

		try {
			const command = new GetObjectCommand({
				Bucket: targetBucket,
				Key: key,
			});

			const url = await getSignedUrl(this.s3Client, command, { expiresIn });

			this.logger.log(`Presigned URL generated for ${key}, expires in ${expiresIn} seconds`);

			return {
				url,
				expiresIn,
			};
		} catch (error) {
			this.logger.error(`Failed to generate presigned URL for ${key}`, error);
			throw error;
		}
	}

	/**
	 * Check if storage service is enabled and connected
	 */
	isEnabled(): boolean {
		return this.storageConfig.enabled && this.s3Client !== null;
	}

	/**
	 * Get the S3 client (for advanced operations)
	 */
	getClient(): S3Client | null {
		return this.s3Client;
	}
}

