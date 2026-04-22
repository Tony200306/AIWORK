import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskType, Priority } from '@prisma/client';
import { CreateStepDto } from './create-step.dto';

export class CreateTaskDto {
	@ApiProperty({
		example: 'Write proposal follow-up email',
		description: 'Task title',
	})
	@IsString()
	title: string;

	@ApiPropertyOptional({
		example: 'Follow up with the client about the proposal sent last week',
		description: 'Task description',
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		example: 1.5,
		description: 'Expected time in hours',
	})
	@IsOptional()
	@IsNumber()
	expectedTimeHours?: number;

	@ApiPropertyOptional({
		enum: TaskStatus,
		default: TaskStatus.TODO,
		description: 'Task status',
	})
	@IsOptional()
	@IsEnum(TaskStatus)
	status?: TaskStatus;

	@ApiPropertyOptional({
		enum: TaskType,
		default: TaskType.BACKLOG,
		description: 'Task type (BACKLOG, STAGING, ACTIVE)',
	})
	@IsOptional()
	@IsEnum(TaskType)
	taskType?: TaskType;

	@ApiPropertyOptional({
		enum: Priority,
		default: Priority.MEDIUM,
		description: 'Task priority',
	})
	@IsOptional()
	@IsEnum(Priority)
	priority?: Priority;

	@ApiPropertyOptional({
		example: '2024-12-31T23:59:59Z',
		description: 'Due date',
	})
	@IsOptional()
	@IsDateString()
	dueAt?: string;

	@ApiPropertyOptional({
		description: 'Goal ID to link task to',
	})
	@IsOptional()
	@IsUUID('4')
	goalId?: string;

	@ApiPropertyOptional({
		type: [String],
		description: 'Array of tag IDs to assign',
	})
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	tagIds?: string[];

	@ApiPropertyOptional({
		type: [CreateStepDto],
		description: 'Initial steps to create with the task',
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateStepDto)
	steps?: CreateStepDto[];
}
