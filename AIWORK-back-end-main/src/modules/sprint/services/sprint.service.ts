import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateSprintDto } from '../dtos/create-sprint.dto';
import { UpdateSprintDto } from '../dtos/update-sprint.dto';
import { AddSprintItemDto } from '../dtos/add-sprint-item.dto';
import { UpdateSprintItemDto } from '../dtos/update-sprint-item.dto';
import { SprintQueryDto } from '../dtos/sprint-query.dto';
import { SprintLane, Prisma, TaskType } from '@prisma/client';
import { IPaginationResponse } from '@shared/interfaces/pagination.interface';

const PARKING_RANK = 1000000000;

@Injectable()
export class SprintService {
	private readonly logger = new Logger(SprintService.name);

	constructor(private readonly prisma: PrismaService) { }

	// ==================== SPRINT CRUD ====================

	/**
	 * Create a new sprint with optional task list
	 */
	async create(userId: string, data: CreateSprintDto) {
		// Validate tasks belong to user if taskIds provided
		if (data.taskIds && data.taskIds.length > 0) {
			const tasks = await this.prisma.task.findMany({
				where: { id: { in: data.taskIds }, userId },
				select: { id: true },
			});

			if (tasks.length !== data.taskIds.length) {
				throw new ForbiddenException(
					`Some tasks not found or do not belong to user. Found ${tasks.length} out of ${data.taskIds.length} tasks.`,
				);
			}
		}

		// Use transaction to create sprint and items atomically
		const result = await this.prisma.$transaction(async (tx) => {
			// Create the sprint
			const sprint = await tx.sprint.create({
				data: {
					userId,
					title: data.title,
					windowType: data.windowType,
					startDate: new Date(data.startDate),
					endDate: new Date(data.endDate),
					capacityMinutes: data.capacityMinutes,
					isActive: true,
				},
			});

			// Deactivate all other sprints for this user
			await tx.sprint.updateMany({
				where: { userId, id: { not: sprint.id }, isActive: true },
				data: { isActive: false },
			});

			// Create sprint items if taskIds provided
			if (data.taskIds && data.taskIds.length > 0) {
				await tx.sprintItem.createMany({
					data: data.taskIds.map((taskId, index) => ({
						sprintId: sprint.id,
						taskId,
						lane: SprintLane.MEDIUM, // Default lane
						rank: index, // Sequential rank
						isBuffer: false,
						isStarred: false,
						startNext: false,
					})),
				});
			}

			// Fetch complete sprint with items
			const completeSprint = await tx.sprint.findUnique({
				where: { id: sprint.id },
				include: this.getSprintInclude(),
			});

			return completeSprint!;
		});

		this.logger.log(`Sprint created: ${result.id} with ${data.taskIds?.length || 0} tasks`);
		return this.formatSprintResponse(result);
	}

	/**
	 * Get all sprints for a user with pagination
	 */
	async findAll(userId: string, query: SprintQueryDto): Promise<{ data: any[]; pagination: IPaginationResponse }> {
		const { page = 1, limit = 10, isActive, windowType } = query;
		const skip = (page - 1) * limit;

		const where: Prisma.SprintWhereInput = { userId };

		if (isActive !== undefined) {
			where.isActive = isActive;
		}

		if (windowType) {
			where.windowType = windowType;
		}

		const total = await this.prisma.sprint.count({ where });

		const sprints = await this.prisma.sprint.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				_count: { select: { items: true } },
				items: { select: { plannedMinutes: true } },
			},
		});

		return {
			data: sprints.map((sprint) => this.formatSprintListResponse(sprint)),
			pagination: { total, page, limit },
		};
	}

	/**
	 * Get active sprint for a user
	 */
	async findActive(userId: string) {
		const sprint = await this.prisma.sprint.findFirst({
			where: { userId, isActive: true },
			include: this.getSprintInclude(),
		});

		if (!sprint) {
			return null;
		}

		return this.formatSprintResponse(sprint);
	}

	/**
	 * Get a single sprint with items organized by lane
	 */
	async findOne(id: string, userId: string) {
		const sprint = await this.prisma.sprint.findUnique({
			where: { id },
			include: this.getSprintInclude(),
		});
		this.logger.log(`Finding sprint: ${sprint}`);
		console.log('Finding sprint:', JSON.stringify(sprint, null, 2));
		if (!sprint) {
			throw new NotFoundException(`Sprint with ID ${id} not found`);
		}

		if (sprint.userId !== userId) {
			throw new ForbiddenException('Access denied to this sprint');
		}

		return this.formatSprintResponse(sprint);
	}

	/**
	 * Update a sprint
	 */
	async update(id: string, userId: string, data: UpdateSprintDto) {
		const existing = await this.prisma.sprint.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Sprint with ID ${id} not found`);
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Access denied to this sprint');
		}

		const sprint = await this.prisma.sprint.update({
			where: { id },
			data: {
				title: data.title,
				capacityMinutes: data.capacityMinutes,
				isActive: data.isActive,
			},
			include: this.getSprintInclude(),
		});

		this.logger.log(`Sprint updated: ${id}`);
		return this.formatSprintResponse(sprint);
	}

	/**
	 * Delete a sprint
	 */
	async delete(id: string, userId: string) {
		const existing = await this.prisma.sprint.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Sprint with ID ${id} not found`);
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Access denied to this sprint');
		}

		await this.prisma.sprint.delete({ where: { id } });
		this.logger.log(`Sprint deleted: ${id}`);
	}

	/**
	 * Commit/activate a sprint
	 * Deactivates any other active sprint for the user
	 */
	async commit(id: string, userId: string) {
		const existing = await this.prisma.sprint.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Sprint with ID ${id} not found`);
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Access denied to this sprint');
		}

		// Deactivate all other sprints for this user
		await this.prisma.sprint.updateMany({
			where: { userId, isActive: true },
			data: { isActive: false },
		});

		// Activate this sprint
		const sprint = await this.prisma.sprint.update({
			where: { id },
			data: { isActive: true },
			include: this.getSprintInclude(),
		});

		this.logger.log(`Sprint committed: ${id}`);
		return this.formatSprintResponse(sprint);
	}

	/**
	 * Get sprint summary/capacity stats
	 */
	async getSummary(id: string, userId: string) {
		const sprint = await this.findOne(id, userId);

		const totalPlannedMinutes = sprint.items
			? Object.values(sprint.items as Record<string, any[]>)
				.flat()
				.reduce((sum: number, item: any) => sum + (item.plannedMinutes || 0), 0)
			: 0;

		const capacityMinutes = sprint.capacityMinutes || 0;
		const utilizationPercent = capacityMinutes > 0 ? Math.round((totalPlannedMinutes / capacityMinutes) * 100) : 0;

		return {
			sprintId: sprint.id,
			capacityMinutes,
			totalPlannedMinutes,
			remainingMinutes: Math.max(0, capacityMinutes - totalPlannedMinutes),
			utilizationPercent,
			itemCount: sprint.items ? Object.values(sprint.items as Record<string, any[]>).flat().length : 0,
		};
	}

	// ==================== SPRINT ITEM CRUD ====================

	/**
	 * Add a task to a sprint
	 */
	async addItem(sprintId: string, userId: string, data: AddSprintItemDto) {
		// Verify sprint ownership
		await this.findOne(sprintId, userId);

		// Verify task ownership
		const task = await this.prisma.task.findUnique({ where: { id: data.taskId } });
		if (!task) {
			throw new NotFoundException(`Task with ID ${data.taskId} not found`);
		}
		if (task.userId !== userId) {
			throw new ForbiddenException('Access denied to this task');
		}

		// Check if task is already in this sprint
		const existingItem = await this.prisma.sprintItem.findFirst({
			where: { sprintId, taskId: data.taskId },
		});
		if (existingItem) {
			throw new BadRequestException('Task is already in this sprint');
		}

		const targetLane = data.lane || SprintLane.LOW;

		// Use transaction to safely add item at end of lane
		const item = await this.prisma.$transaction(async (tx) => {
			// Get max rank for the lane
			const maxRank = await tx.sprintItem.aggregate({
				where: { sprintId, lane: targetLane },
				_max: { rank: true },
			});

			return tx.sprintItem.create({
				data: {
					sprintId,
					taskId: data.taskId,
					lane: targetLane,
					rank: (maxRank._max.rank ?? -1) + 1,
					plannedMinutes: data.plannedMinutes,
					isBuffer: data.isBuffer || false,
					isStarred: data.isStarred || false,
				},
				include: { task: true },
			});
		});

		this.logger.log(`Item added to sprint ${sprintId}: ${item.id}`);
		return this.formatSprintItemResponse(item);
	}

	/**
	 * Update a sprint item - handles properties, lane change, and reorder in one API
	 * Uses "parking rank" pattern for safe concurrent reordering
	 *
	 * @param sprintId - Sprint ID
	 * @param itemId - Sprint Item ID
	 * @param userId - User ID for ownership check
	 * @param data - Update data including lane, rank, and other properties
	 */
	async updateItem(sprintId: string, itemId: string, userId: string, data: UpdateSprintItemDto) {
		// Verify sprint ownership
		await this.findOne(sprintId, userId);

		const item = await this.prisma.sprintItem.findUnique({ where: { id: itemId } });
		if (!item || item.sprintId !== sprintId) {
			throw new NotFoundException(`Sprint item with ID ${itemId} not found in sprint ${sprintId}`);
		}

		const oldLane = item.lane;
		const oldRank = item.rank;
		const newLane = data.lane ?? oldLane;
		const hasLaneChange = data.lane !== undefined && data.lane !== oldLane;
		const hasRankChange = data.rank !== undefined;

		// If no lane/rank change, just update properties
		if (!hasLaneChange && !hasRankChange) {
			const updated = await this.prisma.sprintItem.update({
				where: { id: itemId },
				data: {
					plannedMinutes: data.plannedMinutes,
					isBuffer: data.isBuffer,
					isStarred: data.isStarred,
					startNext: data.startNext,
				},
				include: { task: true },
			});

			this.logger.log(`Sprint item updated (properties only): ${itemId}`);
			return this.formatSprintItemResponse(updated);
		}

		// Use transaction with "parking rank" pattern for safe reorder
		const updated = await this.prisma.$transaction(async (tx) => {
			// Lock items in affected lanes to prevent concurrent reorder
			if (hasLaneChange) {
				// Lock both old and new lanes
				await tx.$queryRaw`
					SELECT id FROM "sprint_item"
					WHERE sprint_id = ${sprintId}::uuid
					AND lane IN (${oldLane}, ${newLane})
					FOR UPDATE
				`;
			} else {
				// Lock only the current lane
				await tx.$queryRaw`
					SELECT id FROM "sprint_item"
					WHERE sprint_id = ${sprintId}::uuid
					AND lane = ${oldLane}
					FOR UPDATE
				`;
			}

			// Park the item at a very high rank to avoid unique constraint issues
			await tx.sprintItem.update({
				where: { id: itemId },
				data: { rank: PARKING_RANK },
			});

			if (hasLaneChange) {
				// Moving to different lane
				// 1) Close gap in old lane
				await tx.sprintItem.updateMany({
					where: {
						sprintId,
						lane: oldLane,
						rank: { gt: oldRank ?? 0 },
					},
					data: { rank: { decrement: 1 } },
				});

				// 2) Determine new rank
				let newRank = data.rank;
				if (newRank === undefined) {
					// Add to end of new lane
					const maxRank = await tx.sprintItem.aggregate({
						where: { sprintId, lane: newLane, rank: { lt: PARKING_RANK } },
						_max: { rank: true },
					});
					newRank = (maxRank._max.rank ?? -1) + 1;
				} else {
					// 3) Open gap in new lane at target position
					await tx.sprintItem.updateMany({
						where: {
							sprintId,
							lane: newLane,
							rank: { gte: newRank, lt: PARKING_RANK },
						},
						data: { rank: { increment: 1 } },
					});
				}

				// 4) Move item to new lane and rank
				return tx.sprintItem.update({
					where: { id: itemId },
					data: {
						lane: newLane,
						rank: newRank,
						plannedMinutes: data.plannedMinutes,
						isBuffer: data.isBuffer,
						isStarred: data.isStarred,
						startNext: data.startNext,
					},
					include: { task: true },
				});
			} else {
				// Reordering within same lane
				const newRank = data.rank!;

				if (newRank < oldRank!) {
					// Moving up: shift items down
					await tx.sprintItem.updateMany({
						where: {
							sprintId,
							lane: oldLane,
							rank: { gte: newRank, lt: oldRank!, not: { equals: PARKING_RANK } },
						},
						data: { rank: { increment: 1 } },
					});
				} else if (newRank > oldRank!) {
					// Moving down: shift items up
					await tx.sprintItem.updateMany({
						where: {
							sprintId,
							lane: oldLane,
							rank: { gt: oldRank!, lte: newRank, not: { equals: PARKING_RANK } },
						},
						data: { rank: { decrement: 1 } },
					});
				}

				// Set final rank
				return tx.sprintItem.update({
					where: { id: itemId },
					data: {
						rank: newRank,
						plannedMinutes: data.plannedMinutes,
						isBuffer: data.isBuffer,
						isStarred: data.isStarred,
						startNext: data.startNext,
					},
					include: { task: true },
				});
			}
		});

		this.logger.log(`Sprint item updated: ${itemId} (lane: ${oldLane} -> ${newLane})`);
		return this.formatSprintItemResponse(updated);
	}

	/**
	 * Remove a task from a sprint
	 * Closes the gap in rank after removal
	 */
	async removeItem(sprintId: string, itemId: string, userId: string) {
		// Verify sprint ownership
		await this.findOne(sprintId, userId);

		const item = await this.prisma.sprintItem.findUnique({ where: { id: itemId } });
		if (!item || item.sprintId !== sprintId) {
			throw new NotFoundException(`Sprint item with ID ${itemId} not found in sprint ${sprintId}`);
		}

		// Use transaction to delete and close gap
		await this.prisma.$transaction(async (tx) => {
			// Lock the lane
			await tx.$queryRaw`
				SELECT id FROM "sprint_item"
				WHERE sprint_id = ${sprintId}::uuid
				AND lane = ${item.lane}
				FOR UPDATE
			`;

			// Delete the item
			await tx.sprintItem.delete({ where: { id: itemId } });

			// Close the gap
			await tx.sprintItem.updateMany({
				where: {
					sprintId,
					lane: item.lane,
					rank: { gt: item.rank ?? 0 },
				},
				data: { rank: { decrement: 1 } },
			});
		});

		this.logger.log(`Sprint item removed: ${itemId}`);
	}

	// ==================== AI PLACEHOLDERS ====================

	/**
	 * Placeholder for AI auto-plan functionality
	 * TODO: Integrate with AI service for smart task assignment
	 */
	async autoPlan(sprintId: string, userId: string) {
		await this.findOne(sprintId, userId);

		this.logger.log(`[PLACEHOLDER] Auto-plan requested for sprint ${sprintId}`);

		return {
			message: 'Auto-plan queued for processing',
			sprintId,
			// Mock suggested assignments
			suggestions: [
				{ taskId: 'mock-task-1', suggestedLane: 'HIGH', reason: 'High priority, due soon' },
				{ taskId: 'mock-task-2', suggestedLane: 'MEDIUM', reason: 'Medium priority, fits capacity' },
				{ taskId: 'mock-task-3', suggestedLane: 'LOW', reason: 'Low priority, can be deferred' },
			],
		};
	}

	// ==================== HELPERS ====================

	private getSprintInclude() {
		return {
			items: {
				where: {
					task: { taskType: TaskType.ACTIVE },
				},
				orderBy: { rank: 'asc' as const },
				include: {
					task: {
						select: {
							id: true,
							title: true,
							status: true,
							priority: true,
							expectedTimeHours: true,
							steps: true,
							taskTags: {
								include: {
									tag: {
										select: { id: true, name: true, color: true },
									},
								},
							},
						},
					},
				},
			},
		};
	}

	private formatSprintResponse(sprint: any) {
		// Organize items by task status
		const itemsByStatus: Record<string, any[]> = {
			BUFFER: [],
			TODO: [],
			DOING: [],
			DONE: [],
		};

		let totalPlannedMinutes = 0;

		for (const item of sprint.items || []) {
			const formattedItem = this.formatSprintItemResponse(item);
			// Group by status: BUFFER items go to BUFFER, others by their task status
			const status = item.isBuffer ? 'BUFFER' : item.task?.status || 'TODO';
			if (itemsByStatus[status]) {
				itemsByStatus[status].push(formattedItem);
			}
			totalPlannedMinutes += item.plannedMinutes || 0;
		}

		const capacityMinutes = sprint.capacityMinutes || 0;
		const utilizationPercent = capacityMinutes > 0 ? Math.round((totalPlannedMinutes / capacityMinutes) * 100) : 0;

		return {
			id: sprint.id,
			title: sprint.title,
			windowType: sprint.windowType,
			startDate: sprint.startDate,
			endDate: sprint.endDate,
			capacityMinutes: sprint.capacityMinutes,
			isActive: sprint.isActive,
			items: itemsByStatus,
			summary: {
				totalPlannedMinutes,
				capacityMinutes,
				utilizationPercent,
			},
			createdAt: sprint.createdAt,
			updatedAt: sprint.updatedAt,
		};
	}

	private formatSprintListResponse(sprint: any) {
		const totalPlannedMinutes =
			sprint.items?.reduce((sum: number, item: any) => sum + (item.plannedMinutes || 0), 0) || 0;

		return {
			id: sprint.id,
			title: sprint.title,
			windowType: sprint.windowType,
			startDate: sprint.startDate,
			endDate: sprint.endDate,
			capacityMinutes: sprint.capacityMinutes,
			isActive: sprint.isActive,
			itemCount: sprint._count?.items || 0,
			totalPlannedMinutes,
			createdAt: sprint.createdAt,
		};
	}

	private formatSprintItemResponse(item: any) {
		return {
			id: item.id,
			taskId: item.taskId,
			task: item.task
				? {
					id: item.task.id,
					title: item.task.title,
					status: item.task.status,
					priority: item.task.priority,
					expectedTimeHours: item.task.expectedTimeHours,
					steps: item.task.steps,
					tags: item.task.taskTags?.map((tt: any) => ({
						id: tt.tag.id,
						name: tt.tag.name,
						color: tt.tag.color,
						isPrimary: tt.isPrimary,
					})) || [],
				}
				: null,
			lane: item.lane,
			rank: item.rank,
			plannedMinutes: item.plannedMinutes,
			isBuffer: item.isBuffer,
			isStarred: item.isStarred,
			startNext: item.startNext,
			completedAt: item.completedAt,
		};
	}
}
