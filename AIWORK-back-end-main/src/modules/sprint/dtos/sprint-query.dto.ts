import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SprintWindowType } from '@prisma/client';

export class SprintQueryDto {
	@ApiPropertyOptional({
		description: 'Page number',
		example: 1,
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Items per page',
		example: 10,
		default: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	limit?: number = 10;

	@ApiPropertyOptional({
		description: 'Filter by active status',
		example: true,
	})
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional({
		enum: SprintWindowType,
		description: 'Filter by window type (TODAY, WEEK, BI_WEEKLY, MONTHLY, YEARLY)',
		example: 'WEEK',
	})
	@IsOptional()
	@IsEnum(SprintWindowType)
	windowType?: SprintWindowType;
}
