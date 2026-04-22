import {
	Controller,
	Post,
	Get,
	Put,
	Delete,
	Param,
	Body,
	Query,
	UseInterceptors,
	UploadedFiles,
	Logger,
	BadRequestException,
	NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { BrainDumpService } from '../services/braindump.service';
import { TaskPriorityService } from '../services/task-priority.service';
import { StorageService } from '@shared/storage/storage.service';
import { CreateBrainDumpDto } from '../dtos/create-braindump.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import {
	UpsertBrainDumpTasksDto,
	AtomicSplitResponseDto,
	BulkCreateTasksDto,
	BulkCreateTasksResponseDto
} from '../dtos/atomic-split.dto';
import { CurrentUser } from '@decorators/current-user.decorator';
import { generateFileKey } from '@shared/utils/file-key.util';

/**
 * BrainDump Controller - handles HTTP requests for brain dump operations
 */
@ApiTags('BrainDump')
@ApiBearerAuth('JWT-auth')
@Controller('braindump')
export class BrainDumpController {
	private readonly logger = new Logger(BrainDumpController.name);

	constructor(
		private readonly brainDumpService: BrainDumpService,
		private readonly taskPriorityService: TaskPriorityService,
		private readonly storageService: StorageService,
	) {}

	/**
	 * Create a new brain dump with context and file attachments
	 */
	@Post()
	@UseInterceptors(FilesInterceptor('attachments', 10)) // Allow up to 10 files
	@ApiOperation({ summary: 'Create a new brain dump with context and attachments' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: CreateBrainDumpDto })
	async create(
		@Body() body: CreateBrainDumpDto,
		@UploadedFiles() files?: Express.Multer.File[],
		@CurrentUser() user?: any,
	) {
		try {
			if (!user || !user.id) {
				throw new BadRequestException('User authentication required');
			}

			// Upload files to storage and collect file info
			const uploadedFiles: Array<{ key: string; originalName: string; mimeType: string; size: number }> = [];

			if (files && files.length > 0) {
				for (const file of files) {
					if (!file.buffer || file.buffer.length === 0) {
						continue;
					}

					// Generate unique key for the file
					const key = generateFileKey(file.originalname, 'braindump');

					// Upload to storage
					await this.storageService.uploadFile(
						file.buffer,
						key,
						undefined, // Use default bucket
						file.mimetype,
					);

					uploadedFiles.push({
						key,
						originalName: file.originalname,
						mimeType: file.mimetype,
						size: file.size,
					});

					this.logger.log(`File uploaded for brain dump: ${key}`);
				}
			}

			// Create brain dump with context and attachments
			const brainDump = await this.brainDumpService.create(user.id, body, uploadedFiles);

			return {
				success: true,
				message: 'Brain dump created successfully',
				data: brainDump,
			};
		} catch (error) {
			this.logger.error('Failed to create brain dump', error);
			throw error;
		}
	}

	/**
	 * Get all brain dumps (for current user) with pagination
	 */
	@Get()
	@ApiOperation({ summary: 'Get all brain dumps for current user with pagination' })
	async findAll(
		@CurrentUser() user?: any,
		@Query() paginationDto?: PaginationDto
	) {
		try {
			const userId = user?.id;
			const result = await this.brainDumpService.findAll(userId, {
				page: paginationDto?.page,
				limit: paginationDto?.limit,
			});

			return {
				data: result.data,
				message: 'OK',
				statusCode: 200,
				pages: result.pagination,
			};
		} catch (error) {
			this.logger.error('Failed to get brain dumps', error);
			throw error;
		}
	}

	/**
	 * Get a single brain dump by ID
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a brain dump by ID' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
		try {
			const userId = user?.id;
			const brainDump = await this.brainDumpService.findOne(id, userId);

			if (!brainDump) {
				throw new NotFoundException(`Brain dump with ID ${id} not found`);
			}

			return {
				success: true,
				data: brainDump,
			};
		} catch (error) {
			this.logger.error(`Failed to get brain dump ${id}`, error);
			throw error;
		}
	}

	/**
	 * Delete a brain dump
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a brain dump by ID' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async delete(@Param('id') id: string, @CurrentUser() user?: any) {
		try {
			if (!user || !user.id) {
				throw new BadRequestException('User authentication required');
			}

			const brainDump = await this.brainDumpService.delete(id, user.id);

			if (!brainDump) {
				throw new NotFoundException(`Brain dump with ID ${id} not found`);
			}

			return {
				success: true,
				message: 'Brain dump deleted successfully',
				data: brainDump,
			};
		} catch (error) {
			this.logger.error(`Failed to delete brain dump ${id}`, error);
			throw error;
		}
	}

	// ========== EVENT-DRIVEN PROCESSING ENDPOINTS ==========

	/**
	 * Queue brain dump for AI processing
	 */
	@Post(':id/process')
	@ApiOperation({ summary: 'Queue brain dump for AI processing' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async queueForProcessing(
		@Param('id') id: string,
		@CurrentUser() user?: any,
	) {
		try {
			if (!user || !user.id) {
				throw new BadRequestException('User authentication required');
			}

			await this.brainDumpService.publishForProcessing(id);

			return {
				success: true,
				message: 'Brain dump queued for processing',
				data: { id },
			};
		} catch (error) {
			this.logger.error(`Failed to queue brain dump ${id} for processing`, error);
			throw error;
		}
	}

	/**
	 * Get processing status (fast, from Redis)
	 */
	@Get(':id/status')
	@ApiOperation({ summary: 'Get brain dump processing status (fast polling endpoint)' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async getStatus(@Param('id') id: string) {
		try {
			const status = await this.brainDumpService.getJobStatus(id);

			if (!status) {
				throw new NotFoundException(`Brain dump with ID ${id} not found`);
			}

			return {
				success: true,
				data: status,
			};
		} catch (error) {
			this.logger.error(`Failed to get status for brain dump ${id}`, error);
			throw error;
		}
	}

	/**
	 * Get all asset statuses for a brain dump
	 */
	@Get(':id/assets/status')
	@ApiOperation({ summary: 'Get processing status of all assets in a brain dump' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async getAssetStatuses(@Param('id') id: string) {
		try {
			const statuses = await this.brainDumpService.getJobAssetStatuses(id);

			return {
				success: true,
				data: statuses,
			};
		} catch (error) {
			this.logger.error(`Failed to get asset statuses for brain dump ${id}`, error);
			throw error;
		}
	}

	/**
	 * Get individual asset status
	 */
	@Get('asset/:assetId/status')
	@ApiOperation({ summary: 'Get processing status of a specific asset' })
	@ApiParam({ name: 'assetId', description: 'Asset ID' })
	async getAssetStatus(@Param('assetId') assetId: string) {
		try {
			const status = await this.brainDumpService.getAssetStatus(assetId);

			if (!status) {
				throw new NotFoundException(`Asset with ID ${assetId} not found`);
			}

			return {
				success: true,
				data: status,
			};
		} catch (error) {
			this.logger.error(`Failed to get status for asset ${assetId}`, error);
			throw error;
		}
	}

	// ========== ATOMIC SPLIT ENDPOINTS ==========

	/**
	 * Get tasks with steps and tags for a brain dump (Atomic Split screen)
	 */
	@Get(':id/tasks')
	@ApiOperation({ summary: 'Get tasks with steps and tags for a brain dump (Atomic Split screen)' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async getBrainDumpTasks(
		@Param('id') id: string,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: AtomicSplitResponseDto }> {
		try {
			if (!user || !user.id) {
				throw new BadRequestException('User authentication required');
			}

			const result = await this.brainDumpService.getBrainDumpTasks(id, user.id);

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			this.logger.error(`Failed to get tasks for brain dump ${id}`, error);
			throw error;
		}
	}

	/**
	 * Upsert tasks for a brain dump (Atomic Split screen)
	 */
	@Put(':id/tasks')
	@ApiOperation({ summary: 'Create or update tasks for a brain dump (Atomic Split screen)' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	@ApiBody({ type: UpsertBrainDumpTasksDto })
	async upsertBrainDumpTasks(
		@Param('id') id: string,
		@Body() dto: UpsertBrainDumpTasksDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: AtomicSplitResponseDto }> {
		try {
			if (!user || !user.id) {
				throw new BadRequestException('User authentication required');
			}

			const result = await this.brainDumpService.upsertBrainDumpTasks(id, user.id, dto);

			return {
				success: true,
				message: 'Tasks updated successfully',
				data: result,
			};
		} catch (error) {
			this.logger.error(`Failed to upsert tasks for brain dump ${id}`, error);
			throw error;
		}
	}

	/**
	 * Reshuffle task priorities for a brain dump using AI
	 */
	@Post(':id/reshuffle-priorities')
	@ApiOperation({ summary: 'Reshuffle task priorities for a brain dump using AI' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async reshufflePriorities(
		@Param('id') id: string,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: { updatedCount: number } }> {
		try {
			if (!user || !user.id) {
				throw new BadRequestException('User authentication required');
			}

			const result = await this.taskPriorityService.reshufflePrioritiesByBraindumpId(id, user.id);

			return {
				success: true,
				message: `Successfully reshuffled priorities for ${result.updatedCount} tasks`,
				data: result,
			};
		} catch (error) {
			this.logger.error(`Failed to reshuffle priorities for brain dump ${id}`, error);
			throw error;
		}
	}

	/**
	 * Bulk create tasks for a brain dump
	 */
	@Post(':id/tasks/bulk')
	@ApiOperation({ summary: 'Bulk create tasks for a brain dump and link them to brain_dump_task table' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	@ApiBody({ type: BulkCreateTasksDto })
	async bulkCreateTasks(
		@Param('id') id: string,
		@Body() dto: BulkCreateTasksDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: BulkCreateTasksResponseDto }> {
		try {
			if (!user || !user.id) {
				throw new BadRequestException('User authentication required');
			}

			const result = await this.brainDumpService.bulkCreateTasks(id, user.id, dto);

			return {
				success: true,
				message: `Successfully created ${result.createdCount} tasks`,
				data: result,
			};
		} catch (error) {
			this.logger.error(`Failed to bulk create tasks for brain dump ${id}`, error);
			throw error;
		}
	}
}

