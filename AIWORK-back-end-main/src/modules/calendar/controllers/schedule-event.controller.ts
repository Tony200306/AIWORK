import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ScheduleEventService } from '../services/schedule-event.service';
import {
	CreateScheduleEventDto,
	UpdateScheduleEventDto,
	QueryScheduleEventsDto,
	ScheduleEventResponseDto,
} from '../dtos/schedule-event.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Calendar - Events')
@ApiBearerAuth('JWT-auth')
@Controller('calendar/events')
export class ScheduleEventController {
	private readonly logger = new Logger(ScheduleEventController.name);

	constructor(private readonly scheduleEventService: ScheduleEventService) {}

	/**
	 * Create a new manual calendar event
	 */
	@Post()
	@ApiOperation({ summary: 'Create a new manual calendar event' })
	@ApiBody({ type: CreateScheduleEventDto })
	async create(
		@Body() dto: CreateScheduleEventDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: ScheduleEventResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const event = await this.scheduleEventService.create(user.id, dto);

		return {
			success: true,
			message: 'Event created successfully',
			data: event,
		};
	}

	/**
	 * Get events for a date range
	 */
	@Get()
	@ApiOperation({ summary: 'Get calendar events for a date range' })
	async findByDateRange(
		@Query() query: QueryScheduleEventsDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: ScheduleEventResponseDto[] }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const events = await this.scheduleEventService.findByDateRange(
			user.id,
			query.startDate,
			query.endDate,
		);

		return {
			success: true,
			data: events,
		};
	}

	/**
	 * Get a single event by ID
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a calendar event by ID' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: ScheduleEventResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const event = await this.scheduleEventService.findOne(id, user.id);

		return {
			success: true,
			data: event,
		};
	}

	/**
	 * Update a calendar event
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Update a calendar event' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	@ApiBody({ type: UpdateScheduleEventDto })
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateScheduleEventDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: ScheduleEventResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const event = await this.scheduleEventService.update(id, user.id, dto);

		return {
			success: true,
			message: 'Event updated successfully',
			data: event,
		};
	}

	/**
	 * Delete a calendar event
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a calendar event' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	async delete(
		@Param('id') id: string,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.scheduleEventService.delete(id, user.id);

		return {
			success: true,
			message: 'Event deleted successfully',
		};
	}
}
