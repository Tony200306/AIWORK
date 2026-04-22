import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TaskService } from '../services/task.service';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { CreateStepDto } from '../dtos/create-step.dto';
import { UpdateStepDto, UpdateStepsDto } from '../dtos/update-step.dto';
import { TaskQueryDto } from '../dtos/task-query.dto';
import { AssignTagsDto } from '../dtos/assign-tags.dto';
import { BulkUpdateTasksDto, BulkUpdateTaskStatusesDto, BulkUpdateTaskRanksDto, BulkUpdateTasksFieldsDto, BulkDeleteTasksDto } from '../dtos/bulk-update-tasks.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TaskController {
	private readonly logger = new Logger(TaskController.name);

	constructor(private readonly taskService: TaskService) {}

	// ==================== TASK CRUD ====================

	/**
	 * Create a new task
	 */
	@Post()
	@ApiOperation({ summary: 'Create a new task with optional steps and tags' })
	async create(
		@Body() createTaskDto: CreateTaskDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const task = await this.taskService.create(user.id, createTaskDto);

		return {
			success: true,
			message: 'Task created successfully',
			data: task,
		};
	}

	/**
	 * Get all tasks with pagination and filtering
	 */
	@Get()
	@ApiOperation({ summary: 'Get all tasks for current user with pagination and filtering' })
	async findAll(
		@Query() query: TaskQueryDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.taskService.findAll(user.id, query);

		return {
			data: result.data,
			message: 'OK',
			statusCode: 200,
			pages: result.pagination,
		};
	}

	/**
	 * Get task summary stats
	 */
	@Get('summary')
	@ApiOperation({ summary: 'Get summary statistics for user tasks' })
	async getSummary(@CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const summary = await this.taskService.getSummary(user.id);

		return {
			success: true,
			data: summary,
		};
	}

	/**
	 * AI Prioritization placeholder
	 * TODO: Integrate with AI service
	 */
	@Post('prioritize')
	@ApiOperation({ summary: '[AI Placeholder] Prioritize tasks based on available time' })
	@ApiQuery({ name: 'availableMinutes', required: false, type: Number })
	async prioritize(
		@Query('availableMinutes') availableMinutes: number,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.taskService.prioritize(user.id, availableMinutes);

		return {
			success: true,
			data: result,
		};
	}

	// ==================== BULK OPERATIONS ====================
	// NOTE: Bulk routes MUST be defined before :id routes to avoid NestJS matching "bulk" as an :id parameter

	/**
	 * Bulk update task fields (status, rank, priority, type)
	 */
	@Patch('bulk')
	@ApiOperation({
		summary: 'Bulk update task fields',
		description: 'Update multiple fields (status, rank, priority, type) for multiple tasks at once. At least one field must be provided per task.',
	})
	async bulkUpdateFields(@Body() bulkUpdateDto: BulkUpdateTasksFieldsDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const tasks = await this.taskService.bulkUpdateFields(user.id, bulkUpdateDto.tasks);

		return {
			success: true,
			message: `${tasks.length} tasks updated successfully`,
			data: tasks,
		};
	}

	/**
	 * Bulk update task priorities
	 */
	@Patch('bulk/priorities')
	@ApiOperation({
		summary: 'Bulk update task priorities',
		description: 'Update priorities for multiple tasks at once. Designed for drag & drop with debounced updates.',
	})
	async bulkUpdatePriorities(@Body() bulkUpdateDto: BulkUpdateTasksDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const tasks = await this.taskService.bulkUpdatePriorities(user.id, bulkUpdateDto.tasks);

		return {
			success: true,
			message: `${tasks.length} tasks updated successfully`,
			data: tasks,
		};
	}

	/**
	 * Bulk update task statuses
	 */
	@Patch('bulk/statuses')
	@ApiOperation({
		summary: 'Bulk update task statuses',
		description: 'Update statuses for multiple tasks at once. Designed for drag & drop with debounced updates.',
	})
	async bulkUpdateStatuses(@Body() bulkUpdateDto: BulkUpdateTaskStatusesDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const tasks = await this.taskService.bulkUpdateStatuses(user.id, bulkUpdateDto.tasks);

		return {
			success: true,
			message: `${tasks.length} tasks updated successfully`,
			data: tasks,
		};
	}

	/**
	 * Bulk update task ranks (drag & drop reorder)
	 */
	@Patch('bulk/ranks')
	@ApiOperation({
		summary: 'Bulk update task ranks',
		description: 'Update ranks for multiple tasks at once. Designed for drag & drop reorder with debounced updates.',
	})
	async bulkUpdateRanks(@Body() bulkUpdateDto: BulkUpdateTaskRanksDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const tasks = await this.taskService.bulkUpdateRanks(user.id, bulkUpdateDto.tasks);

		return {
			success: true,
			message: `${tasks.length} tasks updated successfully`,
			data: tasks,
		};
	}

	/**
	 * Bulk delete tasks
	 */
	@Delete('bulk')
	@ApiOperation({
		summary: 'Bulk delete tasks',
		description: 'Delete multiple tasks at once by providing an array of task IDs.',
	})
	async bulkDelete(@Body() bulkDeleteDto: BulkDeleteTasksDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const count = await this.taskService.bulkDelete(user.id, bulkDeleteDto.taskIds);

		return {
			success: true,
			message: `${count} tasks deleted successfully`,
		};
	}

	// ==================== SINGLE TASK BY ID ====================

	/**
	 * Get a single task
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a task by ID with steps and tags' })
	@ApiParam({ name: 'id', description: 'Task ID' })
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const task = await this.taskService.findOne(id, user.id);

		return {
			success: true,
			data: task,
		};
	}

	/**
	 * Update a task
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Update a task' })
	@ApiParam({ name: 'id', description: 'Task ID' })
	async update(
		@Param('id') id: string,
		@Body() updateTaskDto: UpdateTaskDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const task = await this.taskService.update(id, user.id, updateTaskDto);

		return {
			success: true,
			message: 'Task updated successfully',
			data: task,
		};
	}

	/**
	 * Delete a task
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a task' })
	@ApiParam({ name: 'id', description: 'Task ID' })
	async delete(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.taskService.delete(id, user.id);

		return {
			success: true,
			message: 'Task deleted successfully',
		};
	}

	// ==================== STEP CRUD ====================

	/**
	 * Add a step to a task
	 */
	@Post(':taskId/steps')
	@ApiOperation({ summary: 'Add a step to a task' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	async addStep(
		@Param('taskId') taskId: string,
		@Body() createStepDto: CreateStepDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const step = await this.taskService.addStep(taskId, user.id, createStepDto);

		return {
			success: true,
			message: 'Step added successfully',
			data: step,
		};
	}

	/**
	 * Update a step (supports properties update and reorder via orderIndex)
	 */
	@Patch(':taskId/steps/:stepId')
	@ApiOperation({
		summary: 'Update a step (supports reorder)',
		description:
			'Update step properties. For drag & drop reorder, pass orderIndex. Uses transaction-safe "parking index" pattern for concurrent safety.',
	})
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiParam({ name: 'stepId', description: 'Step ID' })
	async updateStep(
		@Param('taskId') taskId: string,
		@Param('stepId') stepId: string,
		@Body() updateStepDto: UpdateStepDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const step = await this.taskService.updateStep(taskId, stepId, user.id, updateStepDto);

		return {
			success: true,
			message: 'Step updated successfully',
			data: step,
		};
	}

	/**
	 * Batch update steps (Update properties and Reorder multiple steps at once)
	 */
	@Patch(':taskId/steps') // <--- THAY ĐỔI 1: Bỏ :stepId
	@ApiOperation({
		summary: 'Batch update steps (Support Drag & Drop Reorder)',
		description:
			'Update multiple steps at once. Perfect for Drag & Drop. Sends a list of steps with new orderIndex and properties. Uses "Flush & Overwrite" strategy.',
	})
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiBody({ type: UpdateStepsDto }) // Explicitly type for Swagger
	async updateSteps(
		@Param('taskId') taskId: string,
		@Body() batchDto: UpdateStepsDto, // <--- THAY ĐỔI 3: Dùng DTO mảng
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}
		// <--- THAY ĐỔI 4: Gọi hàm service batchUpdateSteps
		const updatedSteps = await this.taskService.updateSteps(taskId, user.id, batchDto);

		return {
			success: true,
			message: `${updatedSteps.length} steps updated successfully`,
			data: updatedSteps,
		};
	}

	/**
	 * Delete a step
	 */
	@Delete(':taskId/steps/:stepId')
	@ApiOperation({ summary: 'Delete a step from a task' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiParam({ name: 'stepId', description: 'Step ID' })
	async deleteStep(
		@Param('taskId') taskId: string,
		@Param('stepId') stepId: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.taskService.deleteStep(taskId, stepId, user.id);

		return {
			success: true,
			message: 'Step deleted successfully',
		};
	}

	// ==================== TAG ASSIGNMENT ====================

	/**
	 * Assign tags to a task
	 */
	@Post(':taskId/tags')
	@ApiOperation({ summary: 'Assign tags to a task (replaces existing tags)' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	async assignTags(
		@Param('taskId') taskId: string,
		@Body() assignTagsDto: AssignTagsDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const task = await this.taskService.assignTags(taskId, user.id, assignTagsDto.tagIds);

		return {
			success: true,
			message: 'Tags assigned successfully',
			data: task,
		};
	}

	/**
	 * Remove a tag from a task
	 */
	@Delete(':taskId/tags/:tagId')
	@ApiOperation({ summary: 'Remove a tag from a task' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	@ApiParam({ name: 'tagId', description: 'Tag ID' })
	async removeTag(
		@Param('taskId') taskId: string,
		@Param('tagId') tagId: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.taskService.removeTag(taskId, tagId, user.id);

		return {
			success: true,
			message: 'Tag removed successfully',
		};
	}

	// ==================== AI PLACEHOLDERS ====================

	/**
	 * AI Re-split placeholder
	 * TODO: Integrate with AI service
	 */
	@Post(':taskId/resplit')
	@ApiOperation({ summary: '[AI Placeholder] Re-split task into steps using AI' })
	@ApiParam({ name: 'taskId', description: 'Task ID' })
	async resplit(
		@Param('taskId') taskId: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.taskService.resplit(taskId, user.id);

		return {
			success: true,
			data: result,
		};
	}
}
