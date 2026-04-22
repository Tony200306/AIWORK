import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsString,
	IsOptional,
	IsArray,
	IsEnum,
	ValidateNested,
} from 'class-validator';
import { OnboardingQuestionDto } from './onboarding-braindump.dto';
import {
	GoalTier,
	ClientRevenueRange,
	ClientRelationshipState,
	ClientDisposition,
	ValueEnum,
} from '@prisma/client';

// ========== Request DTO ==========

export class DirectClientInputDto {
	@ApiProperty({ example: 'TechVentures Inc' })
	@IsString()
	name: string;

	@ApiPropertyOptional({ enum: ClientRevenueRange })
	@IsOptional()
	@IsEnum(ClientRevenueRange)
	revenueRange?: ClientRevenueRange;

	@ApiPropertyOptional({ enum: ClientRelationshipState })
	@IsOptional()
	@IsEnum(ClientRelationshipState)
	relationshipState?: ClientRelationshipState;
}

export class ExtractProfileInputDto {
	@ApiProperty({
		type: [OnboardingQuestionDto],
		description:
			'List of onboarding questions and answers (used for AI goal extraction)',
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OnboardingQuestionDto)
	questions: OnboardingQuestionDto[];

	@ApiPropertyOptional({ description: 'User query / context' })
	@IsOptional()
	@IsString()
	query?: string;

	@ApiPropertyOptional({
		type: DirectClientInputDto,
		description:
			'Client data directly from onboarding form (no AI needed)',
	})
	@IsOptional()
	@ValidateNested()
	@Type(() => DirectClientInputDto)
	client?: DirectClientInputDto;

	@ApiPropertyOptional({
		enum: ValueEnum,
		isArray: true,
		description:
			'Top 3 values picked directly from onboarding form (no AI needed)',
	})
	@IsOptional()
	@IsArray()
	@IsEnum(ValueEnum, { each: true })
	values?: ValueEnum[];
}

// ========== Response DTOs ==========

export class ExtractedGoalDto {
	@ApiPropertyOptional({
		description: 'Goal ID (set after persistence)',
	})
	id?: string;

	@ApiProperty({ example: 'Launch advisory service' })
	title: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty({ enum: GoalTier })
	tier: GoalTier;

	@ApiProperty()
	rank: number;

	@ApiProperty()
	confidence: number;
}

export class ExtractedClientDto {
	@ApiPropertyOptional({
		description: 'Client ID (set after persistence)',
	})
	id?: string;

	@ApiProperty({ example: 'TechCorp' })
	name: string;

	@ApiPropertyOptional({ enum: ClientRevenueRange })
	revenueRange?: ClientRevenueRange;

	@ApiPropertyOptional({ enum: ClientRelationshipState })
	relationshipState?: ClientRelationshipState;

	@ApiPropertyOptional({ enum: ClientDisposition })
	disposition?: ClientDisposition;

	@ApiPropertyOptional()
	clientWeight?: number;
}

export class ExtractProfileOutputDto {
	@ApiProperty({ type: [ExtractedGoalDto] })
	goals: ExtractedGoalDto[];

	@ApiProperty({ type: [ExtractedClientDto] })
	clients: ExtractedClientDto[];

	@ApiProperty({ enum: ValueEnum, isArray: true })
	suggestedValues: ValueEnum[];
}
