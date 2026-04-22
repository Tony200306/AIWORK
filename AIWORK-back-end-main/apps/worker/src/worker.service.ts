import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../src/shared/database/prisma.service';
import { RedisService } from '../../../src/shared/cache/redis/redis.service';
import { IFileEventMessage, IJobStatus } from '../../../src/modules/braindump/interfaces/job-message.interface';
import { BrainDumpStatus } from '@prisma/client';

@Injectable()
export class WorkerService {
	private readonly logger = new Logger(WorkerService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly redisService: RedisService,
	) {}

	/**
	 * Process file event message from the queue
	 * Updates Redis (fast cache) and Prisma (persistent storage)
	 */
	async processFileEvent(message: IFileEventMessage): Promise<void> {
		const { jobId, assetId, status, error, result, timestamp } = message;

		this.logger.log(`Processing event: job=${jobId}, asset=${assetId}, status=${status}`);

		try {
			// Update Redis (fast cache for polling)
			const jobStatus: IJobStatus = {
				jobId,
				status,
				timestamp: timestamp || new Date().toISOString(),
				error: error || null,
			};
			await this.redisService.set(`job:${jobId}`, jobStatus);

			// Update BrainDump status in Prisma
			await this.prisma.brainDump.update({
				where: { id: jobId },
				data: { status: status as BrainDumpStatus },
			});

			this.logger.log(`Updated brain dump ${jobId} status to ${status}`);

			// Update Asset with processing result if provided
			if (result && assetId) {
				await this.updateAssetWithResult(assetId, result);
			}
		} catch (dbError) {
			this.logger.error(`Database error processing event for job ${jobId}`, dbError);
			throw dbError;
		}
	}

	/**
	 * Update asset metadata with processing result
	 */
	private async updateAssetWithResult(
		assetId: string,
		result: IFileEventMessage['result'],
	): Promise<void> {
		if (!result) return;

		try {
			const asset = await this.prisma.asset.findUnique({
				where: { id: assetId },
			});

			if (!asset) {
				this.logger.warn(`Asset ${assetId} not found, skipping result update`);
				return;
			}

			const existingMetadata = (asset.metadataJson as Record<string, any>) || {};

			await this.prisma.asset.update({
				where: { id: assetId },
				data: {
					metadataJson: {
						...existingMetadata,
						processedPath: result.processedPath,
						extractedText: result.extractedText,
						embeddings: result.embeddings,
						processedAt: new Date().toISOString(),
					},
				},
			});

			this.logger.log(`Updated asset ${assetId} with processing result`);
		} catch (error) {
			this.logger.error(`Failed to update asset ${assetId} with result`, error);
			// Don't throw - asset update failure shouldn't fail the whole job
		}
	}
}
