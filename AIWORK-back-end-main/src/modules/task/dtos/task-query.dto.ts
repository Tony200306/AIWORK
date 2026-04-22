import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsArray, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TaskStatus, TaskType, Priority } from '@prisma/client';

export class TaskQueryDto {
	@ApiPropertyOptional({
		example: 1,
		description: 'Page number (1-indexed)',
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		example: 10,
		description: 'Items per page',
		default: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 10;

	@ApiPropertyOptional({
		enum: TaskStatus,
		isArray: true,
		description: 'Filter by status (comma-separated for multi-select, e.g. TODO,IN_PROGRESS)',
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (typeof value === 'string') return value.split(',');
		if (Array.isArray(value)) return value;
		return [value];
	})
	@IsArray()
	@IsEnum(TaskStatus, { each: true })
	status?: TaskStatus[];

	@ApiPropertyOptional({
		enum: TaskType,
		description: 'Filter by task type (BACKLOG, STAGING, ACTIVE)',
	})
	@IsOptional()
	@IsEnum(TaskType)
	taskType?: TaskType;

	@ApiPropertyOptional({
		enum: Priority,
		isArray: true,
		description: 'Filter by priority (comma-separated for multi-select, e.g. LOW,HIGH,HIGHEST)',
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (typeof value === 'string') return value.split(',');
		if (Array.isArray(value)) return value;
		return [value];
	})
	@IsArray()
	@IsEnum(Priority, { each: true })
	priority?: Priority[];

	@ApiPropertyOptional({
		type: [String],
		description: 'Filter by tag IDs',
	})
	@IsOptional()
	@Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
	@IsArray()
	@IsUUID('4', { each: true })
	tagIds?: string[];

	@ApiPropertyOptional({
		example: '',
		description: 'Search in title and description',
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		enum: ['createdAt', 'dueAt', 'priority', 'expectedTimeHours', 'title', 'rank', 'status'],
		description: 'Sort by field',
		default: 'rank',
	})
	@IsOptional()
	@IsString()
	sortBy?: 'createdAt' | 'dueAt' | 'priority' | 'expectedTimeHours' | 'title' | 'rank' | 'status' = 'rank';

	@ApiPropertyOptional({
		enum: ['asc', 'desc'],
		description: 'Sort order',
		default: 'asc',
	})
	@IsOptional()
	@IsString()
	sortOrder?: 'asc' | 'desc' = 'asc';
}
