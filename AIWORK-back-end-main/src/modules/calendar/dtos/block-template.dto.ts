import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
	IsOptional,
	IsBoolean,
	IsEnum,
	IsArray,
	IsUUID,
	ArrayMinSize,
	ArrayMaxSize,
	Min,
	Max,
	IsInt,
	Matches,
} from 'class-validator';
import { BlockType, RecurrenceType } from '@prisma/client';

// ========== REQUEST DTOs ==========

/**
 * Create a recurring block template
 */
export class CreateBlockTemplateDto {
	@ApiProperty({ description: 'Template title' })
	@IsString()
	title: string;

	@ApiPropertyOptional({ description: 'Template description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ description: 'Block type', enum: BlockType })
	@IsEnum(BlockType)
	type: BlockType;

	@ApiProperty({ description: 'Start time (HH:MM format)', example: '09:00' })
	@IsString()
	@Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'startTime must be in HH:MM format',
	})
	startTime: string;

	@ApiProperty({ description: 'End time (HH:MM format)', example: '10:00' })
	@IsString()
	@Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'endTime must be in HH:MM format',
	})
	endTime: string;

	@ApiPropertyOptional({ description: 'Timezone (e.g., America/New_York)' })
	@IsOptional()
	@IsString()
	timezone?: string;

	@ApiProperty({
		description: 'Days of week (0=Sun, 1=Mon, ..., 6=Sat)',
		example: [1, 2, 3, 4, 5],
		type: [Number],
	})
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(7)
	@IsInt({ each: true })
	@Min(0, { each: true })
	@Max(6, { each: true })
	daysOfWeek: number[];

	@ApiProperty({ description: 'Recurrence type', enum: RecurrenceType })
	@IsEnum(RecurrenceType)
	recurrenceType: RecurrenceType;

	@ApiPropertyOptional({ description: 'Custom recurrence pattern (JSON)' })
	@IsOptional()
	recurrencePattern?: Record<string, any>;

	@ApiPropertyOptional({ description: 'Default task ID to link' })
	@IsOptional()
	@IsUUID()
	defaultTaskId?: string;

	@ApiPropertyOptional({ description: 'Block color (hex)', example: '#4CAF50' })
	@IsOptional()
	@IsString()
	color?: string;
}

/**
 * Update a block template
 */
export class UpdateBlockTemplateDto {
	@ApiPropertyOptional({ description: 'Template title' })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({ description: 'Template description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ description: 'Block type', enum: BlockType })
	@IsOptional()
	@IsEnum(BlockType)
	type?: BlockType;

	@ApiPropertyOptional({ description: 'Start time (HH:MM format)' })
	@IsOptional()
	@IsString()
	@Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'startTime must be in HH:MM format',
	})
	startTime?: string;

	@ApiPropertyOptional({ description: 'End time (HH:MM format)' })
	@IsOptional()
	@IsString()
	@Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
		message: 'endTime must be in HH:MM format',
	})
	endTime?: string;

	@ApiPropertyOptional({ description: 'Timezone' })
	@IsOptional()
	@IsString()
	timezone?: string;

	@ApiPropertyOptional({ description: 'Days of week', type: [Number] })
	@IsOptional()
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(7)
	@IsInt({ each: true })
	@Min(0, { each: true })
	@Max(6, { each: true })
	daysOfWeek?: number[];

	@ApiPropertyOptional({ description: 'Recurrence type', enum: RecurrenceType })
	@IsOptional()
	@IsEnum(RecurrenceType)
	recurrenceType?: RecurrenceType;

	@ApiPropertyOptional({ description: 'Custom recurrence pattern' })
	@IsOptional()
	recurrencePattern?: Record<string, any>;

	@ApiPropertyOptional({ description: 'Default task ID' })
	@IsOptional()
	@IsUUID()
	defaultTaskId?: string;

	@ApiPropertyOptional({ description: 'Whether template is active' })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@ApiPropertyOptional({ description: 'Block color' })
	@IsOptional()
	@IsString()
	color?: string;
}

/**
 * Generate block instances from template
 */
export class GenerateInstancesDto {
	@ApiProperty({ description: 'Start date for generation (ISO date)' })
	@IsString()
	startDate: string;

	@ApiProperty({ description: 'End date for generation (ISO date)' })
	@IsString()
	endDate: string;
}

// ========== RESPONSE DTOs ==========

/**
 * Block template response
 */
export class BlockTemplateResponseDto {
	@ApiProperty({ description: 'Template ID' })
	id: string;

	@ApiProperty({ description: 'Template title' })
	title: string;

	@ApiPropertyOptional({ description: 'Template description' })
	description?: string;

	@ApiProperty({ description: 'Block type', enum: BlockType })
	type: BlockType;

	@ApiProperty({ description: 'Start time (HH:MM)' })
	startTime: string;

	@ApiProperty({ description: 'End time (HH:MM)' })
	endTime: string;

	@ApiPropertyOptional({ description: 'Timezone' })
	timezone?: string;

	@ApiProperty({ description: 'Days of week', type: [Number] })
	daysOfWeek: number[];

	@ApiProperty({ description: 'Recurrence type', enum: RecurrenceType })
	recurrenceType: RecurrenceType;

	@ApiPropertyOptional({ description: 'Custom recurrence pattern' })
	recurrencePattern?: Record<string, any>;

	@ApiPropertyOptional({ description: 'Default task ID' })
	defaultTaskId?: string;

	@ApiProperty({ description: 'Whether template is active' })
	isActive: boolean;

	@ApiProperty({ description: 'Created timestamp' })
	createdAt: Date;

	@ApiProperty({ description: 'Updated timestamp' })
	updatedAt: Date;
}
