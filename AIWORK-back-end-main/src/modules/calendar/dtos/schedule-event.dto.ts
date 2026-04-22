import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ScheduleEventSource, ScheduleEventStatus } from '@prisma/client';

// ========== REQUEST DTOs ==========

/**
 * Create a new schedule event (manual calendar entry)
 */
export class CreateScheduleEventDto {
	@ApiProperty({ description: 'Event title' })
	@IsString()
	title: string;

	@ApiPropertyOptional({ description: 'Event description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ description: 'Event start time (ISO datetime)' })
	@IsDateString()
	startAt: string;

	@ApiProperty({ description: 'Event end time (ISO datetime)' })
	@IsDateString()
	endAt: string;

	@ApiPropertyOptional({ description: 'Event color (hex)' })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ description: 'Whether this is an all-day event' })
	@IsOptional()
	@IsBoolean()
	isAllDay?: boolean;

	@ApiPropertyOptional({ description: 'Timezone (e.g., America/New_York)' })
	@IsOptional()
	@IsString()
	timezone?: string;
}

/**
 * Update an existing schedule event
 */
export class UpdateScheduleEventDto {
	@ApiPropertyOptional({ description: 'Event title' })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({ description: 'Event description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({ description: 'Event start time (ISO datetime)' })
	@IsOptional()
	@IsDateString()
	startAt?: string;

	@ApiPropertyOptional({ description: 'Event end time (ISO datetime)' })
	@IsOptional()
	@IsDateString()
	endAt?: string;

	@ApiPropertyOptional({ description: 'Event color (hex)' })
	@IsOptional()
	@IsString()
	color?: string;

	@ApiPropertyOptional({ description: 'Whether this is an all-day event' })
	@IsOptional()
	@IsBoolean()
	isAllDay?: boolean;

	@ApiPropertyOptional({ description: 'Event status', enum: ScheduleEventStatus })
	@IsOptional()
	@IsEnum(ScheduleEventStatus)
	status?: ScheduleEventStatus;

	@ApiPropertyOptional({ description: 'Timezone (e.g., America/New_York)' })
	@IsOptional()
	@IsString()
	timezone?: string;
}

/**
 * Query parameters for listing schedule events
 */
export class QueryScheduleEventsDto {
	@ApiProperty({ description: 'Start date for range query (ISO date)' })
	@IsDateString()
	startDate: string;

	@ApiProperty({ description: 'End date for range query (ISO date)' })
	@IsDateString()
	endDate: string;

	@ApiPropertyOptional({ description: 'Filter by block types (comma-separated)', type: String })
	@IsOptional()
	@IsString()
	types?: string;
}

// ========== RESPONSE DTOs ==========

/**
 * Schedule event response
 */
export class ScheduleEventResponseDto {
	@ApiProperty({ description: 'Event ID' })
	id: string;

	@ApiProperty({ description: 'Event source', enum: ScheduleEventSource })
	source: ScheduleEventSource;

	@ApiPropertyOptional({ description: 'Event title' })
	title?: string;

	@ApiPropertyOptional({ description: 'Event description' })
	description?: string;

	@ApiProperty({ description: 'Event start time' })
	startAt: Date;

	@ApiProperty({ description: 'Event end time' })
	endAt: Date;

	@ApiProperty({ description: 'Duration in minutes' })
	durationMinutes: number;

	@ApiPropertyOptional({ description: 'Event color' })
	color?: string;

	@ApiProperty({ description: 'Event status', enum: ScheduleEventStatus })
	status: ScheduleEventStatus;

	@ApiPropertyOptional({ description: 'Whether this is an all-day event' })
	isAllDay?: boolean;

	@ApiPropertyOptional({ description: 'Timezone' })
	timezone?: string;

	@ApiPropertyOptional({ description: 'Linked block instance ID' })
	blockInstanceId?: string;

	@ApiPropertyOptional({ description: 'Linked step run ID' })
	stepRunId?: string;

	@ApiProperty({ description: 'Created timestamp' })
	createdAt: Date;

	@ApiProperty({ description: 'Updated timestamp' })
	updatedAt: Date;
}
