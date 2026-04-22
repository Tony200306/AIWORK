import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { BlockType, ScheduleEventSource, ScheduleEventStatus } from '@prisma/client';
import {
	WeekViewResponseDto,
	DayViewResponseDto,
	DayEventsDto,
	CalendarEventDto,
	CalendarItemDto,
	CalendarItemType,
	SprintSummaryDto,
	SprintTaskDto,
	StepDto,
	ScheduleStepDto,
	ScheduledStepResponseDto,
} from '../dtos/calendar.dto';

@Injectable()
export class CalendarService {
	private readonly logger = new Logger(CalendarService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Get week view with events and sprint summary
	 */
	async getWeekView(
		userId: string,
		date?: string,
		sprintId?: string,
		types?: string,
	): Promise<WeekViewResponseDto> {
		// Calculate week bounds (Sunday to Saturday)
		const targetDate = date ? new Date(date) : new Date();
		const { weekStart, weekEnd } = this.getWeekBounds(targetDate);

		// Get sprint summary (without tasks)
		const { summary: sprint } = await this.getSprintWithTasks(userId, sprintId);

		// Get scheduled events for the week
		const scheduledEvents = await this.getEventsForRange(userId, weekStart, weekEnd, types);

		// Convert scheduled events to CalendarItemDto
		const scheduledItems = this.convertEventsToItems(scheduledEvents);

		// Group all items by day
		const days = this.groupItemsByDay(weekStart, scheduledItems);

		return {
			weekStart: weekStart.toISOString().split('T')[0],
			weekEnd: weekEnd.toISOString().split('T')[0],
			sprint,
			days,
		};
	}

	/**
	 * Get day view with events and sprint summary
	 */
	async getDayView(
		userId: string,
		date?: string,
		sprintId?: string,
	): Promise<DayViewResponseDto> {
		const targetDate = date ? new Date(date) : new Date();
		const dateStr = targetDate.toISOString().split('T')[0];
		const dayStart = new Date(targetDate);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(targetDate);
		dayEnd.setHours(23, 59, 59, 999);

		// Get sprint summary (without tasks)
		const { summary: sprint } = await this.getSprintWithTasks(userId, sprintId);

		// Get scheduled events for the day
		const scheduledEvents = await this.getEventsForRange(userId, dayStart, dayEnd);

		// Convert scheduled events to CalendarItemDto
		const items = this.convertEventsToItems(scheduledEvents);

		return {
			date: dateStr,
			dayOfWeek: targetDate.getDay(),
			sprint,
			items,
		};
	}

	/**
	 * Schedule a step on the calendar
	 * Creates a StepRun with linked ScheduleEvent
	 */
	async scheduleStep(userId: string, dto: ScheduleStepDto): Promise<ScheduledStepResponseDto> {
		const { stepId, scheduledAt, durationMinutes, taskRunId } = dto;

		// Verify step exists and belongs to a task the user owns
		const step = await this.prisma.step.findFirst({
			where: {
				id: stepId,
				task: { userId },
			},
			include: {
				task: {
					select: {
						id: true,
						title: true,
						userId: true,
					},
				},
			},
		});

		if (!step) {
			throw new NotFoundException('Step not found or access denied');
		}

		// Calculate end time
		const startAt = new Date(scheduledAt);
		const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

		// If taskRunId provided, verify it exists and belongs to the same task
		let validTaskRunId = taskRunId;
		if (taskRunId) {
			const taskRun = await this.prisma.taskRun.findFirst({
				where: {
					id: taskRunId,
					taskId: step.taskId,
					userId,
				},
			});
			if (!taskRun) {
				throw new BadRequestException('TaskRun not found or does not match this step');
			}
		} else {
			// Create a new TaskRun for this step scheduling
			const newTaskRun = await this.prisma.taskRun.create({
				data: {
					userId,
					taskId: step.taskId,
					status: 'TODO',
					startedFrom: 'TODO',
				},
			});
			validTaskRunId = newTaskRun.id;
		}

		// Create StepRun and ScheduleEvent in a transaction
		const result = await this.prisma.$transaction(async (tx) => {
			// Create StepRun with scheduled time
			const stepRun = await tx.stepRun.create({
				data: {
					taskRunId: validTaskRunId!,
					stepId,
					status: 'TODO',
					scheduledAt: startAt,
				},
			});

			// Create linked ScheduleEvent
			const scheduleEvent = await tx.scheduleEvent.create({
				data: {
					userId,
					source: ScheduleEventSource.STEP_SESSION,
					externalProvider: 'INTERNAL',
					title: step.title,
					description: step.description,
					startAt,
					endAt,
					status: ScheduleEventStatus.CONFIRMED,
					stepRunId: stepRun.id,
				},
			});

			return { stepRun, scheduleEvent };
		});

		return {
			stepRunId: result.stepRun.id,
			scheduleEventId: result.scheduleEvent.id,
			scheduledAt: startAt,
			scheduledEndAt: endAt,
			stepTitle: step.title,
			taskTitle: step.task.title,
		};
	}

	/**
	 * Calculate week boundaries (Sunday to Saturday)
	 */
	private getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
		const weekStart = new Date(date);
		const dayOfWeek = weekStart.getDay();
		weekStart.setDate(weekStart.getDate() - dayOfWeek);
		weekStart.setHours(0, 0, 0, 0);

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 6);
		weekEnd.setHours(23, 59, 59, 999);

		return { weekStart, weekEnd };
	}

	/**
	 * Get sprint summary and tasks for calendar
	 */
	private async getSprintWithTasks(
		userId: string,
		sprintId?: string,
	): Promise<{ summary?: SprintSummaryDto; tasks?: SprintTaskDto[] }> {
		const sprint = sprintId
			? await this.prisma.sprint.findFirst({
					where: { id: sprintId, userId },
					include: {
						items: {
							orderBy: { rank: 'asc' },
							include: {
								task: {
									select: {
										id: true,
										title: true,
										description: true,
										status: true,
										priority: true,
										dueAt: true,
										steps: {
											orderBy: { orderIndex: 'asc' },
											select: {
												id: true,
												title: true,
												description: true,
												orderIndex: true,
												sysEstMinutes: true,
												userEstMinutes: true,
												isDone: true,
											},
										},
									},
								},
							},
						},
					},
				})
			: await this.prisma.sprint.findFirst({
					where: { userId, isActive: true },
					include: {
						items: {
							orderBy: { rank: 'asc' },
							include: {
								task: {
									select: {
										id: true,
										title: true,
										description: true,
										status: true,
										priority: true,
										dueAt: true,
										steps: {
											orderBy: { orderIndex: 'asc' },
											select: {
												id: true,
												title: true,
												description: true,
												orderIndex: true,
												sysEstMinutes: true,
												userEstMinutes: true,
												isDone: true,
											},
										},
									},
								},
							},
						},
					},
				});

		if (!sprint) {
			return { summary: undefined, tasks: undefined };
		}

		// Calculate summary
		const plannedMinutes = sprint.items.reduce(
			(sum: number, item) => sum + (item.plannedMinutes || 0),
			0,
		);
		const completedMinutes = sprint.items
			.filter((item) => item.completedAt)
			.reduce((sum: number, item) => sum + (item.plannedMinutes || 0), 0);

		const summary: SprintSummaryDto = {
			id: sprint.id,
			title: sprint.title ?? '',
			goal: undefined,
			capacityMinutes: sprint.capacityMinutes || 0,
			plannedMinutes,
			completedMinutes,
		};

		// Transform items to tasks with steps
		const tasks: SprintTaskDto[] = sprint.items.map((item) => {
			// Transform steps
			const steps: StepDto[] = item.task.steps.map((step) => ({
				id: step.id,
				title: step.title,
				description: step.description ?? undefined,
				orderIndex: step.orderIndex ?? 0,
				sysEstMinutes: step.sysEstMinutes ?? undefined,
				userEstMinutes: step.userEstMinutes ?? undefined,
				isDone: step.isDone,
			}));

			return {
				id: item.id,
				taskId: item.taskId,
				title: item.task.title,
				description: item.task.description,
				status: item.task.status,
				priority: item.task.priority,
				lane: item.lane,
				plannedMinutes: item.plannedMinutes ?? undefined,
				rank: item.rank ?? 0,
				isStarred: item.isStarred,
				startNext: item.startNext,
				completedAt: item.completedAt ?? undefined,
				dueAt: item.task.dueAt ?? undefined,
				steps: steps.length > 0 ? steps : undefined,
			};
		});

		return { summary, tasks };
	}

	/**
	 * Get events for a date range, merging from multiple sources
	 */
	private async getEventsForRange(
		userId: string,
		startDate: Date,
		endDate: Date,
		types?: string,
	): Promise<CalendarEventDto[]> {
		// Parse block types filter
		const blockTypes = types
			? (types.split(',').filter((t) => Object.values(BlockType).includes(t as BlockType)) as BlockType[])
			: undefined;

		// Get schedule events
		const scheduleEvents = await this.prisma.scheduleEvent.findMany({
			where: {
				userId,
				OR: [
					{ startAt: { gte: startDate, lte: endDate } },
					{ endAt: { gte: startDate, lte: endDate } },
					{ AND: [{ startAt: { lte: startDate } }, { endAt: { gte: endDate } }] },
				],
			},
			include: {
				blockInstance: {
					include: {
						template: true,
					},
				},
				// Include stepRun with step and task info for STEP_SESSION events
				stepRun: {
					include: {
						step: {
							select: {
								id: true,
								title: true,
								orderIndex: true,
								isDone: true,
								task: {
									select: {
										id: true,
										title: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: { startAt: 'asc' },
		});

		// Transform to CalendarEventDto
		const events: CalendarEventDto[] = scheduleEvents.map((event) => {
			const durationMinutes = Math.round(
				(event.endAt.getTime() - event.startAt.getTime()) / (1000 * 60),
			);

			// Get block type from template if available
			const blockType = event.blockInstance?.template?.type;

			// Extract step/task info for STEP_SESSION events
			const stepRun = event.stepRun;
			const step = stepRun?.step;
			const task = step?.task;

			return {
				id: event.id,
				source: event.source,
				title: event.title ?? event.blockInstance?.title ?? undefined,
				description: event.description ?? event.blockInstance?.description ?? undefined,
				startAt: event.startAt,
				endAt: event.endAt,
				durationMinutes,
				type: blockType,
				color: event.blockInstance?.color ?? undefined,
				status: event.status,
				isAllDay: event.isAllDay,
				templateId: event.blockInstance?.templateId ?? undefined,
				// Step/Task info (populated for STEP_SESSION events)
				taskId: task?.id ?? undefined,
				taskTitle: task?.title ?? undefined,
				stepId: step?.id ?? undefined,
				stepOrderIndex: step?.orderIndex ?? undefined,
				stepIsDone: step?.isDone ?? undefined,
			};
		});

		// Filter by block types if specified
		if (blockTypes && blockTypes.length > 0) {
			return events.filter((e) => e.type && blockTypes.includes(e.type));
		}

		return events;
	}

	/**
	 * Convert CalendarEventDto[] to CalendarItemDto[]
	 */
	private convertEventsToItems(events: CalendarEventDto[]): CalendarItemDto[] {
		return events.map((event): CalendarItemDto => ({
			id: event.id,
			itemType: 'SCHEDULED_EVENT',
			source: event.source,
			title: event.title || 'Untitled Event',
			description: event.description,
			startAt: event.startAt,
			endAt: event.endAt,
			durationMinutes: event.durationMinutes,
			isAllDay: event.isAllDay,
			type: event.type,
			color: event.color,
			status: event.status,
			templateId: event.templateId,
			taskId: event.taskId,
			taskTitle: event.taskTitle,
			stepId: event.stepId,
			stepOrderIndex: event.stepOrderIndex,
			stepIsDone: event.stepIsDone,
		}));
	}


	/**
	 * Group items by day for week view
	 * Only includes scheduled items on their scheduled day
	 */
	private groupItemsByDay(
		weekStart: Date,
		scheduledItems: CalendarItemDto[],
	): DayEventsDto[] {
		const days: DayEventsDto[] = [];

		for (let i = 0; i < 7; i++) {
			const dayDate = new Date(weekStart);
			dayDate.setDate(dayDate.getDate() + i);
			const dateStr = dayDate.toISOString().split('T')[0];

			// Filter scheduled items for this day
			const dayItems = scheduledItems
				.filter((item) => {
					if (!item.startAt) return false;
					const itemDate = new Date(item.startAt).toISOString().split('T')[0];
					return itemDate === dateStr;
				})
				.sort((a, b) => {
					if (!a.startAt || !b.startAt) return 0;
					return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
				});

			days.push({
				date: dateStr,
				dayOfWeek: dayDate.getDay(),
				items: dayItems,
			});
		}

		return days;
	}
}
