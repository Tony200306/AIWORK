import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
	ScheduleEventSource,
	ScheduleEventProvider,
	ScheduleEventStatus,
	ScheduleEvent,
} from '@prisma/client';
import {
	CreateScheduleEventDto,
	UpdateScheduleEventDto,
	ScheduleEventResponseDto,
} from '../dtos/schedule-event.dto';

@Injectable()
export class ScheduleEventService {
	private readonly logger = new Logger(ScheduleEventService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Create a new manual schedule event
	 */
	async create(userId: string, dto: CreateScheduleEventDto): Promise<ScheduleEventResponseDto> {
		const startAt = new Date(dto.startAt);
		const endAt = new Date(dto.endAt);

		const event = await this.prisma.scheduleEvent.create({
			data: {
				userId,
				source: ScheduleEventSource.MANUAL,
				externalProvider: ScheduleEventProvider.INTERNAL,
				title: dto.title,
				description: dto.description,
				startAt,
				endAt,
				isAllDay: dto.isAllDay ?? false,
				timezone: dto.timezone,
				status: ScheduleEventStatus.CONFIRMED,
			},
		});

		return this.toResponseDto(event);
	}

	/**
	 * Get schedule events for a date range
	 */
	async findByDateRange(
		userId: string,
		startDate: string,
		endDate: string,
	): Promise<ScheduleEventResponseDto[]> {
		const start = new Date(startDate);
		start.setHours(0, 0, 0, 0);

		const end = new Date(endDate);
		end.setHours(23, 59, 59, 999);

		const events = await this.prisma.scheduleEvent.findMany({
			where: {
				userId,
				OR: [
					// Events that start within the range
					{ startAt: { gte: start, lte: end } },
					// Events that end within the range
					{ endAt: { gte: start, lte: end } },
					// Events that span the entire range
					{ AND: [{ startAt: { lte: start } }, { endAt: { gte: end } }] },
				],
			},
			orderBy: { startAt: 'asc' },
		});

		return events.map((event) => this.toResponseDto(event));
	}

	/**
	 * Get a single event by ID
	 */
	async findOne(id: string, userId: string): Promise<ScheduleEventResponseDto> {
		const event = await this.prisma.scheduleEvent.findUnique({
			where: { id },
		});

		if (!event) {
			throw new NotFoundException(`Schedule event with ID ${id} not found`);
		}

		if (event.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to access this event');
		}

		return this.toResponseDto(event);
	}

	/**
	 * Update a schedule event
	 */
	async update(
		id: string,
		userId: string,
		dto: UpdateScheduleEventDto,
	): Promise<ScheduleEventResponseDto> {
		const existing = await this.prisma.scheduleEvent.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException(`Schedule event with ID ${id} not found`);
		}

		if (existing.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to modify this event');
		}

		// Only allow updating MANUAL events
		if (existing.source !== ScheduleEventSource.MANUAL) {
			throw new UnauthorizedException('Cannot modify non-manual events directly');
		}

		const event = await this.prisma.scheduleEvent.update({
			where: { id },
			data: {
				title: dto.title,
				description: dto.description,
				startAt: dto.startAt ? new Date(dto.startAt) : undefined,
				endAt: dto.endAt ? new Date(dto.endAt) : undefined,
				isAllDay: dto.isAllDay,
				timezone: dto.timezone,
				status: dto.status,
			},
		});

		return this.toResponseDto(event);
	}

	/**
	 * Delete a schedule event
	 */
	async delete(id: string, userId: string): Promise<void> {
		const existing = await this.prisma.scheduleEvent.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException(`Schedule event with ID ${id} not found`);
		}

		if (existing.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to delete this event');
		}

		// Only allow deleting MANUAL events
		if (existing.source !== ScheduleEventSource.MANUAL) {
			throw new UnauthorizedException('Cannot delete non-manual events directly');
		}

		await this.prisma.scheduleEvent.delete({
			where: { id },
		});

		this.logger.log(`Deleted schedule event ${id}`);
	}

	/**
	 * Transform database entity to response DTO
	 */
	private toResponseDto(event: ScheduleEvent): ScheduleEventResponseDto {
		const durationMinutes = Math.round(
			(event.endAt.getTime() - event.startAt.getTime()) / (1000 * 60),
		);

		return {
			id: event.id,
			source: event.source,
			title: event.title ?? undefined,
			description: event.description ?? undefined,
			startAt: event.startAt,
			endAt: event.endAt,
			durationMinutes,
			status: event.status,
			isAllDay: event.isAllDay,
			timezone: event.timezone ?? undefined,
			blockInstanceId: event.blockInstanceId ?? undefined,
			stepRunId: event.stepRunId ?? undefined,
			createdAt: event.createdAt,
			updatedAt: event.updatedAt,
		};
	}
}
