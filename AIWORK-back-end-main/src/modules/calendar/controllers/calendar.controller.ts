import { Controller, Get, Post, Query, Body, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from '../services/calendar.service';
import {
	WeekViewQueryDto,
	DayViewQueryDto,
	WeekViewResponseDto,
	DayViewResponseDto,
	ScheduleStepDto,
	ScheduledStepResponseDto,
} from '../dtos/calendar.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Calendar')
@ApiBearerAuth('JWT-auth')
@Controller('calendar')
export class CalendarController {
	private readonly logger = new Logger(CalendarController.name);

	constructor(private readonly calendarService: CalendarService) {}

	/**
	 * Get week view with events grouped by day
	 */
	@Get('week')
	@ApiOperation({ summary: 'Get week calendar view with events and sprint summary' })
	async getWeekView(
		@Query() query: WeekViewQueryDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: WeekViewResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.calendarService.getWeekView(
			user.id,
			query.date,
			query.sprintId,
			query.types,
		);

		return {
			success: true,
			data: result,
		};
	}

	/**
	 * Get day view with events
	 */
	@Get('day')
	@ApiOperation({ summary: 'Get day calendar view with events and sprint summary' })
	async getDayView(
		@Query() query: DayViewQueryDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: DayViewResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.calendarService.getDayView(
			user.id,
			query.date,
			query.sprintId,
		);

		return {
			success: true,
			data: result,
		};
	}

	/**
	 * Schedule a step on the calendar
	 */
	@Post('schedule-step')
	@ApiOperation({ summary: 'Schedule a step on the calendar' })
	async scheduleStep(
		@Body() dto: ScheduleStepDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: ScheduledStepResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.calendarService.scheduleStep(user.id, dto);

		return {
			success: true,
			data: result,
		};
	}
}
