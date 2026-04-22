import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateSprintDto {
	@ApiPropertyOptional({
		description: 'Sprint name/title',
		example: 'Week 1 Sprint',
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({
		description: 'Capacity in minutes',
		example: 1890,
	})
	@IsOptional()
	@IsNumber()
	capacityMinutes?: number;

	@ApiPropertyOptional({
		description: 'Whether the sprint is active',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
