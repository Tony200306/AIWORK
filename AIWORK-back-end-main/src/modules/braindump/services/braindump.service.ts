import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { StorageService } from '@shared/storage/storage.service';
import { RedisService } from '@shared/cache/redis/redis.service';
import { RabbitMQService } from '@shared/messaging/rabbitmq/rabbitmq.service';
import { CreateBrainDumpDto } from '../dtos/create-braindump.dto';
import { BrainDumpType, BrainDumpStatus, AssetType, AssetContext, TaskStatus, Priority, TagType } from '@prisma/client';
import { IPaginationResponse, IPaginationParams } from '@shared/interfaces/pagination.interface';
import { QUEUES } from '@config/rabbitmq.config';
import { IFileIngestMessage, IJobStatus, IAssetStatus } from '../interfaces/job-message.interface';
import {
	AtomicSplitResponseDto,
	AtomicSplitTaskDto,
	UpsertBrainDumpTasksDto,
	UpsertTaskDto,
	BulkCreateTasksDto,
	BulkCreateTasksResponseDto,
	BulkCreateTaskDto,
} from '../dtos/atomic-split.dto';
import { ITaskPriorityMessage } from '../interfaces/job-message.interface';

@Injectable()
export class BrainDumpService {
	private readonly logger = new Logger(BrainDumpService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly storageService: StorageService,
		private readonly redisService: RedisService,
		private readonly rabbitmqService: RabbitMQService,
	) {}

	/**
	 * Create a new brain dump with context and attachments
	 * Automatically publishes to RabbitMQ for AI processing
	 */
	async create(
		userId: string,
		data: CreateBrainDumpDto,
		files: Array<{ key: string; originalName: string; mimeType: string; size: number }>
	) {
		try {
			// Create brain dump with PENDING status (will be processed)
			const brainDump = await this.prisma.brainDump.create({
				data: {
					userId: userId,
					type: BrainDumpType.TASK_CANDIDATE,
					contextText: data.contextText,
					status: BrainDumpStatus.PENDING,
				},
			});

			// Track created assets for queue publishing
			const createdAssets: Array<{ id: string; storagePath: string; title: string; mimeType: string }> = [];

			// Create assets and link them to brain dump
			if (files && files.length > 0) {
				for (const file of files) {
					// Create Asset record
					const asset = await this.prisma.asset.create({
						data: {
							userId: userId,
							type: AssetType.ATTACHMENT,
							storagePath: file.key,
							title: file.originalName,
							metadataJson: {
								mimeType: file.mimeType,
								size: file.size,
								status: 'PENDING', // Track per-asset status
							},
						},
					});

					// Create BrainDumpAsset link
					await this.prisma.brainDumpAsset.create({
						data: {
							brainDumpId: brainDump.id,
							assetId: asset.id,
							context: AssetContext.TODO,
						},
					});

					createdAssets.push({
						id: asset.id,
						storagePath: file.key,
						title: file.originalName,
						mimeType: file.mimeType,
					});
				}
			}

			// Store initial job status in Redis
			const jobStatus: IJobStatus = {
				jobId: brainDump.id,
				status: BrainDumpStatus.PENDING,
				timestamp: new Date().toISOString(),
				assetCount: createdAssets.length,
				completedCount: 0,
			};
			await this.redisService.set(`job:${brainDump.id}`, jobStatus);

			// Publish each asset to FILE_INGEST queue for AI processing
			for (const asset of createdAssets) {
				try {
					const presignedUrl = await this.storageService.getPresignedUrl(asset.storagePath);

					const message: IFileIngestMessage = {
						jobId: brainDump.id,
						assetId: asset.id,
						status: BrainDumpStatus.PENDING,
						presignedDownloadUrl: presignedUrl.url,
						metadata: {
							userId: userId,
							brainDumpId: brainDump.id,
							fileName: asset.title,
							mimeType: asset.mimeType,
						},
					};

					await this.rabbitmqService.sendToQueue(QUEUES.FILE_INGEST, message);

					// Store per-asset status in Redis
					await this.redisService.set(`asset:${asset.id}`, {
						assetId: asset.id,
						jobId: brainDump.id,
						status: 'PENDING',
						timestamp: new Date().toISOString(),
					});

					this.logger.log(`Published asset ${asset.id} to FILE_INGEST queue`);
				} catch (queueError) {
					this.logger.error(`Failed to publish asset ${asset.id} to queue`, queueError);
					// Update asset status to FAILED
					await this.redisService.set(`asset:${asset.id}`, {
						assetId: asset.id,
						jobId: brainDump.id,
						status: 'FAILED',
						error: 'Failed to publish to queue',
						timestamp: new Date().toISOString(),
					});
				}
			}

			this.logger.log(`Brain dump ${brainDump.id} created and queued with ${createdAssets.length} assets`);

			// If no files, directly send to BRAIN_DUMP_INGEST for text-only processing
			if (createdAssets.length === 0) {
				const ingestMessage = {
					braindump_id: brainDump.id,
					user_id: userId,
				};

				await this.rabbitmqService.sendToQueue(QUEUES.BRAIN_DUMP_INGEST, ingestMessage);

				// Update status to PROCESSING
				await this.prisma.brainDump.update({
					where: { id: brainDump.id },
					data: { status: BrainDumpStatus.PROCESSING },
				});

				await this.redisService.set(`job:${brainDump.id}`, {
					...jobStatus,
					status: BrainDumpStatus.PROCESSING,
				});

				this.logger.log(`Brain dump ${brainDump.id} (text-only) sent directly to BRAIN_DUMP_INGEST`);
			}

			// Fetch the complete brain dump with attachments
			const brainDumpWithAttachments = await this.prisma.brainDump.findUnique({
				where: { id: brainDump.id },
				include: {
					attachments: {
						include: {
							asset: true,
						},
					},
					user: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
				},
			});

			return brainDumpWithAttachments;
		} catch (error) {
			this.logger.error('Failed to create brain dump', error);
			throw error;
		}
	}

	/**
	 * Get all brain dumps for a user with pagination
	 */
	async findAll(
		userId?: string,
		pagination?: IPaginationParams
	): Promise<{ data: any[]; pagination: IPaginationResponse }> {
		try {
			const page = pagination?.page || 1;
			const limit = pagination?.limit || 10;
			const skip = (page - 1) * limit;

			const where = userId ? { userId: userId } : {};

			// Get total count
			const total = await this.prisma.brainDump.count({
				where,
			});

			// Get paginated data
			const data = await this.prisma.brainDump.findMany({
				where,
				include: {
					attachments: {
						include: {
							asset: true,
						},
					},
					user: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
				skip,
				take: limit,
			});

			const paginationResponse: IPaginationResponse = {
				total,
				page,
				limit,
			};

			return {
				data,
				pagination: paginationResponse,
			};
		} catch (error) {
			this.logger.error('Failed to find brain dumps', error);
			throw error;
		}
	}

	/**
	 * Get a single brain dump by ID
	 */
	async findOne(id: string, userId?: string) {
		try {
			return await this.prisma.brainDump.findUnique({
				where: { id },
				include: {
					attachments: {
						include: {
							asset: true,
						},
					},
					user: {
						select: {
							id: true,
							email: true,
							name: true,
						},
					},
					convertedTasks: {
						select: {
							task: {
								select: {
									id: true,
									title: true,
									description: true,
									status: true,
								},
							},
						},
					},
				},
			});
		} catch (error) {
			this.logger.error(`Failed to find brain dump ${id}`, error);
			throw error;
		}
	}

	/**
	 * Delete a brain dump
	 */
	async delete(id: string, userId?: string) {
		try {
			const brainDump = await this.prisma.brainDump.findUnique({
				where: { id },
				include: {
					attachments: {
						include: {
							asset: true,
						},
					},
				},
			});

			if (!brainDump) {
				return null;
			}

			// Check if user owns this brain dump
			if (userId && brainDump.userId !== userId) {
				throw new UnauthorizedException('Unauthorized to delete this brain dump');
			}

			// Delete associated assets from storage (optional)
			// The assets will be cascade deleted from database, but files remain in storage
			// You can implement file deletion logic here if required

			const deleted = await this.prisma.brainDump.delete({
				where: { id },
			});

			this.logger.log(`Brain dump deleted: ${id}`);
			return deleted;
		} catch (error) {
			this.logger.error(`Failed to delete brain dump ${id}`, error);
			throw error;
		}
	}

	// ========== EVENT-DRIVEN PROCESSING METHODS ==========

	/**
	 * Publish brain dump assets to queue for AI processing
	 */
	async publishForProcessing(brainDumpId: string): Promise<void> {
		try {
			const brainDump = await this.prisma.brainDump.findUnique({
				where: { id: brainDumpId },
				include: {
					attachments: {
						include: {
							asset: true,
						},
					},
				},
			});

			if (!brainDump) {
				throw new NotFoundException(`Brain dump with ID ${brainDumpId} not found`);
			}

			// Update status to PENDING
			await this.prisma.brainDump.update({
				where: { id: brainDumpId },
				data: { status: BrainDumpStatus.PENDING },
			});

			// Store job status in Redis for fast polling
			const jobStatus: IJobStatus = {
				jobId: brainDumpId,
				status: BrainDumpStatus.PENDING,
				timestamp: new Date().toISOString(),
				assetCount: brainDump.attachments.length,
				completedCount: 0,
			};
			await this.redisService.set(`job:${brainDumpId}`, jobStatus);

			// Publish each asset to the FILE_INGEST queue
			for (const attachment of brainDump.attachments) {
				const asset = attachment.asset;

				// Generate presigned URL for external service to download
				const presignedUrl = await this.storageService.getPresignedUrl(asset.storagePath);

				const message: IFileIngestMessage = {
					jobId: brainDumpId,
					assetId: asset.id,
					status: BrainDumpStatus.PENDING,
					presignedDownloadUrl: presignedUrl.url,
					metadata: {
						userId: brainDump.userId,
						brainDumpId: brainDumpId,
						fileName: asset.title || 'unknown',
						mimeType: (asset.metadataJson as any)?.mimeType || 'application/octet-stream',
					},
				};

				await this.rabbitmqService.sendToQueue(QUEUES.FILE_INGEST, message);
				this.logger.log(`Published asset ${asset.id} to FILE_INGEST queue`);
			}

			this.logger.log(`Brain dump ${brainDumpId} queued for processing with ${brainDump.attachments.length} assets`);
		} catch (error) {
			this.logger.error(`Failed to publish brain dump ${brainDumpId} for processing`, error);
			throw error;
		}
	}

	/**
	 * Update processing status (called by queue consumer)
	 */
	async updateProcessingStatus(
		brainDumpId: string,
		status: BrainDumpStatus,
		error?: string,
	): Promise<void> {
		try {
			// Update Redis (fast cache for polling)
			const jobStatus: IJobStatus = {
				jobId: brainDumpId,
				status,
				timestamp: new Date().toISOString(),
				error: error || null,
			};
			await this.redisService.set(`job:${brainDumpId}`, jobStatus);

			// Update Prisma (persistent storage)
			await this.prisma.brainDump.update({
				where: { id: brainDumpId },
				data: { status },
			});

			this.logger.log(`Updated brain dump ${brainDumpId} status to ${status}`);
		} catch (error) {
			this.logger.error(`Failed to update processing status for ${brainDumpId}`, error);
			throw error;
		}
	}

	/**
	 * Get job status from Redis (fast polling endpoint)
	 */
	async getJobStatus(brainDumpId: string): Promise<IJobStatus | null> {
		try {
			const status = await this.redisService.get<IJobStatus>(`job:${brainDumpId}`);

			// If not in Redis, check database
			if (!status) {
				const brainDump = await this.prisma.brainDump.findUnique({
					where: { id: brainDumpId },
					select: { id: true, status: true, updatedAt: true },
				});

				if (!brainDump) {
					return null;
				}

				return {
					jobId: brainDump.id,
					status: brainDump.status,
					timestamp: brainDump.updatedAt.toISOString(),
				};
			}

			return status;
		} catch (error) {
			this.logger.error(`Failed to get job status for ${brainDumpId}`, error);
			throw error;
		}
	}

	// ========== ASSET STATUS METHODS ==========

	/**
	 * Update individual asset processing status (called by worker via FILE_EVENT queue)
	 */
	async updateAssetStatus(
		assetId: string,
		status: IAssetStatus['status'],
		result?: IAssetStatus['result'],
		error?: string,
	): Promise<void> {
		try {
			// Get current asset status from Redis
			const currentStatus = await this.redisService.get<IAssetStatus>(`asset:${assetId}`);

			if (!currentStatus) {
				this.logger.warn(`Asset ${assetId} not found in Redis`);
				return;
			}

			// Update asset status in Redis
			const updatedStatus: IAssetStatus = {
				assetId,
				jobId: currentStatus.jobId,
				status,
				timestamp: new Date().toISOString(),
				error,
				result,
			};
			await this.redisService.set(`asset:${assetId}`, updatedStatus);

			// Update asset metadata in database
			const asset = await this.prisma.asset.findUnique({
				where: { id: assetId },
			});

			if (asset) {
				const currentMetadata = (asset.metadataJson as any) || {};
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

			// Update job status completedCount
			const jobStatus = await this.redisService.get<IJobStatus>(`job:${currentStatus.jobId}`);
			if (jobStatus && (status === 'COMPLETED' || status === 'FAILED')) {
				const completedCount = (jobStatus.completedCount || 0) + 1;
				const allCompleted = completedCount >= (jobStatus.assetCount || 0);

				await this.redisService.set(`job:${currentStatus.jobId}`, {
					...jobStatus,
					completedCount,
					status: allCompleted ? BrainDumpStatus.COMPLETED : BrainDumpStatus.PROCESSING,
					timestamp: new Date().toISOString(),
				});

				// Update brain dump status if all assets are processed
				if (allCompleted) {
					await this.prisma.brainDump.update({
						where: { id: currentStatus.jobId },
						data: { status: BrainDumpStatus.COMPLETED },
					});
					this.logger.log(`Brain dump ${currentStatus.jobId} completed - all assets processed`);
				}
			}

			this.logger.log(`Updated asset ${assetId} status to ${status}`);
		} catch (error) {
			this.logger.error(`Failed to update asset status for ${assetId}`, error);
			throw error;
		}
	}

	/**
	 * Get individual asset status from Redis
	 */
	async getAssetStatus(assetId: string): Promise<IAssetStatus | null> {
		try {
			const status = await this.redisService.get<IAssetStatus>(`asset:${assetId}`);

			// If not in Redis, check database metadata
			if (!status) {
				const asset = await this.prisma.asset.findUnique({
					where: { id: assetId },
					select: { id: true, metadataJson: true, createdAt: true },
				});

				if (!asset) {
					return null;
				}

				const metadata = asset.metadataJson as any;
				return {
					assetId: asset.id,
					jobId: metadata?.brainDumpId || '',
					status: metadata?.status || 'PENDING',
					timestamp: asset.createdAt.toISOString(),
				};
			}

			return status;
		} catch (error) {
			this.logger.error(`Failed to get asset status for ${assetId}`, error);
			throw error;
		}
	}

	/**
	 * Get all asset statuses for a brain dump
	 */
	async getJobAssetStatuses(brainDumpId: string): Promise<IAssetStatus[]> {
		try {
			const brainDump = await this.prisma.brainDump.findUnique({
				where: { id: brainDumpId },
				include: {
					attachments: {
						include: {
							asset: true,
						},
					},
				},
			});

			if (!brainDump) {
				return [];
			}

			const statuses: IAssetStatus[] = [];
			for (const attachment of brainDump.attachments) {
				const assetStatus = await this.getAssetStatus(attachment.asset.id);
				if (assetStatus) {
					statuses.push(assetStatus);
				}
			}

			return statuses;
		} catch (error) {
			this.logger.error(`Failed to get asset statuses for job ${brainDumpId}`, error);
			throw error;
		}
	}

	// ========== ATOMIC SPLIT METHODS ==========

	/**
	 * Get tasks with steps and tags for a braindump (Atomic Split screen)
	 */
	async getBrainDumpTasks(brainDumpId: string, userId: string): Promise<AtomicSplitResponseDto> {
		const brainDump = await this.prisma.brainDump.findUnique({
			where: { id: brainDumpId },
			include: {
				convertedTasks: {
					include: {
						task: {
							include: {
								steps: {
									orderBy: { orderIndex: 'asc' },
								},
								taskTags: {
									include: {
										tag: true,
									},
								},
							},
						},
					},
					orderBy: { orderIndex: 'asc' },
				},
			},
		});

		if (!brainDump) {
			throw new NotFoundException(`BrainDump with ID ${brainDumpId} not found`);
		}

		// Check ownership
		if (brainDump.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to access this brain dump');
		}

		// Transform to response DTO
		const tasks: AtomicSplitTaskDto[] = brainDump.convertedTasks.map((bdTask) => ({
			id: bdTask.task.id,
			title: bdTask.task.title,
			description: bdTask.task.description || undefined,
			expectedTimeHours: bdTask.task.expectedTimeHours || undefined,
			dueAt: bdTask.task.dueAt || undefined,
			status: bdTask.task.status,
			priority: bdTask.task.priority,
			taskType: bdTask.task.taskType,
			orderIndex: bdTask.orderIndex || undefined,
			steps: bdTask.task.steps.map((step) => ({
				id: step.id,
				title: step.title,
				description: step.description || undefined,
				orderIndex: step.orderIndex || 0,
				sysEstMinutes: step.sysEstMinutes || undefined,
				userEstMinutes: step.userEstMinutes || undefined,
				isDone: step.isDone,
				difficulty: step.difficulty || undefined,
			})),
			tags: bdTask.task.taskTags.map((tt) => ({
				id: tt.tag.id,
				name: tt.tag.name,
				color: tt.tag.color || undefined,
				isPrimary: tt.isPrimary,
			})),
			scope: bdTask.task.scope || undefined,
		}));

		return {
			braindumpId: brainDump.id,
			status: brainDump.status,
			contextText: brainDump.contextText || undefined,
			tasks,
		};
	}

	/**
	 * Upsert tasks for a braindump (Atomic Split screen)
	 * Creates new tasks or updates existing ones
	 */
	async upsertBrainDumpTasks(
		brainDumpId: string,
		userId: string,
		dto: UpsertBrainDumpTasksDto,
	): Promise<AtomicSplitResponseDto> {
		// Validate braindump exists and belongs to user
		const brainDump = await this.prisma.brainDump.findUnique({
			where: { id: brainDumpId },
		});

		if (!brainDump) {
			throw new NotFoundException(`BrainDump with ID ${brainDumpId} not found`);
		}

		if (brainDump.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to modify this brain dump');
		}

		// Process each task
		for (const taskDto of dto.tasks) {
			await this.upsertSingleTask(brainDumpId, userId, taskDto);
		}

		// Return updated data
		return this.getBrainDumpTasks(brainDumpId, userId);
	}

	/**
	 * Upsert a single task with its steps and tags
	 */
	private async upsertSingleTask(
		brainDumpId: string,
		userId: string,
		taskDto: UpsertTaskDto,
	): Promise<void> {
		await this.prisma.$transaction(async (tx) => {
			let taskId: string;

			if (taskDto.id) {
				// Update existing task
				const existingTask = await tx.task.findUnique({
					where: { id: taskDto.id },
				});

				if (!existingTask) {
					throw new NotFoundException(`Task with ID ${taskDto.id} not found`);
				}

				if (existingTask.userId !== userId) {
					throw new UnauthorizedException('Unauthorized to modify this task');
				}

				await tx.task.update({
					where: { id: taskDto.id },
					data: {
						title: taskDto.title,
						description: taskDto.description || '',
						expectedTimeHours: taskDto.expectedTimeHours,
						dueAt: taskDto.dueAt ? new Date(taskDto.dueAt) : null,
					},
				});

				taskId = taskDto.id;

				// Update order index in BrainDumpTask if provided
				if (taskDto.orderIndex !== undefined) {
					await tx.brainDumpTask.update({
						where: {
							brainDumpId_taskId: { brainDumpId, taskId },
						},
						data: { orderIndex: taskDto.orderIndex },
					});
				}
			} else {
				// Create new task
				const task = await tx.task.create({
					data: {
						userId,
						title: taskDto.title,
						description: taskDto.description || '',
						expectedTimeHours: taskDto.expectedTimeHours,
						dueAt: taskDto.dueAt ? new Date(taskDto.dueAt) : null,
						status: TaskStatus.TODO,
						priority: Priority.MEDIUM,
					},
				});

				taskId = task.id;

				// Link to braindump
				await tx.brainDumpTask.create({
					data: {
						brainDumpId,
						taskId,
						orderIndex: taskDto.orderIndex,
					},
				});
			}

			// Handle steps
			if (taskDto.steps && taskDto.steps.length > 0) {
				// Get existing step IDs for this task
				const existingSteps = await tx.step.findMany({
					where: { taskId },
					select: { id: true },
				});
				const existingStepIds = new Set(existingSteps.map((s) => s.id));
				const incomingStepIds = new Set(taskDto.steps.filter((s) => s.id).map((s) => s.id!));

				// Delete steps that are no longer in the list
				const stepsToDelete = [...existingStepIds].filter((id) => !incomingStepIds.has(id));
				if (stepsToDelete.length > 0) {
					await tx.step.deleteMany({
						where: { id: { in: stepsToDelete } },
					});
				}

				// Upsert steps
				for (const stepDto of taskDto.steps) {
					if (stepDto.id && existingStepIds.has(stepDto.id)) {
						// Update existing step
						await tx.step.update({
							where: { id: stepDto.id },
							data: {
								title: stepDto.title,
								description: stepDto.description,
								orderIndex: stepDto.orderIndex,
								sysEstMinutes: stepDto.sysEstMinutes,
								userEstMinutes: stepDto.userEstMinutes,
								isDone: stepDto.isDone ?? false,
								difficulty: stepDto.difficulty,
							},
						});
					} else {
						// Create new step
						await tx.step.create({
							data: {
								taskId,
								title: stepDto.title,
								description: stepDto.description,
								orderIndex: stepDto.orderIndex,
								sysEstMinutes: stepDto.sysEstMinutes,
								userEstMinutes: stepDto.userEstMinutes,
								isDone: stepDto.isDone ?? false,
								difficulty: stepDto.difficulty,
							},
						});
					}
				}
			}

			// Handle tags
			if (taskDto.tags !== undefined) {
				// Remove existing task-tag associations
				await tx.taskTag.deleteMany({
					where: { taskId },
				});

				// Create new tag associations
				if (taskDto.tags.length > 0) {
					for (const tagDto of taskDto.tags) {
						let tagId: string;

						if (tagDto.id) {
							// Use existing tag
							tagId = tagDto.id;
						} else {
							// Find or create tag by name
							let tag = await tx.tag.findFirst({
								where: {
									userId,
									name: { equals: tagDto.name, mode: 'insensitive' },
								},
							});

							if (!tag) {
								tag = await tx.tag.create({
									data: {
										userId,
										name: tagDto.name,
										type: TagType.TODO,
									},
								});
							}

							tagId = tag.id;
						}

						// Create task-tag association
						await tx.taskTag.create({
							data: {
								taskId,
								tagId,
								isPrimary: tagDto.isPrimary ?? false,
							},
						});
					}
				}
			}
		});
	}

	// ========== BULK TASK CREATION METHODS ==========

	/**
	 * Bulk create tasks from a braindump and link them to brain_dump_task table
	 */
	async bulkCreateTasks(
		brainDumpId: string,
		userId: string,
		dto: BulkCreateTasksDto,
	): Promise<BulkCreateTasksResponseDto> {
		// Validate braindump exists and belongs to user
		const brainDump = await this.prisma.brainDump.findUnique({
			where: { id: brainDumpId },
		});

		if (!brainDump) {
			throw new NotFoundException(`BrainDump with ID ${brainDumpId} not found`);
		}

		if (brainDump.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to modify this brain dump');
		}

		const createdTaskIds: string[] = [];
		this.logger.log(`Starting bulk creation of ${dto.tasks} tasks for BrainDump ${brainDumpId}`);
		// Process each task in a transaction with increased timeout
		await this.prisma.$transaction(async (tx) => {
			for (const taskDto of dto.tasks) {
				const taskId = await this.createSingleTaskInBulk(tx, brainDumpId, userId, taskDto);
				createdTaskIds.push(taskId);
			}
		}, {
			timeout: 30000, // 30 seconds timeout for bulk operations
		});

		// Send message to queue for async priority calculation
		if (createdTaskIds.length > 0) {
			try {
				const priorityMessage: ITaskPriorityMessage = {
					userId,
					taskIds: createdTaskIds,
					metadata: {
						braindumpId: brainDumpId,
						source: 'bulkCreateTasks',
					},
				};

				await this.rabbitmqService.sendToQueue(QUEUES.TASK_PRIORITY, priorityMessage);
				this.logger.log(
					`Sent ${createdTaskIds.length} tasks to priority calculation queue`,
				);
			} catch (queueError) {
				this.logger.error(
					`Failed to send tasks to priority calculation queue`,
					queueError,
				);
				// Don't fail the entire operation if queue publishing fails
			}
		}

		// Fetch created tasks with full details
		const createdTasks = await this.prisma.brainDump.findUnique({
			where: { id: brainDumpId },
			include: {
				convertedTasks: {
					where: {
						taskId: { in: createdTaskIds },
					},
					include: {
						task: {
							include: {
								steps: {
									orderBy: { orderIndex: 'asc' },
								},
								taskTags: {
									include: {
										tag: true,
									},
								},
							},
						},
					},
					orderBy: { orderIndex: 'asc' },
				},
			},
		});

		// Transform to response DTO
		const tasks: AtomicSplitTaskDto[] = createdTasks!.convertedTasks.map((bdTask) => ({
			id: bdTask.task.id,
			title: bdTask.task.title,
			description: bdTask.task.description || undefined,
			expectedTimeHours: bdTask.task.expectedTimeHours || undefined,
			dueAt: bdTask.task.dueAt || undefined,
			status: bdTask.task.status,
			priority: bdTask.task.priority,
			taskType: bdTask.task.taskType,
			orderIndex: bdTask.orderIndex || undefined,
			steps: bdTask.task.steps.map((step) => ({
				id: step.id,
				title: step.title,
				description: step.description || undefined,
				orderIndex: step.orderIndex || 0,
				sysEstMinutes: step.sysEstMinutes || undefined,
				userEstMinutes: step.userEstMinutes || undefined,
				isDone: step.isDone,
				difficulty: step.difficulty || undefined,
			})),
			tags: bdTask.task.taskTags.map((tt) => ({
				id: tt.tag.id,
				name: tt.tag.name,
				color: tt.tag.color || undefined,
				isPrimary: tt.isPrimary,
			})),
			scope: bdTask.task.scope,
		}));

		return {
			braindumpId: brainDumpId,
			createdCount: createdTaskIds.length,
			taskIds: createdTaskIds,
			tasks,
		};
	}

	/**
	 * Create a single task within a transaction for bulk creation
	 */
	private async createSingleTaskInBulk(
		tx: any,
		brainDumpId: string,
		userId: string,
		taskDto: BulkCreateTaskDto,
	): Promise<string> {
		// Create new task
		const task = await tx.task.create({
			data: {
				userId,
				title: taskDto.title,
				description: taskDto.description || '',
				expectedTimeHours: taskDto.expectedTimeHours,
				dueAt: taskDto.dueAt ? new Date(taskDto.dueAt) : null,
				status: TaskStatus.TODO,
				priority: Priority.MEDIUM,
				scope: taskDto.scope ,
			},
		});

		const taskId = task.id;

		// Link to braindump in brain_dump_task table
		await tx.brainDumpTask.create({
			data: {
				brainDumpId,
				taskId,
				orderIndex: taskDto.orderIndex,
			},
		});

		// Handle steps - batch create
		if (taskDto.steps && taskDto.steps.length > 0) {
			const stepsData = taskDto.steps.map((stepDto) => ({
				taskId,
				title: stepDto.title,
				description: stepDto.description || null,
				orderIndex: stepDto.orderIndex ?? 0,
				sysEstMinutes: stepDto.sysEstMinutes,
				userEstMinutes: stepDto.userEstMinutes,
				isDone: stepDto.isDone ?? false,
				difficulty: stepDto.difficulty,
			}));

			await tx.step.createMany({
				data: stepsData,
			});
		}

		// Handle tags
		if (taskDto.tags && taskDto.tags.length > 0) {
			const tagIds: string[] = [];

			// Process tags in batches to avoid transaction timeout
			for (const tagDto of taskDto.tags) {
				let tagId: string;

				if (tagDto.id) {
					// Use existing tag
					tagId = tagDto.id;
				} else {
					// Find or create tag by name
					let tag = await tx.tag.findFirst({
						where: {
							userId,
							name: { equals: tagDto.name, mode: 'insensitive' },
						},
					});

					if (!tag) {
						tag = await tx.tag.create({
							data: {
								userId,
								name: tagDto.name,
								type: TagType.TODO,
							},
						});
					}

					tagId = tag.id;
				}

				tagIds.push(tagId);
			}

			// Batch create task-tag associations
			const taskTagData = taskDto.tags.map((tagDto, index) => ({
				taskId,
				tagId: tagIds[index],
				isPrimary: tagDto.isPrimary ?? false,
			}));

			await tx.taskTag.createMany({
				data: taskTagData,
			});
		}

		return taskId;
	}
}

