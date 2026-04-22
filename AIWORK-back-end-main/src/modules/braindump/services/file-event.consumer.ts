import { Injectable, Logger } from '@nestjs/common';
import { BaseConsumer, MessagePayload } from '@shared/messaging/base/base-consumer.service';
import { RabbitMQService } from '@shared/messaging/rabbitmq/rabbitmq.service';
import { PrismaService } from '@shared/database/prisma.service';
import { RedisService } from '@shared/cache/redis/redis.service';
import { QUEUES } from '@config/rabbitmq.config';
import { BrainDumpStatus } from '@prisma/client';
import { IAssetStatus, IJobStatus } from '../interfaces/job-message.interface';

/**
 * Message received from app-file-event queue
 */
interface FileEventMessage {
	jobId: string;
	assetId: string;
	status: 'COMPLETED' | 'FAILED';
	timestamp: number;
	result?: {
		extractedText?: string;
		processedPath?: string;
	};
	error?: string;
}

/**
 * Asset tracking stored in Redis per job
 */
interface JobAssetTracking {
	jobId: string;
	userId: string;
	assetIds: string[];
	completedAssetIds: string[];
	failedAssetIds: string[];
}

/**
 * Consumer for processing file event messages from AI worker.
 * Tracks asset completion and triggers braindump ingest when all assets are done.
 */
@Injectable()
export class FileEventConsumer extends BaseConsumer {
	protected readonly logger = new Logger(FileEventConsumer.name);
	protected readonly queueName = QUEUES.FILE_EVENT;
	protected readonly routingKeyPatterns = undefined;

	constructor(
		protected readonly rabbitMQService: RabbitMQService,
		private readonly prisma: PrismaService,
		private readonly redisService: RedisService,
	) {
		super(rabbitMQService);
	}

	/**
	 * Process incoming file event message
	 * Handles both wrapped format {data: {...}} and direct format {...}
	 */
	protected async processMessage(payload: MessagePayload<FileEventMessage>): Promise<void> {
		// Handle both wrapped and unwrapped message formats
		const message: FileEventMessage = (payload.data as FileEventMessage) || (payload as unknown as FileEventMessage);
		const { jobId, assetId, status } = message;

		this.logger.log(`Processing file event: job=${jobId}, asset=${assetId}, status=${status}`);

		try {
			// Update asset status in Redis
			const assetStatus: IAssetStatus = {
				assetId,
				jobId,
				status: status as IAssetStatus['status'],
				timestamp: new Date(message.timestamp).toISOString(),
				result: message.result,
				error: message.error,
			};
			await this.redisService.set(`asset:${assetId}`, assetStatus);

			// Update asset metadata in database
			await this.updateAssetInDatabase(assetId, status, message.result, message.error);

			// Get or create job tracking
			const trackingKey = `job-tracking:${jobId}`;
			let tracking = await this.redisService.get<JobAssetTracking>(trackingKey);

			if (!tracking) {
				// Initialize tracking from database
				tracking = await this.initializeJobTracking(jobId);
				if (!tracking) {
					this.logger.error(`Failed to initialize tracking for job ${jobId}`);
					return;
				}
			}

			// Update tracking based on status
			if (status === 'COMPLETED' && !tracking.completedAssetIds.includes(assetId)) {
				tracking.completedAssetIds.push(assetId);
			} else if (status === 'FAILED' && !tracking.failedAssetIds.includes(assetId)) {
				tracking.failedAssetIds.push(assetId);
			}

			// Save updated tracking
			await this.redisService.set(trackingKey, tracking);

			// Check if all assets are processed
			const processedCount = tracking.completedAssetIds.length + tracking.failedAssetIds.length;
			const totalCount = tracking.assetIds.length;

			this.logger.log(`Job ${jobId}: ${processedCount}/${totalCount} assets processed`);

			if (processedCount >= totalCount) {
				// All assets processed - send to braindump ingest
				await this.triggerBrainDumpIngest(tracking);

				// Clean up tracking
				await this.redisService.del(trackingKey);
			}
		} catch (error) {
			this.logger.error(`Error processing file event for asset ${assetId}`, error);
			throw error;
		}
	}

	/**
	 * Initialize job tracking from database
	 */
	private async initializeJobTracking(jobId: string): Promise<JobAssetTracking | null> {
		const brainDump = await this.prisma.brainDump.findUnique({
			where: { id: jobId },
			include: {
				attachments: {
					select: { assetId: true },
				},
			},
		});

		if (!brainDump) {
			this.logger.error(`BrainDump not found: ${jobId}`);
			return null;
		}

		const tracking: JobAssetTracking = {
			jobId,
			userId: brainDump.userId,
			assetIds: brainDump.attachments.map((a) => a.assetId),
			completedAssetIds: [],
			failedAssetIds: [],
		};

		// Save to Redis
		await this.redisService.set(`job-tracking:${jobId}`, tracking);

		return tracking;
	}

	/**
	 * Update asset metadata in database
	 */
	private async updateAssetInDatabase(
		assetId: string,
		status: string,
		result?: FileEventMessage['result'],
		error?: string,
	): Promise<void> {
		const asset = await this.prisma.asset.findUnique({
			where: { id: assetId },
		});

		if (!asset) {
			this.logger.warn(`Asset not found in database: ${assetId}`);
			return;
		}

		const currentMetadata = (asset.metadataJson as Record<string, any>) || {};
		await this.prisma.asset.update({
			where: { id: assetId },
			data: {
				metadataJson: {
					...currentMetadata,
					status,
					processedAt: new Date().toISOString(),
					...(result?.extractedText && { extractedText: result.extractedText }),
					...(result?.processedPath && { processedPath: result.processedPath }),
					...(error && { error }),
				},
			},
		});
	}

	/**
	 * Trigger braindump ingest when all assets are processed
	 */
	private async triggerBrainDumpIngest(tracking: JobAssetTracking): Promise<void> {
		const { jobId, userId, completedAssetIds, failedAssetIds } = tracking;

		// Update braindump status
		const allFailed = completedAssetIds.length === 0 && failedAssetIds.length > 0;
		const newStatus = allFailed ? BrainDumpStatus.FAILED : BrainDumpStatus.PROCESSING;

		await this.prisma.brainDump.update({
			where: { id: jobId },
			data: { status: newStatus },
		});

		// Update job status in Redis
		const jobStatus: IJobStatus = {
			jobId,
			status: newStatus,
			timestamp: new Date().toISOString(),
			assetCount: tracking.assetIds.length,
			completedCount: completedAssetIds.length,
		};
		await this.redisService.set(`job:${jobId}`, jobStatus);

		// Only send to ingest if at least one asset completed
		if (completedAssetIds.length > 0) {
			const ingestMessage = {
				braindump_id: jobId,
				user_id: userId,
			};

			await this.rabbitMQService.sendToQueue(QUEUES.BRAIN_DUMP_INGEST, ingestMessage);

			this.logger.log(
				`Triggered braindump ingest for job ${jobId}: ${completedAssetIds.length} completed, ${failedAssetIds.length} failed`,
			);
		} else {
			this.logger.warn(`All assets failed for job ${jobId}, skipping ingest`);
		}
	}
}
