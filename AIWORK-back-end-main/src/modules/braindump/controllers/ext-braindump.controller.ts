import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Body,
	Param,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtBrainDumpService } from '../services/ext-braindump.service';
import { CreateExtBrainDumpDto } from '../dtos/create-ext-braindump.dto';
import { AtomicSplitResponseDto, BulkCreateTasksDto, BulkCreateTasksResponseDto } from '../dtos/atomic-split.dto';
import { BulkUpdateTaskStatusesDto, BulkUpdateTasksDto, BulkUpdateTasksFieldsDto } from '@modules/task/dtos/bulk-update-tasks.dto';
import { UpdateStepDto, UpdateStepsDto } from '@modules/task/dtos/update-step.dto';
import { CreateStepDto } from '@modules/task/dtos/create-step.dto';
import { Public } from '@decorators/public.decorator';

/**
 * External BrainDump Controller - handles public HTTP requests (no authentication required)
 */
@ApiTags('External BrainDump')
@Controller('ext-braindump')
export class ExtBrainDumpController {
	private readonly logger = new Logger(ExtBrainDumpController.name);

	constructor(
		private readonly extBrainDumpService: ExtBrainDumpService,
	) {}

	/**
	 * Create a new brain dump with text context only (public endpoint)
	 * No file attachments, no authentication required
	 */
	@Public()
	@Post()
	@ApiOperation({ summary: 'Create a new brain dump with text context (public endpoint)' })
	@ApiBody({ type: CreateExtBrainDumpDto })
	async create(
		@Body() body: CreateExtBrainDumpDto,
	) {
		try {
			console.log('Creating brain dump with body:', body);
			// Create brain dump with text context only
			const brainDump = await this.extBrainDumpService.create(body);

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
	 * Get tasks with steps and tags for a brain dump (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Get(':id/tasks')
	@ApiOperation({ summary: 'Get tasks with steps and tags for a brain dump (public endpoint)' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	async getBrainDumpTasks(
		@Param('id') id: string,
	): Promise<{ success: boolean; data: AtomicSplitResponseDto }> {
		try {
			const result = await this.extBrainDumpService.getBrainDumpTasks(id);

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			this.logger.error(`Failed to get tasks for brain dump ${id}`, error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw error;
		}
	}

	/**
	 * Bulk create tasks for a brain dump (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Post(':id/tasks/bulk')
	@ApiOperation({ summary: 'Bulk create tasks for a brain dump (public endpoint)' })
	@ApiParam({ name: 'id', description: 'Brain dump ID' })
	@ApiBody({ type: BulkCreateTasksDto })
	async bulkCreateTasks(
		@Param('id') id: string,
		@Body() dto: BulkCreateTasksDto,
	): Promise<{ success: boolean; message: string; data: BulkCreateTasksResponseDto }> {
		try {
			const result = await this.extBrainDumpService.bulkCreateTasks(id, dto);

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

	/**
	 * Bulk update task statuses (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Patch('tasks/statuses')
	@ApiOperation({ summary: 'Bulk update task statuses (public endpoint)' })
	@ApiBody({ type: BulkUpdateTaskStatusesDto })
	async bulkUpdateStatuses(
		@Body() bulkUpdateDto: BulkUpdateTaskStatusesDto,
	) {
		try {
			const tasks = await this.extBrainDumpService.bulkUpdateStatuses(bulkUpdateDto.tasks);

			return {
				success: true,
				message: `${tasks.length} tasks updated successfully`,
				data: tasks,
			};
		} catch (error) {
			this.logger.error('Failed to bulk update task statuses', error);
			throw error;
		}
	}

	/**
	 * Bulk update task priorities (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Patch('tasks/priorities')
	@ApiOperation({
		summary: 'Bulk update task priorities (public endpoint)',
		description: 'Update priorities for multiple tasks at once. Designed for drag & drop with debounced updates.',
	})
	@ApiBody({ type: BulkUpdateTasksDto })
	async bulkUpdatePriorities(
		@Body() bulkUpdateDto: BulkUpdateTasksDto,
	) {
		try {
			const tasks = await this.extBrainDumpService.bulkUpdatePriorities(bulkUpdateDto.tasks);

			return {
				success: true,
				message: `${tasks.length} tasks updated successfully`,
				data: tasks,
			};
		} catch (error) {
			this.logger.error('Failed to bulk update task priorities', error);
			throw error;
		}
	}

	/**
	 * Bulk update task fields (status, rank, priority, type) (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Patch('tasks/bulk')
	@ApiOperation({
		summary: 'Bulk update task fields (public endpoint)',
		description: 'Update multiple fields (status, rank, priority, type) for multiple tasks at once. At least one field must be provided per task.',
	})
	@ApiBody({ type: BulkUpdateTasksFieldsDto })
	async bulkUpdateFields(
		@Body() bulkUpdateDto: BulkUpdateTasksFieldsDto,
	) {
		try {
			const tasks = await this.extBrainDumpService.bulkUpdateFields(bulkUpdateDto.tasks);

			return {
				success: true,
				message: `${tasks.length} tasks updated successfully`,
				data: tasks,
			};
		} catch (error) {
			this.logger.error('Failed to bulk update task fields', error);
			throw error;
		}
	}

	/**
	 * Add a step to a task (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Post('tasks/:taskId/steps')
	@ApiOperation({ summary: 'Add a step to a task (public endpoint)' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiBody({ type: CreateStepDto })
	async addStep(
		@Param('taskId') taskId: string,
		@Body() createStepDto: CreateStepDto,
	) {
		try {
			const step = await this.extBrainDumpService.addStep(taskId, createStepDto);

			return {
				success: true,
				message: 'Step added successfully',
				data: step,
			};
		} catch (error) {
			this.logger.error(`Failed to add step to task ${taskId}`, error);
			throw error;
		}
	}

	/**
	 * Update a single step (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Patch('tasks/:taskId/steps/:stepId')
	@ApiOperation({ summary: 'Update a step (public endpoint)' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiParam({ name: 'stepId', description: 'Step ID' })
	@ApiBody({ type: UpdateStepDto })
	async updateStep(
		@Param('taskId') taskId: string,
		@Param('stepId') stepId: string,
		@Body() updateStepDto: UpdateStepDto,
	) {
		try {
			const step = await this.extBrainDumpService.updateStep(taskId, stepId, updateStepDto);

			return {
				success: true,
				message: 'Step updated successfully',
				data: step,
			};
		} catch (error) {
			this.logger.error(`Failed to update step ${stepId}`, error);
			throw error;
		}
	}

	/**
	 * Batch update steps (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Patch('tasks/:taskId/steps')
	@ApiOperation({
		summary: 'Batch update steps (public endpoint)',
		description: 'Update multiple steps at once. Perfect for Drag & Drop.',
	})
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiBody({ type: UpdateStepsDto })
	async updateSteps(
		@Param('taskId') taskId: string,
		@Body() batchDto: UpdateStepsDto,
	) {
		try {
			const updatedSteps = await this.extBrainDumpService.updateSteps(taskId, batchDto);

			return {
				success: true,
				message: `${updatedSteps.length} steps updated successfully`,
				data: updatedSteps,
			};
		} catch (error) {
			this.logger.error(`Failed to batch update steps for task ${taskId}`, error);
			throw error;
		}
	}

	/**
	 * Delete a step from a task (public endpoint)
	 * No authentication required
	 */
	@Public()
	@Delete('tasks/:taskId/steps/:stepId')
	@ApiOperation({ summary: 'Delete a step from a task (public endpoint)' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiParam({ name: 'stepId', description: 'Step ID' })
	async deleteStep(
		@Param('taskId') taskId: string,
		@Param('stepId') stepId: string,
	) {
		try {
			await this.extBrainDumpService.deleteStep(taskId, stepId);

			return {
				success: true,
				message: 'Step deleted successfully',
			};
		} catch (error) {
			this.logger.error(`Failed to delete step ${stepId}`, error);
			throw error;
		}
	}
}
