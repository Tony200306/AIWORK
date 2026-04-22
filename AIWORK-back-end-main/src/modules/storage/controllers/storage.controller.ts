import {
	Controller,
	Post,
	UseInterceptors,
	UploadedFile,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from '@shared/storage/storage.service';
import { generateFileKey } from '@shared/utils/file-key.util';

/**
 * Storage Controller - handles HTTP requests for file operations
 * Supports both MinIO and AWS S3
 */
@ApiTags('Storage')
@ApiBearerAuth('JWT-auth')
@Controller('storage')
export class StorageController {
	private readonly logger = new Logger(StorageController.name);

	constructor(private readonly storageService: StorageService) {}

	/**
	 * Upload a file
	 */
	@Post('/upload')
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Upload a file to S3/MinIO' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		try {
			if (!file) {
				throw new BadRequestException('No file provided');
			}

			// Generate key if not provided
			const key = generateFileKey(file.originalname, 'uploads');

			// Upload file
			const result = await this.storageService.uploadFile(
				file.buffer,
				key,
				undefined, // bucket - use default
				file.mimetype // contentType
			);

			this.logger.log(`File uploaded: ${key}`);

			return {
				success: true,
				message: 'File uploaded successfully',
				data: {
					key: result.key,
					bucket: result.bucket,
					originalName: file.originalname,
					size: file.size,
					mimeType: file.mimetype,
				},
			};
		} catch (error) {
			this.logger.error('Failed to upload file', error);
			throw error;
		}
	}

	// /**
	//  * Download a file
	//  */
	// @Get('/download/:key')
	// @ApiOperation({ summary: 'Download a file from S3/MinIO' })
	// @ApiParam({ name: 'key', description: 'File key/path' })
	// @ApiQuery({ name: 'bucket', required: false, description: 'Bucket name (optional)' })
	// async downloadFile(
	// 	@Param('key') key: string,
	// 	@Query('bucket') bucket: string | undefined,
	// 	@Res() res: Response
	// ) {
	// 	try {
	// 		const fileBuffer = await this.storageService.downloadFile(key, bucket);

	// 		// Extract filename from key
	// 		const filename = path.basename(key);

	// 		// Set response headers
	// 		res.setHeader('Content-Type', 'application/octet-stream');
	// 		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
	// 		res.setHeader('Content-Length', fileBuffer.length.toString());

	// 		// Send file
	// 		res.send(fileBuffer);

	// 		this.logger.log(`File downloaded: ${key}`);
	// 	} catch (error) {
	// 		this.logger.error(`Failed to download file ${key}`, error);
	// 		throw error;
	// 	}
	// }

	// /**
	//  * List files
	//  */
	// @Get('/list')
	// @ApiOperation({ summary: 'List files in S3/MinIO bucket' })
	// async listFiles(@Query() query: ListFilesDto) {
	// 	try {
	// 		const files = await this.storageService.listFiles(query.prefix, query.bucket);

	// 		return {
	// 			success: true,
	// 			data: files,
	// 			count: files.length,
	// 		};
	// 	} catch (error) {
	// 		this.logger.error('Failed to list files', error);
	// 		throw error;
	// 	}
	// }

	// TODO: Implement presigned URL endpoint if needed
	// @Get('/presigned/:key')
	// async getPresignedUrl(@Param('key') key: string, @Query() query: PresignedUrlDto)
}

