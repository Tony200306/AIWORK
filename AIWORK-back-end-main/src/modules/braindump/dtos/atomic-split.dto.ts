import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
	IsOptional,
	IsNumber,
	IsArray,
	IsBoolean,
	IsUUID,
	ValidateNested,
	Min,
	IsDateString,
	IsEnum,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ScopeFullDto } from '../interfaces/job-message.interface';
import { TaskType } from '@prisma/client';
// ========== RESPONSE DTOs ==========

/**
 * Tag response for Atomic Split screen
 */
export class AtomicSplitTagDto {
	@ApiProperty({ description: 'Tag ID' })
	id: string;

	@ApiProperty({ description: 'Tag name' })
	name: string;

	@ApiPropertyOptional({ description: 'Tag color' })
	color?: string;

	@ApiPropertyOptional({ description: 'Whether this is the primary tag' })
	isPrimary?: boolean;
}

/**
 * Step response for Atomic Split screen
 */
export class AtomicSplitStepDto {
	@ApiProperty({ description: 'Step ID' })
	id: string;

	@ApiProperty({ description: 'Step title' })
	title: string;

	@ApiPropertyOptional({ description: 'Step description' })
	description?: string;

	@ApiProperty({ description: 'Order index' })
	orderIndex: number;

	@ApiPropertyOptional({ description: 'System estimated minutes' })
	sysEstMinutes?: number;

	@ApiPropertyOptional({ description: 'User estimated minutes' })
	userEstMinutes?: number;

	@ApiPropertyOptional({ description: 'Whether step is done' })
	isDone?: boolean;

	@ApiPropertyOptional({ description: 'Difficulty level (1-5)' })
	difficulty?: number;

	@ApiPropertyOptional({ description: 'Contribution weight' })
	contributionWeight?: number;
}

/**
 * Task response for Atomic Split screen (includes steps and tags)
 */
export class AtomicSplitTaskDto {
	@ApiProperty({ description: 'Task ID' })
	id: string;

	@ApiProperty({ description: 'Task title' })
	title: string;

	@ApiPropertyOptional({ description: 'Task description' })
	description?: string;

	@ApiPropertyOptional({ description: 'Expected time in hours' })
	expectedTimeHours?: number;

	@ApiPropertyOptional({ description: 'Due date' })
	dueAt?: Date;

	@ApiProperty({ description: 'Task status' })
	status: string;

	@ApiProperty({ description: 'Task priority' })
	priority: string;

	@ApiPropertyOptional({ description: 'Task type', enum: ['BACKLOG', 'STAGING', 'ACTIVE'] })
	taskType?: string;

	@ApiProperty({ description: 'Order index in braindump', type: Number, nullable: true })
	orderIndex?: number;

	@ApiProperty({ description: 'Steps for this task', type: [AtomicSplitStepDto] })
	steps: AtomicSplitStepDto[];

	@ApiProperty({ description: 'Tags for this task', type: [AtomicSplitTagDto] })
	tags: AtomicSplitTagDto[];
}

/**
 * Response DTO for GET braindump tasks
 */
export class AtomicSplitResponseDto {
	@ApiProperty({ description: 'Braindump ID' })
	braindumpId: string;

	@ApiProperty({ description: 'Braindump status' })
	status: string;

	@ApiPropertyOptional({ description: 'Original context text' })
	contextText?: string;

	@ApiProperty({ description: 'Tasks generated from braindump', type: [AtomicSplitTaskDto] })
	tasks: AtomicSplitTaskDto[];
}

// ========== REQUEST DTOs (for upsert) ==========

/**
 * Step input for upsert operation
 */
export class UpsertStepDto {
	@ApiPropertyOptional({ description: 'Step ID (omit for new step)' })
	@IsOptional()
	@IsUUID()
	id?: string;

	@ApiProperty({ description: 'Step title' })
	@IsString()
	title: string;

	@ApiPropertyOptional({ description: 'Step description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ description: 'Order index' })
	@IsNumber()
	@Min(0)
	orderIndex: number;

	@ApiPropertyOptional({ description: 'System estimated minutes' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	sysEstMinutes?: number;

	@ApiPropertyOptional({ description: 'User estimated minutes' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	userEstMinutes?: number;

	@ApiPropertyOptional({ description: 'Whether step is done' })
	@IsOptional()
	@IsBoolean()
	isDone?: boolean;

	@ApiPropertyOptional({ description: 'Difficulty level (1-5)' })
	@IsOptional()
	@IsNumber()
	@Min(1)
	difficulty?: number;


}

/**
 * Tag input for upsert operation
 */
export class UpsertTagDto {
	@ApiPropertyOptional({ description: 'Tag ID (if existing tag)' })
	@IsOptional()
	@IsUUID()
	id?: string;

	@ApiProperty({ description: 'Tag name' })
	@IsString()
	name: string;

	@ApiPropertyOptional({ description: 'Whether this is the primary tag' })
	@IsOptional()
	@IsBoolean()
	isPrimary?: boolean;


	@ApiPropertyOptional({ description: 'Contribution weight' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	contributionWeight?: number;
}

/**
 * Task input for upsert operation
 */
export class UpsertTaskDto {
	@ApiPropertyOptional({ description: 'Task ID (omit for new task)' })
	@IsOptional()
	@IsUUID()
	id?: string;

	@ApiProperty({ description: 'Task title' })
	@IsString()
	title: string;

	@ApiPropertyOptional({ description: 'Task description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ description: 'Expected time in hours' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	expectedTimeHours?: number;

	@ApiPropertyOptional({ description: 'Due date (ISO string)' })
	@IsOptional()
	@IsDateString()
	dueAt?: string;

	@ApiPropertyOptional({ description: 'Order index in braindump task list' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	orderIndex?: number;

	@ApiPropertyOptional({ description: 'Steps for this task', type: [UpsertStepDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpsertStepDto)
	steps?: UpsertStepDto[];

	@ApiPropertyOptional({ description: 'Tags for this task', type: [UpsertTagDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpsertTagDto)
	tags?: UpsertTagDto[];
}

/**
 * Request DTO for upserting braindump tasks
 */
export class UpsertBrainDumpTasksDto {
	@ApiProperty({ description: 'Tasks to create or update', type: [UpsertTaskDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpsertTaskDto)
	tasks: UpsertTaskDto[];
}

// ========== BULK TASK CREATION DTOs ==========

/**
 * Single task input for bulk creation
 */
export class BulkCreateTaskDto {
	@ApiProperty({ description: 'Task title' })
	@IsString()
	title: string;

	@ApiPropertyOptional({ description: 'Task description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ description: 'Task type' })
	@IsOptional()
	@IsEnum(TaskType)
	taskType?: TaskType;

	@ApiPropertyOptional({ description: 'Expected time in hours' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	expectedTimeHours?: number;

	@ApiPropertyOptional({ description: 'Due date (ISO string)' })
	@IsOptional()
	@IsDateString()
	dueAt?: string;

	@ApiPropertyOptional({ description: 'Order index in braindump task list' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	orderIndex?: number;

	@ApiPropertyOptional({ description: 'Steps for this task', type: [UpsertStepDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpsertStepDto)
	steps?: UpsertStepDto[];

	@ApiPropertyOptional({ description: 'Tags for this task', type: [UpsertTagDto] })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpsertTagDto)
	tags?: UpsertTagDto[];

	@ApiPropertyOptional({ description: 'Scope details', type: ScopeFullDto })
	@IsOptional()
	@ValidateNested()
	@Type(() => ScopeFullDto)
	scope?: ScopeFullDto;
}

/**
 * Request DTO for bulk creating tasks from braindump
 */
export class BulkCreateTasksDto {
	@ApiProperty({ description: 'Tasks to create in bulk', type: [BulkCreateTaskDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => BulkCreateTaskDto)
	tasks: BulkCreateTaskDto[];
}

/**
 * Response DTO for bulk task creation
 */
export class BulkCreateTasksResponseDto {
	@ApiProperty({ description: 'Braindump ID' })
	braindumpId: string;

	@ApiProperty({ description: 'Number of tasks created' })
	createdCount: number;

	@ApiProperty({ description: 'Created task IDs', type: [String] })
	taskIds: string[];

	@ApiProperty({ description: 'Tasks with full details', type: [AtomicSplitTaskDto] })
	tasks: AtomicSplitTaskDto[];
}
