import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsString,
	IsOptional,
	IsArray,
	IsNumber,
	ValidateNested,
} from 'class-validator';

// ========== Nested DTOs ==========

export class OnboardingQuestionDto {
	@ApiProperty({ example: 'What is the project scope?' })
	@IsString()
	question: string;

	@ApiProperty({ example: 'Build a web application' })
	@IsString()
	answer: string;
}

export class HistoryActionDto {
	@ApiProperty({ example: 'Add user authentication' })
	@IsString()
	userQuery: string;

	@ApiPropertyOptional({
		type: [String],
		example: ['Implement login', 'Implement logout'],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	addedTasks?: string[];
}

// ========== Request DTO ==========

export class OnboardingBrainDumpInputDto {
	@ApiPropertyOptional({
		example: 'Develop API to detect flood given images',
		description: 'The user query/prompt',
	})
	@IsString()
	@IsOptional()
	query?: string;

	@ApiProperty({
		type: [String],
		example: ['Build API endpoint', 'Train ML model'],
		description: 'List of selected tasks',
	})
	@IsArray()
	@IsString({ each: true })
	selectedTasks: string[];

	@ApiProperty({
		type: [OnboardingQuestionDto],
		description: 'List of onboarding questions and answers',
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OnboardingQuestionDto)
	questions: OnboardingQuestionDto[];

	@ApiPropertyOptional({
		type: [HistoryActionDto],
		description: 'List of history actions',
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => HistoryActionDto)
	@IsOptional()
	historyActions?: HistoryActionDto[];
}

// ========== Response DTOs ==========

export class OnboardingTaskDto {
	@ApiProperty({ example: 'Implement flood detection algorithm' })
	@IsString()
	text: string;

	@ApiProperty({
		type: [String],
		example: ['backend', 'ml-engineer'],
		description: 'Roles associated with this task',
	})
	@IsArray()
	@IsString({ each: true })
	roles: string[];

	@ApiProperty({
		example: 2.5,
		description: 'Estimated time in hours',
	})
	@IsNumber()
	estTime: number;
}

export class OnboardingBrainDumpOutputDto {
	@ApiProperty({
		type: [OnboardingTaskDto],
		description: 'Generated tasks from the onboarding braindump',
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OnboardingTaskDto)
	tasks: OnboardingTaskDto[];
}
