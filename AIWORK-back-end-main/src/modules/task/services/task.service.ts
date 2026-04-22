import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { CreateStepDto } from '../dtos/create-step.dto';
import { UpdateStepDto, UpdateStepsDto } from '../dtos/update-step.dto';
import { TaskQueryDto } from '../dtos/task-query.dto';
import { BulkUpdateTaskDto, BulkUpdateTaskStatusDto, BulkUpdateTaskRankDto, BulkUpdateTaskFieldsDto } from '../dtos/bulk-update-tasks.dto';
import { TaskStatus, TaskType, Priority, Prisma } from '@prisma/client';
import { IPaginationResponse } from '@shared/interfaces/pagination.interface';
import { CompositeScorerService } from '@modules/scoring/services/composite-scorer.service';
import { SuggestLinksService } from '@modules/scoring/services/suggest-links.service';

const PARKING_ORDER_INDEX = 1000000000;

@Injectable()
export class TaskService {
	private readonly logger = new Logger(TaskService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly scorer: CompositeScorerService,
		private readonly suggestLinksService: SuggestLinksService,
	) { }

	// ==================== TASK CRUD ====================

	/**
	 * Create a new task with optional steps and tags
	 */
	async create(userId: string, data: CreateTaskDto) {
		const task = await this.prisma.task.create({
			data: {
				userId,
				title: data.title,
				description: data.description || '',
				expectedTimeHours: data.expectedTimeHours,
				status: data.status || TaskStatus.TODO,
				taskType: data.taskType || TaskType.BACKLOG,
				priority: data.priority || Priority.MEDIUM,
				dueAt: data.dueAt ? new Date(data.dueAt) : null,
				goalId: data.goalId || undefined,
				// Create steps if provided
				steps: data.steps?.length
					? {
						create: data.steps.map((step, index) => ({
							title: step.title,
							description: step.description,
							orderIndex: step.orderIndex ?? index,
							userEstMinutes: step.userEstMinutes,
						})),
					}
					: undefined,
				// Create tag associations if provided
				taskTags: data.tagIds?.length
					? {
						create: data.tagIds.map((tagId, index) => ({
							tagId,
							isPrimary: index === 0,
						})),
					}
					: undefined,
			},
			include: this.getTaskInclude(),
		});

		this.logger.log(`Task created: ${task.id}`);

		// Suggest goal, client, and tag links when user didn't provide them
		if (!data.goalId) {
			try {
				await this.suggestLinksService.suggestLinks(userId, [task.id]);
			} catch (err) {
				this.logger.warn(`Failed to suggest links for task ${task.id}: ${err.message}`);
			}
		}

		// Await composite scoring so FE receives dimension scores immediately
		try {
			await this.scorer.scoreTask(task.id);
		} catch (err) {
			this.logger.warn(`Failed to score new task ${task.id}: ${err.message}`);
		}

		return this.formatTaskResponse(task);
	}

	/**
	 * Get all tasks for a user with pagination and filtering
	 */
	async findAll(userId: string, query: TaskQueryDto): Promise<{ data: any[]; pagination: IPaginationResponse }> {
		const { page = 1, limit = 10, status, taskType, priority, tagIds, search, sortBy = 'rank', sortOrder = 'asc' } = query;
		const skip = (page - 1) * limit;

		// Build where clause
		const where: Prisma.TaskWhereInput = {
			userId,
			archivedAt: null,
		};

		if (status?.length) {
			where.status = { in: status };
		}

		if (taskType) {
			where.taskType = taskType;
		}

		if (priority?.length) {
			where.priority = { in: priority };
		}

		if (tagIds?.length) {
			where.taskTags = {
				some: {
					tagId: { in: tagIds },
				},
			};
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ steps: { some: { title: { contains: search, mode: 'insensitive' } } } },
			];
		}
		// Get total count
		const total = await this.prisma.task.count({ where });

		// Build orderBy — push null to the bottom for nullable fields
		const nullableFields = ['expectedTimeHours', 'dueAt'];
		let orderBy: Prisma.TaskOrderByWithRelationInput | Prisma.TaskOrderByWithRelationInput[];

		if (nullableFields.includes(sortBy)) {
			orderBy = [
				{ [sortBy]: { sort: sortOrder, nulls: 'last' } },
			];
		} else {
			orderBy = { [sortBy]: sortOrder };
		}

		// Get paginated tasks
		const tasks = await this.prisma.task.findMany({
			where,
			skip,
			take: limit,
			orderBy,
			include: this.getTaskListInclude(),
		});

		return {
			data: tasks.map((task) => this.formatTaskListResponse(task)),
			pagination: { total, page, limit },
		};
	}

	/**
	 * Get a single task with steps and tags
	 */
	async findOne(id: string, userId: string) {
		const task = await this.prisma.task.findUnique({
			where: { id },
			include: this.getTaskInclude(),
		});

		if (!task) {
			throw new NotFoundException(`Task with ID ${id} not found`);
		}

		if (task.userId !== userId) {
			throw new ForbiddenException('Access denied to this task');
		}

		return this.formatTaskResponse(task);
	}

	/**
	 * Update a task
	 */
	async update(id: string, userId: string, data: UpdateTaskDto) {
		// Verify ownership
		const existing = await this.prisma.task.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Task with ID ${id} not found`);
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Access denied to this task');
		}

		const task = await this.prisma.task.update({
			where: { id },
			data: {
				title: data.title,
				description: data.description,
				expectedTimeHours: data.expectedTimeHours,
				status: data.status,
				taskType: data.taskType,
				priority: data.priority,
				dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
				goalId: data.goalId,
				clientId: data.clientId,
			},
			include: this.getTaskInclude(),
		});

		this.logger.log(`Task updated: ${id}`);

		// Await rescore if scoring-relevant fields changed
		const scoringFieldChanged =
			data.title !== undefined ||
			data.description !== undefined ||
			data.dueAt !== undefined ||
			data.goalId !== undefined ||
			data.clientId !== undefined;
		if (scoringFieldChanged) {
			try {
				await this.scorer.scoreTask(id);
			} catch (err) {
				this.logger.warn(`Failed to rescore task ${id}: ${err.message}`);
			}
		}

		return this.formatTaskResponse(task);
	}

	/**
	 * Bulk update task priorities
	 *
	 * Updates multiple tasks' priority values atomically in a single transaction.
	 * Designed for drag & drop operations with debounced updates from frontend.
	 *
	 * @param userId - User ID for ownership verification
	 * @param updates - Array of task updates (taskId + priority)
	 * @returns Array of updated tasks
	 */
	async bulkUpdatePriorities(userId: string, updates: BulkUpdateTaskDto[]) {
		// Extract task IDs
		const taskIds = updates.map((u) => u.taskId);

		// Check for duplicate taskIds
		const uniqueIds = new Set(taskIds);
		if (uniqueIds.size !== taskIds.length) {
			throw new ForbiddenException('Duplicate task IDs in request');
		}

		// Fetch all tasks to validate ownership
		const tasks = await this.prisma.task.findMany({
			where: { id: { in: taskIds } },
			select: { id: true, userId: true, priority: true },
		});

		// Validate all tasks found
		if (tasks.length !== updates.length) {
			throw new NotFoundException('One or more tasks not found');
		}

		// Validate all tasks belong to the user
		const unauthorizedTasks = tasks.filter((task) => task.userId !== userId);
		if (unauthorizedTasks.length > 0) {
			throw new ForbiddenException(
				`Access denied to tasks: ${unauthorizedTasks.map((t) => t.id).join(', ')}`,
			);
		}

		// Build task map for quick lookup
		const taskMap = new Map(tasks.map((task) => [task.id, task]));

		// Build update plan: filter out no-op updates (already at target priority)
		const updatePlan = updates
			.map((update) => {
				const currentTask = taskMap.get(update.taskId)!;
				return {
					taskId: update.taskId,
					oldPriority: currentTask.priority,
					newPriority: update.priority,
					hasPriorityChange: currentTask.priority !== update.priority,
				};
			})
			.filter((plan) => plan.hasPriorityChange);

		// If no actual changes, return current state
		if (updatePlan.length === 0) {
			this.logger.log('Bulk update: No priority changes detected, returning current state');
			const currentTasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				include: this.getTaskInclude(),
			});
			return currentTasks.map((task) => this.formatTaskResponse(task));
		}

		// Execute bulk update in transaction
		const updatedTasks = await this.prisma.$transaction(
			updatePlan.map((plan) =>
				this.prisma.task.update({
					where: { id: plan.taskId },
					data: { priority: plan.newPriority },
					include: this.getTaskInclude(),
				}),
			),
		);

		this.logger.log(`Bulk updated ${updatedTasks.length} task priorities for user ${userId}`);

		return updatedTasks.map((task) => this.formatTaskResponse(task));
	}

	/**
	 * Delete a task
	 */
	/**
	 * Bulk update task statuses
	 * Designed for drag & drop operations with debounced updates from frontend.
	 *
	 * @param userId - User ID for ownership verification
	 * @param updates - Array of task updates (taskId + status)
	 * @returns Array of updated tasks
	 */
	async bulkUpdateStatuses(userId: string, updates: BulkUpdateTaskStatusDto[]) {
		// Extract task IDs
		const taskIds = updates.map((u) => u.taskId);

		// Check for duplicate taskIds
		const uniqueIds = new Set(taskIds);
		if (uniqueIds.size !== taskIds.length) {
			throw new ForbiddenException('Duplicate task IDs in request');
		}

		// Fetch all tasks to validate ownership
		const tasks = await this.prisma.task.findMany({
			where: { id: { in: taskIds } },
			select: { id: true, userId: true, status: true },
		});

		// Validate all tasks found
		if (tasks.length !== updates.length) {
			throw new NotFoundException('One or more tasks not found');
		}

		// Validate all tasks belong to the user
		const unauthorizedTasks = tasks.filter((task) => task.userId !== userId);
		if (unauthorizedTasks.length > 0) {
			throw new ForbiddenException(
				`Access denied to tasks: ${unauthorizedTasks.map((t) => t.id).join(', ')}`,
			);
		}

		// Build task map for quick lookup
		const taskMap = new Map(tasks.map((task) => [task.id, task]));

		// Build update plan: filter out no-op updates (already at target status)
		const updatePlan = updates
			.map((update) => {
				const currentTask = taskMap.get(update.taskId)!;
				return {
					taskId: update.taskId,
					oldStatus: currentTask.status,
					newStatus: update.status,
					hasStatusChange: currentTask.status !== update.status,
				};
			})
			.filter((plan) => plan.hasStatusChange);

		// If no actual changes, return current state
		if (updatePlan.length === 0) {
			this.logger.log('Bulk update: No status changes detected, returning current state');
			const currentTasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				include: this.getTaskInclude(),
			});
			return currentTasks.map((task) => this.formatTaskResponse(task));
		}

		// Execute bulk update in transaction
		const updatedTasks = await this.prisma.$transaction(
			updatePlan.map((plan) =>
				this.prisma.task.update({
					where: { id: plan.taskId },
					data: { status: plan.newStatus },
					include: this.getTaskInclude(),
				}),
			),
		);

		this.logger.log(`Bulk updated ${updatedTasks.length} task statuses for user ${userId}`);

		return updatedTasks.map((task) => this.formatTaskResponse(task));
	}

	/**
	 * Bulk update task ranks
	 * Designed for drag & drop reorder on the UI.
	 * Frontend sends the full list of affected tasks with their new rank values.
	 */
	async bulkUpdateRanks(userId: string, updates: BulkUpdateTaskRankDto[]) {
		const taskIds = updates.map((u) => u.taskId);

		const uniqueIds = new Set(taskIds);
		if (uniqueIds.size !== taskIds.length) {
			throw new ForbiddenException('Duplicate task IDs in request');
		}

		const tasks = await this.prisma.task.findMany({
			where: { id: { in: taskIds } },
			select: { id: true, userId: true, rank: true },
		});

		if (tasks.length !== updates.length) {
			throw new NotFoundException('One or more tasks not found');
		}

		const unauthorizedTasks = tasks.filter((task) => task.userId !== userId);
		if (unauthorizedTasks.length > 0) {
			throw new ForbiddenException(
				`Access denied to tasks: ${unauthorizedTasks.map((t) => t.id).join(', ')}`,
			);
		}

		const taskMap = new Map(tasks.map((task) => [task.id, task]));

		const updatePlan = updates
			.map((update) => {
				const currentTask = taskMap.get(update.taskId)!;
				return {
					taskId: update.taskId,
					newRank: update.rank,
					hasChange: currentTask.rank !== update.rank,
				};
			})
			.filter((plan) => plan.hasChange);

		if (updatePlan.length === 0) {
			this.logger.log('Bulk update: No rank changes detected, returning current state');
			const currentTasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				include: this.getTaskInclude(),
			});
			return currentTasks.map((task) => this.formatTaskResponse(task));
		}

		const updatedTasks = await this.prisma.$transaction(
			updatePlan.map((plan) =>
				this.prisma.task.update({
					where: { id: plan.taskId },
					data: { rank: plan.newRank },
					include: this.getTaskInclude(),
				}),
			),
		);

		this.logger.log(`Bulk updated ${updatedTasks.length} task ranks for user ${userId}`);

		return updatedTasks.map((task) => this.formatTaskResponse(task));
	}

	/**
	 * Bulk update task fields (status, rank, priority, type)
	 * Designed for comprehensive bulk updates from the frontend.
	 *
	 * @param userId - User ID for ownership verification
	 * @param updates - Array of task updates (taskId + optional status/rank/priority/taskType)
	 * @returns Array of updated tasks
	 */
	async bulkUpdateFields(userId: string, updates: BulkUpdateTaskFieldsDto[]) {
		// Extract task IDs
		const taskIds = updates.map((u) => u.taskId);

		// Check for duplicate taskIds
		const uniqueIds = new Set(taskIds);
		if (uniqueIds.size !== taskIds.length) {
			throw new ForbiddenException('Duplicate task IDs in request');
		}

		// Fetch all tasks to validate ownership
		const tasks = await this.prisma.task.findMany({
			where: { id: { in: taskIds } },
			select: { id: true, userId: true, status: true, rank: true, priority: true, taskType: true },
		});

		// Validate all tasks found
		if (tasks.length !== updates.length) {
			throw new NotFoundException('One or more tasks not found');
		}

		// Validate all tasks belong to the user
		const unauthorizedTasks = tasks.filter((task) => task.userId !== userId);
		if (unauthorizedTasks.length > 0) {
			throw new ForbiddenException(
				`Access denied to tasks: ${unauthorizedTasks.map((t) => t.id).join(', ')}`,
			);
		}

		// Build task map for quick lookup
		const taskMap = new Map(tasks.map((task) => [task.id, task]));

		// Build update plan: filter out no-op updates
		const updatePlan = updates
			.map((update) => {
				const currentTask = taskMap.get(update.taskId)!;
				const hasChange =
					(update.status !== undefined && currentTask.status !== update.status) ||
					(update.rank !== undefined && currentTask.rank !== update.rank) ||
					(update.priority !== undefined && currentTask.priority !== update.priority) ||
					(update.taskType !== undefined && currentTask.taskType !== update.taskType);

				return {
					taskId: update.taskId,
					status: update.status,
					rank: update.rank,
					priority: update.priority,
					taskType: update.taskType,
					hasChange,
				};
			})
			.filter((plan) => plan.hasChange);

		// Collect sprintId updates for tasks that are (or will become) ACTIVE
		const sprintItemUpdates: { taskId: string; sprintId: string }[] = [];
		// Tasks with explicit sprintId provided
		for (const u of updates) {
			const effectiveTaskType = u.taskType ?? taskMap.get(u.taskId)!.taskType;
			if (effectiveTaskType !== TaskType.ACTIVE) continue;

			if (u.sprintId !== undefined) {
				sprintItemUpdates.push({ taskId: u.taskId, sprintId: u.sprintId });
			} else if (u.taskType === TaskType.ACTIVE && taskMap.get(u.taskId)!.taskType !== TaskType.ACTIVE) {
				// Task is being changed TO ACTIVE without explicit sprintId -> use the user's active sprint
				const activeSprint = await this.prisma.sprint.findFirst({
					where: { userId, isActive: true },
					select: { id: true },
				});
				if (activeSprint) {
					sprintItemUpdates.push({ taskId: u.taskId, sprintId: activeSprint.id });
				}
			}
		}

		// If no actual changes, return current state
		if (updatePlan.length === 0 && sprintItemUpdates.length === 0) {
			this.logger.log('Bulk update: No field changes detected, returning current state');
			const currentTasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				include: this.getTaskInclude(),
			});
			return currentTasks.map((task) => this.formatTaskResponse(task));
		}

		// Execute bulk update in transaction
		const updatedTasks = await this.prisma.$transaction(async (tx) => {
			// 1. Update task fields
			const taskResults = updatePlan.length > 0
				? await Promise.all(
					updatePlan.map((plan) =>
						tx.task.update({
							where: { id: plan.taskId },
							data: {
								...(plan.status !== undefined && { status: plan.status }),
								...(plan.rank !== undefined && { rank: plan.rank }),
								...(plan.priority !== undefined && { priority: plan.priority }),
								...(plan.taskType !== undefined && { taskType: plan.taskType }),
							},
							include: this.getTaskInclude(),
						}),
					),
				)
				: [];

			// 2. Handle SprintItem upserts for ACTIVE tasks with sprintId
			for (const item of sprintItemUpdates) {
				const existingSprintItem = await tx.sprintItem.findFirst({
					where: { taskId: item.taskId },
				});

				if (existingSprintItem) {
					await tx.sprintItem.update({
						where: { id: existingSprintItem.id },
						data: { sprintId: item.sprintId },
					});
				} else {
					await tx.sprintItem.create({
						data: {
							sprintId: item.sprintId,
							taskId: item.taskId,
							lane: 'MEDIUM',
							rank: 0,
						},
					});
				}
			}

			return taskResults;
		});

		this.logger.log(`Bulk updated ${updatedTasks.length} tasks with multiple fields for user ${userId}`);

		// If we only had sprintItem updates but no task field changes, fetch and return the tasks
		if (updatedTasks.length === 0) {
			const currentTasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				include: this.getTaskInclude(),
			});
			return currentTasks.map((task) => this.formatTaskResponse(task));
		}

		return updatedTasks.map((task) => this.formatTaskResponse(task));
	}

	/**
	 * Bulk delete tasks
	 */
	async bulkDelete(userId: string, taskIds: string[]) {
		const uniqueIds = new Set(taskIds);
		if (uniqueIds.size !== taskIds.length) {
			throw new ForbiddenException('Duplicate task IDs in request');
		}

		const tasks = await this.prisma.task.findMany({
			where: { id: { in: taskIds } },
			select: { id: true, userId: true },
		});

		if (tasks.length !== taskIds.length) {
			throw new NotFoundException('One or more tasks not found');
		}

		const unauthorizedTasks = tasks.filter((task) => task.userId !== userId);
		if (unauthorizedTasks.length > 0) {
			throw new ForbiddenException(
				`Access denied to tasks: ${unauthorizedTasks.map((t) => t.id).join(', ')}`,
			);
		}

		await this.prisma.task.deleteMany({
			where: { id: { in: taskIds } },
		});

		this.logger.log(`Bulk deleted ${taskIds.length} tasks for user ${userId}`);
		return taskIds.length;
	}

	/**
	 * Delete a task
	 */
	async delete(id: string, userId: string) {
		// Verify ownership
		const existing = await this.prisma.task.findUnique({ where: { id } });
		if (!existing) {
			throw new NotFoundException(`Task with ID ${id} not found`);
		}
		if (existing.userId !== userId) {
			throw new ForbiddenException('Access denied to this task');
		}

		await this.prisma.task.delete({ where: { id } });
		this.logger.log(`Task deleted: ${id}`);
	}

	/**
	 * Get summary stats for user's tasks
	 */
	async getSummary(userId: string) {
		const tasks = await this.prisma.task.findMany({
			where: { userId, archivedAt: null },
			include: {
				steps: {
					select: { userEstMinutes: true, sysEstMinutes: true },
				},
			},
		});

		let totalEstimatedMinutes = 0;
		let totalTasks = tasks.length;
		let completedTasks = 0;
		let totalSteps = 0;

		for (const task of tasks) {
			if (task.status === TaskStatus.DONE) {
				completedTasks++;
			}
			for (const step of task.steps) {
				totalSteps++;
				totalEstimatedMinutes += step.userEstMinutes || step.sysEstMinutes || 0;
			}
			// Add task-level estimate if no steps
			if (task.steps.length === 0 && task.expectedTimeHours) {
				totalEstimatedMinutes += task.expectedTimeHours * 60;
			}
		}

		return {
			totalTasks,
			completedTasks,
			totalSteps,
			totalEstimatedMinutes,
			totalEstimatedHours: Math.round((totalEstimatedMinutes / 60) * 100) / 100,
		};
	}

	// ==================== STEP CRUD ====================

	/**
	 * Add a step to a task
	 */
	async addStep(taskId: string, userId: string, data: CreateStepDto) {
		// Verify task ownership
		await this.findOne(taskId, userId);

		// Get max order index
		const maxOrder = await this.prisma.step.aggregate({
			where: { taskId },
			_max: { orderIndex: true },
		});

		const step = await this.prisma.step.create({
			data: {
				taskId,
				title: data.title,
				description: data.description,
				orderIndex: data.orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1,
				userEstMinutes: data.userEstMinutes,
			},
		});

		this.logger.log(`Step added to task ${taskId}: ${step.id}`);
		return step;
	}

	/**
	 * Update a step (supports properties update and reorder via orderIndex)
	 * Uses "parking index" pattern for transaction-safe concurrent reordering
	 */
	async updateStep(taskId: string, stepId: string, userId: string, data: UpdateStepDto) {
		// Verify task ownership
		await this.findOne(taskId, userId);

		const step = await this.prisma.step.findUnique({
			where: { id: stepId },
		});

		if (!step || step.taskId !== taskId) {
			throw new NotFoundException(`Step with ID ${stepId} not found in task ${taskId}`);
		}

		// If orderIndex is provided, we need to handle reordering with transactions
		if (data.orderIndex !== undefined && data.orderIndex !== step.orderIndex) {
			const oldIndex = step.orderIndex;
			const newIndex = data.orderIndex;

			const updated = await this.prisma.$transaction(async (tx) => {
				// Lock the steps for this task
				await tx.$queryRaw`
					SELECT id FROM "step"
					WHERE task_id = ${taskId}::uuid
					FOR UPDATE
				`;
				// Park the step at a high index to avoid unique constraint issues
				await tx.step.update({
					where: { id: stepId },
					data: { orderIndex: PARKING_ORDER_INDEX },
				});

				if (newIndex < oldIndex) {
					// Moving up: shift items between newIndex and oldIndex-1 down by 1
					await tx.step.updateMany({
						where: {
							taskId,
							orderIndex: { gte: newIndex, lt: oldIndex },
						},
						data: { orderIndex: { increment: 1 } },
					});
				} else {
					// Moving down: shift items between oldIndex+1 and newIndex up by 1
					await tx.step.updateMany({
						where: {
							taskId,
							orderIndex: { gt: oldIndex, lte: newIndex },
						},
						data: { orderIndex: { decrement: 1 } },
					});
				}

				// Move the step to its final position with all property updates
				return tx.step.update({
					where: { id: stepId },
					data: {
						orderIndex: newIndex,
						title: data.title,
						description: data.description,
						userEstMinutes: data.userEstMinutes,
						isDone: data.isDone,
					},
				});
			});

			this.logger.log(`Step updated with reorder: ${stepId}`);
			return updated;
		}

		// Simple update without reorder
		const updated = await this.prisma.step.update({
			where: { id: stepId },
			data: {
				title: data.title,
				description: data.description,
				userEstMinutes: data.userEstMinutes,
				isDone: data.isDone,
			},
		});

		this.logger.log(`Step updated: ${stepId}`);
		return updated;
	}

	/**
	 * Update a step (supports properties update and reorder via orderIndex)
	 * Uses "parking index" pattern for transaction-safe concurrent reordering
	 */
	async updateSteps(taskId: string, userId: string, data: UpdateStepsDto) {
		// 1. Verify task ownership (Bảo mật)
		await this.findOne(taskId, userId);
		const steps = data.steps;
		const stepIds = steps.map((s) => s.id);

		if (stepIds.length === 0) return [];

		// Sử dụng Transaction để đảm bảo an toàn tuyệt đối
		return this.prisma.$transaction(async (tx) => {
			await tx.$executeRaw`
            UPDATE "step"
            SET "order_index" = -("order_index" + 9999999)
            WHERE "task_id" = ${taskId}::uuid
            AND "id" = ANY(${stepIds}::uuid[])
        `;
			const updatePromises = steps.map((step) =>
				tx.step.update({
					where: { id: step.id },
					data: {
						title: step.title,
						description: step.description,
						userEstMinutes: step.userEstMinutes,
						sysEstMinutes: step.sysEstMinutes,
						isDone: step.isDone,
						orderIndex: step.orderIndex, // Ghi thẳng vị trí FE mong muốn
					},
				})
			);

			const result = await Promise.all(updatePromises);

			this.logger.log(`Batch updated ${result.length} steps for task ${taskId}`);
			return result;
		});
	}

	/**
	 * Delete a step
	 */
	async deleteStep(taskId: string, stepId: string, userId: string) {
		// Verify task ownership
		await this.findOne(taskId, userId);

		const step = await this.prisma.step.findUnique({
			where: { id: stepId },
		});

		if (!step || step.taskId !== taskId) {
			throw new NotFoundException(`Step with ID ${stepId} not found in task ${taskId}`);
		}

		await this.prisma.step.delete({ where: { id: stepId } });
		this.logger.log(`Step deleted: ${stepId}`);
	}

	// ==================== TAG ASSIGNMENT ====================

	/**
	 * Assign tags to a task
	 */
	async assignTags(taskId: string, userId: string, tagIds: string[]) {
		// Verify task ownership
		await this.findOne(taskId, userId);

		// Remove existing tags and add new ones
		await this.prisma.taskTag.deleteMany({ where: { taskId } });

		if (tagIds.length > 0) {
			await this.prisma.taskTag.createMany({
				data: tagIds.map((tagId, index) => ({
					taskId,
					tagId,
					isPrimary: index === 0,
				})),
			});
		}

		this.logger.log(`Tags assigned to task ${taskId}`);

		// Await rescore after tag change
		try {
			await this.scorer.scoreTask(taskId);
		} catch (err) {
			this.logger.warn(`Failed to rescore task ${taskId} after tag assignment: ${err.message}`);
		}

		return this.findOne(taskId, userId);
	}

	/**
	 * Remove a tag from a task
	 */
	async removeTag(taskId: string, tagId: string, userId: string) {
		// Verify task ownership
		await this.findOne(taskId, userId);

		await this.prisma.taskTag.delete({
			where: {
				taskId_tagId: { taskId, tagId },
			},
		});

		this.logger.log(`Tag ${tagId} removed from task ${taskId}`);
	}

	// ==================== AI PLACEHOLDERS ====================

	/**
	 * Placeholder for AI re-split functionality
	 * TODO: Integrate with AI service to regenerate steps
	 */
	async resplit(taskId: string, userId: string) {
		// Verify task ownership
		const task = await this.findOne(taskId, userId);

		// TODO: Call AI service to generate new steps based on task title/description
		// For now, return mock data
		this.logger.log(`[PLACEHOLDER] Re-split requested for task ${taskId}`);

		return {
			message: 'Re-split queued for processing',
			taskId,
			// Mock suggested steps
			suggestedSteps: [
				{ title: 'Research and gather information', userEstMinutes: 15 },
				{ title: 'Draft initial content', userEstMinutes: 20 },
				{ title: 'Review and refine', userEstMinutes: 10 },
				{ title: 'Finalize and submit', userEstMinutes: 5 },
			],
		};
	}

	/**
	 * Placeholder for AI prioritization functionality
	 * TODO: Integrate with AI service for smart prioritization
	 */
	async prioritize(userId: string, availableMinutes?: number) {
		// TODO: Call AI service to prioritize tasks
		// For now, return tasks sorted by priority and due date
		this.logger.log(`[PLACEHOLDER] Prioritize requested for user ${userId}`);

		const tasks = await this.prisma.task.findMany({
			where: {
				userId,
				archivedAt: null,
				status: { not: TaskStatus.DONE },
			},
			include: this.getTaskListInclude(),
			orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }, { createdAt: 'asc' }],
		});

		return {
			message: 'Tasks prioritized',
			availableMinutes,
			// TODO: Filter by available time when AI is integrated
			prioritizedTasks: tasks.map((task) => this.formatTaskListResponse(task)),
		};
	}

	// ==================== HELPERS ====================

	private getTaskInclude() {
		return {
			steps: {
				orderBy: { orderIndex: 'asc' as const },
				include: {
					stepRuns: {
						select: { status: true },
						orderBy: { createdAt: 'desc' as const },
						take: 1,
					},
				},
			},
			taskTags: {
				include: {
					tag: true,
				},
			},
			goal: true,
		};
	}

	private getTaskListInclude() {
		return {
			steps: {
				select: {
					id: true, title: true, userEstMinutes: true, sysEstMinutes: true,
					orderIndex: true, priority: true, isDone: true,
					stepRuns: {
						select: { status: true },
						orderBy: { createdAt: 'desc' as const },
						take: 1,
					},
				},
			},
			taskTags: {
				include: {
					tag: {
						select: { id: true, name: true, color: true },
					},
				},
			},
			_count: {
				select: { steps: true },
			},
		};
	}

	private formatTaskResponse(task: any) {
		const totalEstimatedMinutes = task.steps?.reduce(
			(sum: number, step: any) => sum + (step.userEstMinutes || step.sysEstMinutes || 0),
			0,
		) || 0;

		return {
			id: task.id,
			title: task.title,
			description: task.description,
			expectedTimeHours: task.expectedTimeHours,
			status: task.status,
			taskType: task.taskType,
			priority: task.priority,
			rank: task.rank,
			dueAt: task.dueAt,
			stepCount: task.steps?.length || 0,
			totalEstimatedMinutes,
			steps: task.steps?.map((step: any) => ({
				id: step.id,
				title: step.title,
				description: step.description,
				orderIndex: step.orderIndex,
				userEstMinutes: step.userEstMinutes,
				sysEstMinutes: step.sysEstMinutes,
				isDone: step.isDone,
				stepRunStatus: step.stepRuns?.[0]?.status ?? 'TODO',
				createdAt: step.createdAt,
			})),
			tags: task.taskTags?.map((tt: any) => ({
				id: tt.tag.id,
				name: tt.tag.name,
				color: tt.tag.color,
				isPrimary: tt.isPrimary,
			})),
			compositeScore: task.compositeScore,
			goalAlignment: task.goalAlignment,
			clientWeightVal: task.clientWeightVal,
			timeSensitivity: task.timeSensitivity,
			valuesAlignment: task.valuesAlignment,
			pinned: task.pinned,
			goalId: task.goalId,
			clientId: task.clientId,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
		};
	}

	private formatTaskListResponse(task: any) {
		const totalEstimatedMinutes = task.steps?.reduce(
			(sum: number, step: any) => sum + (step.userEstMinutes || step.sysEstMinutes || 0),
			0,
		) || 0;

		return {
			id: task.id,
			title: task.title,
			status: task.status,
			taskType: task.taskType,
			priority: task.priority,
			rank: task.rank,
			dueAt: task.dueAt,
			stepCount: task._count?.steps || task.steps?.length || 0,
			totalEstimatedMinutes,
			tags: task.taskTags?.map((tt: any) => ({
				id: tt.tag.id,
				name: tt.tag.name,
				color: tt.tag.color,
			})),
			steps: task.steps?.map((step: any) => ({
				...step,
				stepRunStatus: step.stepRuns?.[0]?.status ?? 'TODO',
				stepRuns: undefined,
			})),
			compositeScore: task.compositeScore,
			pinned: task.pinned,
			goalId: task.goalId,
			clientId: task.clientId,
			createdAt: task.createdAt,
		};
	}
}
