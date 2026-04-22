import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { SprintLane } from '@prisma/client';

export class AddSprintItemDto {
	@ApiProperty({
		description: 'Task ID to add to sprint',
		example: 'uuid-task-id',
	})
	@IsUUID()
	taskId: string;

	@ApiPropertyOptional({
		enum: SprintLane,
		description: 'Lane/priority column for the task',
		example: 'MEDIUM',
		default: 'LOW',
	})
	@IsOptional()
	@IsEnum(SprintLane)
	lane?: SprintLane;

	@ApiPropertyOptional({
		description: 'Planned time in minutes (overrides task estimate)',
		example: 45,
	})
	@IsOptional()
	@IsNumber()
	plannedMinutes?: number;

	@ApiPropertyOptional({
		description: 'Whether this is a buffer task',
		example: false,
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	isBuffer?: boolean;

	@ApiPropertyOptional({
		description: 'Whether this task is starred/important',
		example: false,
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	isStarred?: boolean;
}
