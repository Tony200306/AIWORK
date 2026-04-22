import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
	BlockTemplate,
	BlockStatus,
	ScheduleEventSource,
	ScheduleEventProvider,
	ScheduleEventStatus,
} from '@prisma/client';
import {
	CreateBlockTemplateDto,
	UpdateBlockTemplateDto,
	BlockTemplateResponseDto,
} from '../dtos/block-template.dto';

@Injectable()
export class BlockTemplateService {
	private readonly logger = new Logger(BlockTemplateService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Create a new block template
	 */
	async create(userId: string, dto: CreateBlockTemplateDto): Promise<BlockTemplateResponseDto> {
		const template = await this.prisma.blockTemplate.create({
			data: {
				userId,
				title: dto.title,
				description: dto.description,
				type: dto.type,
				startTime: dto.startTime,
				endTime: dto.endTime,
				timezone: dto.timezone,
				daysOfWeek: dto.daysOfWeek,
				recurrenceType: dto.recurrenceType,
				recurrencePattern: dto.recurrencePattern,
				defaultTaskId: dto.defaultTaskId,
				isActive: true,
			},
		});

		return this.toResponseDto(template);
	}

	/**
	 * Get all templates for a user
	 */
	async findAll(userId: string): Promise<BlockTemplateResponseDto[]> {
		const templates = await this.prisma.blockTemplate.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		});

		return templates.map((t) => this.toResponseDto(t));
	}

	/**
	 * Get a single template by ID
	 */
	async findOne(id: string, userId: string): Promise<BlockTemplateResponseDto> {
		const template = await this.prisma.blockTemplate.findUnique({
			where: { id },
		});

		if (!template) {
			throw new NotFoundException(`Block template with ID ${id} not found`);
		}

		if (template.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to access this template');
		}

		return this.toResponseDto(template);
	}

	/**
	 * Update a block template
	 */
	async update(
		id: string,
		userId: string,
		dto: UpdateBlockTemplateDto,
	): Promise<BlockTemplateResponseDto> {
		const existing = await this.prisma.blockTemplate.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException(`Block template with ID ${id} not found`);
		}

		if (existing.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to modify this template');
		}

		const template = await this.prisma.blockTemplate.update({
			where: { id },
			data: {
				title: dto.title,
				description: dto.description,
				type: dto.type,
				startTime: dto.startTime,
				endTime: dto.endTime,
				timezone: dto.timezone,
				daysOfWeek: dto.daysOfWeek,
				recurrenceType: dto.recurrenceType,
				recurrencePattern: dto.recurrencePattern,
				defaultTaskId: dto.defaultTaskId,
				isActive: dto.isActive,
			},
		});

		return this.toResponseDto(template);
	}

	/**
	 * Delete a block template
	 */
	async delete(id: string, userId: string): Promise<void> {
		const existing = await this.prisma.blockTemplate.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException(`Block template with ID ${id} not found`);
		}

		if (existing.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to delete this template');
		}

		await this.prisma.blockTemplate.delete({
			where: { id },
		});

		this.logger.log(`Deleted block template ${id}`);
	}

	/**
	 * Generate block instances from template for a date range
	 */
	async generateInstances(
		id: string,
		userId: string,
		startDate: string,
		endDate: string,
	): Promise<{ created: number }> {
		const template = await this.prisma.blockTemplate.findUnique({
			where: { id },
		});

		if (!template) {
			throw new NotFoundException(`Block template with ID ${id} not found`);
		}

		if (template.userId !== userId) {
			throw new UnauthorizedException('Unauthorized to generate instances from this template');
		}

		const start = new Date(startDate);
		const end = new Date(endDate);
		let createdCount = 0;

		// Iterate through each day in the range
		const currentDate = new Date(start);
		while (currentDate <= end) {
			const dayOfWeek = currentDate.getDay();

			// Check if this day matches the template's days
			if (template.daysOfWeek.includes(dayOfWeek)) {
				// Check if instance already exists for this date
				const existingInstance = await this.prisma.blockInstance.findFirst({
					where: {
						templateId: id,
						date: currentDate,
					},
				});

				if (!existingInstance) {
					// Create block instance
					const [startHour, startMinute] = template.startTime.split(':').map(Number);
					const [endHour, endMinute] = template.endTime.split(':').map(Number);

					const startAt = new Date(currentDate);
					startAt.setHours(startHour, startMinute, 0, 0);

					const endAt = new Date(currentDate);
					endAt.setHours(endHour, endMinute, 0, 0);

					const durationMinutes = Math.round(
						(endAt.getTime() - startAt.getTime()) / (1000 * 60),
					);

					// Create BlockInstance and linked ScheduleEvent in a transaction
					await this.prisma.$transaction(async (tx) => {
						const instance = await tx.blockInstance.create({
							data: {
								templateId: id,
								userId,
								date: currentDate,
								startAt,
								endAt,
								durationMinutes,
								status: BlockStatus.SCHEDULED,
								title: template.title,
								description: template.description,
							},
						});

						// Create linked ScheduleEvent
						await tx.scheduleEvent.create({
							data: {
								userId,
								source: ScheduleEventSource.BLOCK_TEMPLATE,
								externalProvider: ScheduleEventProvider.INTERNAL,
								title: template.title,
								description: template.description,
								startAt,
								endAt,
								timezone: template.timezone,
								isAllDay: false,
								status: ScheduleEventStatus.CONFIRMED,
								blockInstanceId: instance.id,
							},
						});
					});

					createdCount++;
				}
			}

			// Move to next day
			currentDate.setDate(currentDate.getDate() + 1);
		}

		this.logger.log(`Generated ${createdCount} instances for template ${id}`);
		return { created: createdCount };
	}

	/**
	 * Transform database entity to response DTO
	 */
	private toResponseDto(template: BlockTemplate): BlockTemplateResponseDto {
		return {
			id: template.id,
			title: template.title,
			description: template.description ?? undefined,
			type: template.type,
			startTime: template.startTime,
			endTime: template.endTime,
			timezone: template.timezone ?? undefined,
			daysOfWeek: template.daysOfWeek,
			recurrenceType: template.recurrenceType,
			recurrencePattern: (template.recurrencePattern as Record<string, any>) ?? undefined,
			defaultTaskId: template.defaultTaskId ?? undefined,
			isActive: template.isActive,
			createdAt: template.createdAt,
			updatedAt: template.updatedAt,
		};
	}
}
