import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsArray, IsUUID } from 'class-validator';
import { SprintWindowType } from '@prisma/client';

export class CreateSprintDto {
	@ApiPropertyOptional({
		description: 'Optional sprint name/title',
		example: 'Week 1 Sprint',
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiProperty({
		enum: SprintWindowType,
		description: 'Sprint window type (TODAY, WEEK, BI_WEEKLY, MONTHLY, YEARLY)',
		example: 'WEEK',
	})
	@IsEnum(SprintWindowType)
	windowType: SprintWindowType;

	@ApiProperty({
		description: 'Sprint start date',
		example: '2025-01-01',
	})
	@IsDateString()
	startDate: string;

	@ApiProperty({
		description: 'Sprint end date',
		example: '2025-01-07',
	})
	@IsDateString()
	endDate: string;

	@ApiPropertyOptional({
		description: 'Capacity in minutes (overrides user default)',
		example: 1890,
	})
	@IsOptional()
	@IsNumber()
	capacityMinutes?: number;

	@ApiPropertyOptional({
		description: 'List of task IDs to add to this sprint',
		example: ['uuid-1', 'uuid-2', 'uuid-3'],
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	taskIds?: string[];
}
