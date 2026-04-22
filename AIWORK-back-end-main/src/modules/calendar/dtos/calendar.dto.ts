import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ScheduleEventSource, ScheduleEventStatus, BlockType, Priority, TaskStatus, SprintLane } from '@prisma/client';

/**
 * Item type for unified calendar view
 * - SCHEDULED_EVENT: From ScheduleEvent table (has specific time)
 * - UNSCHEDULED_TASK: Task from sprint without scheduled time
 * - UNSCHEDULED_STEP: Step from sprint task without scheduled time
 */
export type CalendarItemType = 'SCHEDULED_EVENT' | 'UNSCHEDULED_TASK' | 'UNSCHEDULED_STEP';

// ========== REQUEST DTOs ==========

/**
 * Query parameters for week view
 */
export class WeekViewQueryDto {
	@ApiPropertyOptional({ description: 'Any date in the week (defaults to today)' })
	@IsOptional()
	@IsDateString()
	date?: string;

	@ApiPropertyOptional({ description: 'Sprint ID (defaults to active sprint)' })
	@IsOptional()
	@IsUUID()
	sprintId?: string;

	@ApiPropertyOptional({ description: 'Filter by block types (comma-separated)' })
	@IsOptional()
	@IsString()
	types?: string;
}

/**
 * Query parameters for day view
 */
export class DayViewQueryDto {
	@ApiPropertyOptional({ description: 'Date to view (ISO date, defaults to today)' })
	@IsOptional()
	@IsDateString()
	date?: string;

	@ApiPropertyOptional({ description: 'Sprint ID (defaults to active sprint)' })
	@IsOptional()
	@IsUUID()
	sprintId?: string;
}

/**
 * Request to schedule a step on the calendar
 */
export class ScheduleStepDto {
	@ApiProperty({ description: 'Step ID to schedule' })
	@IsUUID()
	stepId: string;

	@ApiProperty({ description: 'Scheduled start time (ISO datetime)' })
	@IsDateString()
	scheduledAt: string;

	@ApiProperty({ description: 'Duration in minutes' })
	@IsNumber()
	@Min(1)
	durationMinutes: number;

	@ApiPropertyOptional({ description: 'Task Run ID (if within existing task run)' })
	@IsOptional()
	@IsUUID()
	taskRunId?: string;
}

/**
 * Response after scheduling a step
 */
export class ScheduledStepResponseDto {
	@ApiProperty({ description: 'Created StepRun ID' })
	stepRunId: string;

	@ApiProperty({ description: 'Created ScheduleEvent ID' })
	scheduleEventId: string;

	@ApiProperty({ description: 'Scheduled start time' })
	scheduledAt: Date;

	@ApiProperty({ description: 'Scheduled end time' })
	scheduledEndAt: Date;

	@ApiProperty({ description: 'Step title' })
	stepTitle: string;

	@ApiProperty({ description: 'Task title' })
	taskTitle: string;
}

// ========== RESPONSE DTOs ==========

/**
 * Sprint summary for calendar header
 */
export class SprintSummaryDto {
	@ApiProperty({ description: 'Sprint ID' })
	id: string;

	@ApiProperty({ description: 'Sprint title' })
	title: string;

	@ApiPropertyOptional({ description: 'Sprint goal' })
	goal?: string;

	@ApiProperty({ description: 'Total capacity in minutes' })
	capacityMinutes: number;

	@ApiProperty({ description: 'Planned time in minutes' })
	plannedMinutes: number;

	@ApiProperty({ description: 'Completed time in minutes' })
	completedMinutes: number;
}

/**
 * Calendar event for display (scheduled events only)
 */
export class CalendarEventDto {
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

	@ApiPropertyOptional({ description: 'Block type (from template)', enum: BlockType })
	type?: BlockType;

	@ApiPropertyOptional({ description: 'Event color' })
	color?: string;

	@ApiProperty({ description: 'Event status', enum: ScheduleEventStatus })
	status: ScheduleEventStatus;

	@ApiPropertyOptional({ description: 'Whether this is an all-day event' })
	isAllDay?: boolean;

	@ApiPropertyOptional({ description: 'Linked block template ID' })
	templateId?: string;

	@ApiPropertyOptional({ description: 'Linked task ID (for STEP_SESSION/TASK_SESSION events)' })
	taskId?: string;

	@ApiPropertyOptional({ description: 'Task title (for STEP_SESSION/TASK_SESSION events)' })
	taskTitle?: string;

	@ApiPropertyOptional({ description: 'Linked step ID (for STEP_SESSION events)' })
	stepId?: string;

	@ApiPropertyOptional({ description: 'Step order index within task (for STEP_SESSION events)' })
	stepOrderIndex?: number;

	@ApiPropertyOptional({ description: 'Whether the step is done (for STEP_SESSION events)' })
	stepIsDone?: boolean;
}

/**
 * Unified calendar item - can be a scheduled event OR an unscheduled task/step
 */
export class CalendarItemDto {
	@ApiProperty({ description: 'Item ID (event ID, task ID, or step ID)' })
	id: string;

	@ApiProperty({ description: 'Item type', enum: ['SCHEDULED_EVENT', 'UNSCHEDULED_TASK', 'UNSCHEDULED_STEP'] })
	itemType: CalendarItemType;

	@ApiPropertyOptional({ description: 'Event source (for scheduled events)', enum: ScheduleEventSource })
	source?: ScheduleEventSource;

	@ApiProperty({ description: 'Item title' })
	title: string;

	@ApiPropertyOptional({ description: 'Item description' })
	description?: string;

	// === Time fields (for scheduled events) ===
	@ApiPropertyOptional({ description: 'Start time (for scheduled events)' })
	startAt?: Date;

	@ApiPropertyOptional({ description: 'End time (for scheduled events)' })
	endAt?: Date;

	@ApiPropertyOptional({ description: 'Duration in minutes' })
	durationMinutes?: number;

	@ApiPropertyOptional({ description: 'Whether this is an all-day event' })
	isAllDay?: boolean;

	// === Block/Template fields ===
	@ApiPropertyOptional({ description: 'Block type', enum: BlockType })
	type?: BlockType;

	@ApiPropertyOptional({ description: 'Item color' })
	color?: string;

	@ApiPropertyOptional({ description: 'Event status (for scheduled events)', enum: ScheduleEventStatus })
	status?: ScheduleEventStatus;

	@ApiPropertyOptional({ description: 'Linked block template ID' })
	templateId?: string;

	// === Task fields ===
	@ApiPropertyOptional({ description: 'Task ID' })
	taskId?: string;

	@ApiPropertyOptional({ description: 'Task title' })
	taskTitle?: string;

	@ApiPropertyOptional({ description: 'Task status (for unscheduled tasks)', enum: TaskStatus })
	taskStatus?: TaskStatus;

	@ApiPropertyOptional({ description: 'Task priority', enum: Priority })
	priority?: Priority;

	@ApiPropertyOptional({ description: 'Sprint lane', enum: SprintLane })
	lane?: SprintLane;

	@ApiPropertyOptional({ description: 'Task due date' })
	dueAt?: Date;

	@ApiPropertyOptional({ description: 'Planned minutes for task' })
	plannedMinutes?: number;

	@ApiPropertyOptional({ description: 'Is starred' })
	isStarred?: boolean;

	@ApiPropertyOptional({ description: 'Start next flag' })
	startNext?: boolean;

	// === Step fields ===
	@ApiPropertyOptional({ description: 'Step ID' })
	stepId?: string;

	@ApiPropertyOptional({ description: 'Step order index within task' })
	stepOrderIndex?: number;

	@ApiPropertyOptional({ description: 'System estimated minutes for step' })
	sysEstMinutes?: number;

	@ApiPropertyOptional({ description: 'User estimated minutes for step' })
	userEstMinutes?: number;

	@ApiPropertyOptional({ description: 'Whether the step is done' })
	stepIsDone?: boolean;

	// === Sprint Item fields ===
	@ApiPropertyOptional({ description: 'Sprint item ID' })
	sprintItemId?: string;

	@ApiPropertyOptional({ description: 'Rank in sprint lane' })
	rank?: number;
}

/**
 * Step for calendar display (sub-items of tasks)
 */
export class StepDto {
	@ApiProperty({ description: 'Step ID' })
	id: string;

	@ApiProperty({ description: 'Step title' })
	title: string;

	@ApiPropertyOptional({ description: 'Step description' })
	description?: string;

	@ApiProperty({ description: 'Order index within task' })
	orderIndex: number;

	@ApiPropertyOptional({ description: 'System estimated minutes' })
	sysEstMinutes?: number;

	@ApiPropertyOptional({ description: 'User estimated minutes' })
	userEstMinutes?: number;

	@ApiProperty({ description: 'Whether step is done' })
	isDone: boolean;
}

/**
 * Sprint task for calendar sidebar
 */
export class SprintTaskDto {
	@ApiProperty({ description: 'Sprint item ID' })
	id: string;

	@ApiProperty({ description: 'Task ID' })
	taskId: string;

	@ApiProperty({ description: 'Task title' })
	title: string;

	@ApiPropertyOptional({ description: 'Task description' })
	description?: string;

	@ApiProperty({ description: 'Task status', enum: TaskStatus })
	status: TaskStatus;

	@ApiProperty({ description: 'Task priority', enum: Priority })
	priority: Priority;

	@ApiProperty({ description: 'Sprint lane', enum: SprintLane })
	lane: SprintLane;

	@ApiPropertyOptional({ description: 'Planned minutes' })
	plannedMinutes?: number;

	@ApiProperty({ description: 'Rank in lane' })
	rank: number;

	@ApiProperty({ description: 'Is starred' })
	isStarred: boolean;

	@ApiProperty({ description: 'Start next flag' })
	startNext: boolean;

	@ApiPropertyOptional({ description: 'Completed at timestamp' })
	completedAt?: Date;

	@ApiPropertyOptional({ description: 'Task due date' })
	dueAt?: Date;

	@ApiPropertyOptional({ description: 'Steps within this task', type: [StepDto] })
	steps?: StepDto[];
}

/**
 * Items for a single day (includes both scheduled events and unscheduled tasks/steps)
 */
export class DayEventsDto {
	@ApiProperty({ description: 'Date (ISO date string)' })
	date: string;

	@ApiProperty({ description: 'Day of week (0=Sun, 1=Mon, ...)' })
	dayOfWeek: number;

	@ApiProperty({ description: 'All items for this day (scheduled events + unscheduled tasks/steps)', type: [CalendarItemDto] })
	items: CalendarItemDto[];
}

/**
 * Week view response
 */
export class WeekViewResponseDto {
	@ApiProperty({ description: 'Week start date (ISO date)' })
	weekStart: string;

	@ApiProperty({ description: 'Week end date (ISO date)' })
	weekEnd: string;

	@ApiPropertyOptional({ description: 'Sprint summary', type: SprintSummaryDto })
	sprint?: SprintSummaryDto;

	@ApiProperty({ description: 'Items grouped by day (includes scheduled events + unscheduled tasks/steps)', type: [DayEventsDto] })
	days: DayEventsDto[];
}

/**
 * Day view response
 */
export class DayViewResponseDto {
	@ApiProperty({ description: 'Date (ISO date)' })
	date: string;

	@ApiProperty({ description: 'Day of week (0=Sun, 1=Mon, ...)' })
	dayOfWeek: number;

	@ApiPropertyOptional({ description: 'Sprint summary', type: SprintSummaryDto })
	sprint?: SprintSummaryDto;

	@ApiProperty({ description: 'Items for the day (includes scheduled events + unscheduled tasks/steps)', type: [CalendarItemDto] })
	items: CalendarItemDto[];
}
