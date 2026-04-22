import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsInt, IsArray, ValidateNested, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Priority, TaskStatus, TaskType } from '@prisma/client';

/**
 * Single task priority update in bulk operation
 */
export class BulkUpdateTaskDto {
	@ApiProperty({
		description: 'Task ID to update',
		example: 'uuid-task-id',
	})
	@IsUUID()
	taskId: string;

	@ApiProperty({
		enum: Priority,
		description: 'New priority for this task',
		example: 'HIGH',
	})
	@IsEnum(Priority)
	priority: Priority;
}

/**
 * Request DTO for bulk updating task priorities
 */
export class BulkUpdateTasksDto {
	@ApiProperty({
		description: 'Array of tasks to update with new priorities',
		type: [BulkUpdateTaskDto],
		minItems: 1,
	})
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => BulkUpdateTaskDto)
	tasks: BulkUpdateTaskDto[];
}

/**
 * Single task status update in bulk operation
 */
export class BulkUpdateTaskStatusDto {
	@ApiProperty({
		description: 'Task ID to update',
		example: 'uuid-task-id',
	})
	@IsUUID()
	taskId: string;

	@ApiProperty({
		enum: TaskStatus,
		description: 'New status for this task',
		example: 'DOING',
	})
	@IsEnum(TaskStatus)
	status: TaskStatus;
}

/**
 * Request DTO for bulk updating task statuses
 */
export class BulkUpdateTaskStatusesDto {
	@ApiProperty({
		description: 'Array of tasks to update with new statuses',
		type: [BulkUpdateTaskStatusDto],
		minItems: 1,
	})
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => BulkUpdateTaskStatusDto)
	tasks: BulkUpdateTaskStatusDto[];
}

/**
 * Single task rank update in bulk operation
 */
export class BulkUpdateTaskRankDto {
	@ApiProperty({
		description: 'Task ID to update',
		example: 'uuid-task-id',
	})
	@IsUUID()
	taskId: string;

	@ApiProperty({
		description: 'New rank (position) for this task',
		example: 0,
	})
	@IsInt()
	rank: number;
}

/**
 * Request DTO for bulk updating task ranks (drag & drop reorder)
 */
export class BulkUpdateTaskRanksDto {
	@ApiProperty({
		description: 'Array of tasks to update with new ranks',
		type: [BulkUpdateTaskRankDto],
		minItems: 1,
	})
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => BulkUpdateTaskRankDto)
	tasks: BulkUpdateTaskRankDto[];
}

/**
 * Single task update in bulk operation (supports status, rank, priority, type)
 */
export class BulkUpdateTaskFieldsDto {
	@ApiProperty({
		description: 'Task ID to update',
		example: 'uuid-task-id',
	})
	@IsUUID()
	taskId: string;

	@ApiProperty({
		enum: TaskStatus,
		description: 'New status for this task',
		example: 'DOING',
		required: false,
	})
	@IsEnum(TaskStatus)
	@IsOptional()
	status?: TaskStatus;

	@ApiProperty({
		description: 'New rank (position) for this task',
		example: 0,
		required: false,
	})
	@IsInt()
	@IsOptional()
	rank?: number;

	@ApiProperty({
		enum: Priority,
		description: 'New priority for this task',
		example: 'HIGH',
		required: false,
	})
	@IsEnum(Priority)
	@IsOptional()
	priority?: Priority;

	@ApiProperty({
		enum: TaskType,
		description: 'New task type for this task',
		example: 'BACKLOG',
		required: false,
	})
	@IsEnum(TaskType)
	@IsOptional()
	taskType?: TaskType;

	@ApiProperty({
		description: 'Sprint ID to assign this task to (only applies when taskType is ACTIVE). If SprintItem already exists for this task, its sprintId will be updated.',
		example: 'uuid-sprint-id',
		required: false,
	})
	@IsUUID()
	@IsOptional()
	sprintId?: string;
}

/**
 * Request DTO for bulk updating task fields (status, rank, priority, type)
 * At least one field must be provided per task
 */
export class BulkUpdateTasksFieldsDto {
	@ApiProperty({
		description: 'Array of tasks to update with various fields',
		type: [BulkUpdateTaskFieldsDto],
		minItems: 1,
	})
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => BulkUpdateTaskFieldsDto)
	tasks: BulkUpdateTaskFieldsDto[];
}

/**
 * Request DTO for bulk deleting tasks
 */
export class BulkDeleteTasksDto {
	@ApiProperty({
		description: 'Array of task IDs to delete',
		example: ['uuid-task-id-1', 'uuid-task-id-2'],
		minItems: 1,
	})
	@IsArray()
	@ArrayMinSize(1)
	@IsUUID('4', { each: true })
	taskIds: string[];
}
