import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { TaskStatus, TaskType, Priority } from '@prisma/client';

export class UpdateTaskDto {
	@ApiPropertyOptional({
		example: 'Write proposal follow-up email',
		description: 'Task title',
	})
	@IsOptional()
	@IsString()
	title?: string;

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
		description: 'Task status',
	})
	@IsOptional()
	@IsEnum(TaskStatus)
	status?: TaskStatus;

	@ApiPropertyOptional({
		enum: TaskType,
		description: 'Task type (BACKLOG, STAGING, ACTIVE)',
	})
	@IsOptional()
	@IsEnum(TaskType)
	taskType?: TaskType;

	@ApiPropertyOptional({
		enum: Priority,
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
		description: 'Client ID to link task to',
	})
	@IsOptional()
	@IsUUID('4')
	clientId?: string;
}
