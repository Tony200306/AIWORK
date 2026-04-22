import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsBoolean, Min, IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';

export class UpdateStepDto {
	@ApiPropertyOptional({
		example: 'Clarify the objective',
		description: 'Step title',
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({
		example: 'Define the main goal and expected outcome',
		description: 'Step description',
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		example: 2,
		description: 'Position in the step list (0-indexed). For drag & drop reorder.',
	})
	@IsOptional()
	@IsNumber()
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

	@ApiPropertyOptional({
		example: false,
		description: 'Whether the step is completed',
	})
	@IsOptional()
	@IsBoolean()
	isDone?: boolean;
}


export class BatchUpdateStepsDto {
	@ApiPropertyOptional({
		example: '550e8400-e29b-41d4-a716-446655440000',
		description: 'Step ID',
	})
	@IsUUID()
	id: string;

	@ApiPropertyOptional({
		example: 'Clarify the objective',
		description: 'Step title',
	})
	@IsString()
	@IsOptional()
	title?: string;

	@ApiPropertyOptional({
		example: 'Define the main goal and expected outcome',
		description: 'Step description',
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		example: 15,
		description: 'User estimated time in minutes',
	})
	@IsNumber()
	@IsOptional()
	userEstMinutes?: number;

	@ApiPropertyOptional({
		example: 10,
		description: 'System estimated time in minutes',
	})
	@IsNumber()
	@IsOptional()
	sysEstMinutes?: number;

	@ApiPropertyOptional({
		example: false,
		description: 'Whether the step is completed',
	})
	@IsBoolean()
	@IsOptional()
	isDone?: boolean;

	@ApiPropertyOptional({
		example: 0,
		description: 'Position in the step list (0-indexed)',
	})
	@IsInt()
	orderIndex: number;
}
export class UpdateStepsDto {
	@ApiPropertyOptional({
		type: [BatchUpdateStepsDto],
		example: [
			{
				id: '8be7ffd5-87d5-4dea-a2ba-6035483eca24',
				title: 'new this',
				description: 'Define the main goal',
				userEstMinutes: 25,
				isDone: false,
			},
			{
				id: '409120fe-110a-4881-849c-31a71d7ee553',
				title: 'new this 2 ',
				userEstMinutes: 30,
				isDone: true,
			},
		],
		description: 'Array of steps to update with their new positions and properties',
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => BatchUpdateStepsDto)
	steps: BatchUpdateStepsDto[];
}