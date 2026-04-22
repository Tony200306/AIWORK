import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';

export class CreateStepDto {
	@ApiProperty({
		example: 'Clarify the objective',
		description: 'Step title',
	})
	@IsString()
	title: string;

	@ApiPropertyOptional({
		example: 'Define the main goal and expected outcome',
		description: 'Step description',
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		example: 0,
		description: 'Order index for the step (auto-calculated if not provided)',
	})
	@IsOptional()
	@IsInt()
	@Min(0)
	orderIndex?: number;

	@ApiPropertyOptional({
		example: 15,
		description: 'User estimated time in minutes',
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	userEstMinutes?: number;
}
