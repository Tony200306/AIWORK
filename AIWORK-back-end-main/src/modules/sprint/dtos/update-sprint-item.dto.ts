import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { SprintLane } from '@prisma/client';

export class UpdateSprintItemDto {
	@ApiPropertyOptional({
		enum: SprintLane,
		description: 'Lane/priority column for the task. Use with rank for drag & drop.',
		example: 'HIGH',
	})
	@IsOptional()
	@IsEnum(SprintLane)
	lane?: SprintLane;

	@ApiPropertyOptional({
		description: 'Position in the lane (0-indexed). Use with lane for drag & drop reorder.',
		example: 0,
	})
	@IsOptional()
	@IsNumber()
	rank?: number;

	@ApiPropertyOptional({
		description: 'Planned time in minutes',
		example: 60,
	})
	@IsOptional()
	@IsNumber()
	plannedMinutes?: number;

	@ApiPropertyOptional({
		description: 'Whether this is a buffer task',
		example: false,
	})
	@IsOptional()
	@IsBoolean()
	isBuffer?: boolean;

	@ApiPropertyOptional({
		description: 'Whether this task is starred/important',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	isStarred?: boolean;

	@ApiPropertyOptional({
		description: 'Whether to start this task next',
		example: false,
	})
	@IsOptional()
	@IsBoolean()
	startNext?: boolean;
}
