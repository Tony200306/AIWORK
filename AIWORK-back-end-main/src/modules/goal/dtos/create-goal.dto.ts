import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { GoalTier } from '@prisma/client';

export class CreateGoalDto {
	@ApiProperty({ enum: GoalTier, description: 'Goal tier (T1, T2, T3)' })
	@IsEnum(GoalTier)
	tier: GoalTier;

	@ApiPropertyOptional({ example: 1, description: 'Rank within tier (auto-computed if omitted)' })
	@IsOptional()
	@IsInt()
	@Min(1)
	rank?: number;

	@ApiProperty({ example: 'Launch advisory service', description: 'Goal title' })
	@IsString()
	title: string;

	@ApiPropertyOptional({ description: 'Goal description' })
	@IsOptional()
	@IsString()
	description?: string;
}
