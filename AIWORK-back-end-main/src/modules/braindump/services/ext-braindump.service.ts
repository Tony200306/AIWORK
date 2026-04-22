import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { RabbitMQService } from '@shared/messaging/rabbitmq/rabbitmq.service';
import { CreateExtBrainDumpDto } from '../dtos/create-ext-braindump.dto';
import { BrainDumpType, BrainDumpStatus, TaskStatus, Priority, TagType, TaskType } from '@prisma/client';
import {
	AtomicSplitResponseDto,
	AtomicSplitTaskDto,
	BulkCreateTasksDto,
	BulkCreateTasksResponseDto,
	BulkCreateTaskDto
} from '../dtos/atomic-split.dto';
import { BulkUpdateTaskStatusDto, BulkUpdateTaskDto, BulkUpdateTaskFieldsDto } from '@modules/task/dtos/bulk-update-tasks.dto';
import { UpdateStepDto, UpdateStepsDto } from '@modules/task/dtos/update-step.dto';
import { CreateStepDto } from '@modules/task/dtos/create-step.dto';
import { QUEUES } from '@config/rabbitmq.config';
import { ITaskPriorityMessage } from '../interfaces/job-message.interface';

const PARKING_ORDER_INDEX = 1000000000;

@Injectable()
export class ExtBrainDumpService {
	private readonly logger = new Logger(ExtBrainDumpService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly rabbitmqService: RabbitMQService,
	) {}

	/**
	 * Create a new brain dump without authentication (external API)
	 * Only supports text context, no file attachments, no queue processing
	 */
	async create(data: CreateExtBrainDumpDto) {
		try {
			// Create brain dump with QUEUED status
			const brainDump = await this.prisma.brainDump.create({
				data: {
					userId: null,
					type: BrainDumpType.TASK_CANDIDATE,
					contextText: data.contextText,
					status: BrainDumpStatus.QUEUED,
				},
			});

			this.logger.log(`External brain dump ${brainDump.id} created`);

			return brainDump;
		} catch (error) {
			this.logger.error('Failed to create external brain dump', error);
			throw error;
		}
	}

	/**
	 * Get tasks with steps and tags for a braindump (External API - no authentication)
	 */
	async getBrainDumpTasks(brainDumpId: string): Promise<AtomicSplitResponseDto> {
		try {
			const brainDump = await this.prisma.brainDump.findUnique({
				where: { id: brainDumpId },
				include: {
					convertedTasks: {
						include: {
							task: {
								include: {
									steps: {
										orderBy: { orderIndex: 'asc' },
									},
									taskTags: {
										include: {
											tag: true,
										},
									},
								},
							},
						},
						orderBy: { orderIndex: 'asc' },
					},
				},
			});

			if (!brainDump) {
				throw new NotFoundException(`BrainDump with ID ${brainDumpId} not found`);
			}

			// Transform to response DTO
			const tasks: AtomicSplitTaskDto[] = brainDump.convertedTasks.map((bdTask) => ({
				id: bdTask.task.id,
				title: bdTask.task.title,
				description: bdTask.task.description || undefined,
				expectedTimeHours: bdTask.task.expectedTimeHours || undefined,
				dueAt: bdTask.task.dueAt || undefined,
				status: bdTask.task.status,
				priority: bdTask.task.priority,
				orderIndex: bdTask.orderIndex || undefined,
				steps: bdTask.task.steps.map((step) => ({
					id: step.id,
					title: step.title,
					description: step.description || undefined,
					orderIndex: step.orderIndex || 0,
					sysEstMinutes: step.sysEstMinutes || undefined,
					userEstMinutes: step.userEstMinutes || undefined,
					isDone: step.isDone,
					difficulty: step.difficulty || undefined,
				})),
				tags: bdTask.task.taskTags.map((tt) => ({
					id: tt.tag.id,
					name: tt.tag.name,
					color: tt.tag.color || undefined,
					isPrimary: tt.isPrimary,
				})),
				taskType: bdTask.task.taskType,
				scope: bdTask.task.scope || undefined,
			}));

			this.logger.log(`Retrieved ${tasks.length} tasks for external brain dump ${brainDumpId}`);

			return {
				braindumpId: brainDump.id,
				status: brainDump.status,
				contextText: brainDump.contextText || undefined,
				tasks,
			};
		} catch (error) {
			this.logger.error(`Failed to get tasks for brain dump ${brainDumpId}`, error);
			throw error;
		}
	}

	/**
	 * Bulk create tasks for a braindump (External API - no authentication, no queue)
	 */
	async bulkCreateTasks(
		brainDumpId: string,
		dto: BulkCreateTasksDto,
	): Promise<BulkCreateTasksResponseDto> {
		try {
			// Validate braindump exists
			const brainDump = await this.prisma.brainDump.findUnique({
				where: { id: brainDumpId },
			});

			if (!brainDump) {
				throw new NotFoundException(`BrainDump with ID ${brainDumpId} not found`);
			}

			const createdTaskIds: string[] = [];

			// Process each task in a transaction with increased timeout
			await this.prisma.$transaction(async (tx) => {
				for (const taskDto of dto.tasks) {
					const taskId = await this.createSingleTaskInBulk(tx, brainDumpId, taskDto);
					createdTaskIds.push(taskId);
				}
			}, {
				timeout: 30000, // 30 seconds timeout for bulk operations
			});

			// Send message to queue for async priority calculation
			if (createdTaskIds.length > 0) {
				try {
					const priorityMessage: ITaskPriorityMessage = {
						userId: null, // External API tasks have no userId
						taskIds: createdTaskIds,
						metadata: {
							braindumpId: brainDumpId,
							source: 'ext-bulkCreateTasks',
						},
					};

					await this.rabbitmqService.sendToQueue(QUEUES.TASK_PRIORITY, priorityMessage);
					this.logger.log(
						`Sent ${createdTaskIds.length} tasks to priority calculation queue`,
					);
				} catch (queueError) {
					this.logger.error(
						`Failed to send tasks to priority calculation queue`,
						queueError,
					);
					// Don't fail the entire operation if queue publishing fails
				}
			}

			// Fetch created tasks with full details
			const createdTasks = await this.prisma.brainDump.findUnique({
				where: { id: brainDumpId },
				include: {
					convertedTasks: {
						where: {
							taskId: { in: createdTaskIds },
						},
						include: {
							task: {
								include: {
									steps: {
										orderBy: { orderIndex: 'asc' },
									},
									taskTags: {
										include: {
											tag: true,
										},
									},
								},
							},
						},
						orderBy: { orderIndex: 'asc' },
					},
				},
			});

			// Transform to response DTO
			const tasks: AtomicSplitTaskDto[] = createdTasks!.convertedTasks.map((bdTask) => ({
				id: bdTask.task.id,
				title: bdTask.task.title,
				description: bdTask.task.description || undefined,
				expectedTimeHours: bdTask.task.expectedTimeHours || undefined,
				dueAt: bdTask.task.dueAt || undefined,
				status: bdTask.task.status,
				priority: bdTask.task.priority,
				orderIndex: bdTask.orderIndex || undefined,
				steps: bdTask.task.steps.map((step) => ({
					id: step.id,
					title: step.title,
					description: step.description || undefined,
					orderIndex: step.orderIndex || 0,
					sysEstMinutes: step.sysEstMinutes || undefined,
					userEstMinutes: step.userEstMinutes || undefined,
					isDone: step.isDone,
					difficulty: step.difficulty || undefined,
				})),
				tags: bdTask.task.taskTags.map((tt) => ({
					id: tt.tag.id,
					name: tt.tag.name,
					color: tt.tag.color || undefined,
					isPrimary: tt.isPrimary,
				})),
				taskType: bdTask.task.taskType,
				scope: bdTask.task.scope || undefined,
			}));

			this.logger.log(`Bulk created ${createdTaskIds.length} tasks for external brain dump ${brainDumpId}`);

			return {
				braindumpId: brainDumpId,
				createdCount: createdTaskIds.length,
				taskIds: createdTaskIds,
				tasks,
			};
		} catch (error) {
			this.logger.error(`Failed to bulk create tasks for brain dump ${brainDumpId}`, error);
			throw error;
		}
	}

	/**
	 * Create a single task within a transaction for bulk creation (External API)
	 */
	private async createSingleTaskInBulk(
		tx: any,
		brainDumpId: string,
		taskDto: BulkCreateTaskDto,
	): Promise<string> {
		// Create new task without userId
		const task = await tx.task.create({
			data: {
				userId: null,
				title: taskDto.title,
				description: taskDto.description || '',
				expectedTimeHours: taskDto.expectedTimeHours,
				dueAt: taskDto.dueAt ? new Date(taskDto.dueAt) : null,
				status: TaskStatus.TODO,
				priority: Priority.MEDIUM,
				taskType: taskDto.taskType || TaskType.STAGING,
				scope: taskDto.scope,
			},
		});

		const taskId = task.id;

		// Link to braindump in brain_dump_task table
		await tx.brainDumpTask.create({
			data: {
				brainDumpId,
				taskId,
				orderIndex: taskDto.orderIndex,
			},
		});

		// Handle steps - batch create
		if (taskDto.steps && taskDto.steps.length > 0) {
			const stepsData = taskDto.steps.map((stepDto) => ({
				taskId,
				title: stepDto.title,
				description: stepDto.description || null,
				orderIndex: stepDto.orderIndex ?? 0,
				sysEstMinutes: stepDto.sysEstMinutes,
				userEstMinutes: stepDto.userEstMinutes,
				isDone: stepDto.isDone ?? false,
				difficulty: stepDto.difficulty,
			}));

			await tx.step.createMany({
				data: stepsData,
			});
		}

		// Handle tags - no userId validation
		if (taskDto.tags && taskDto.tags.length > 0) {
			const tagIds: string[] = [];

			// Process tags
			for (const tagDto of taskDto.tags) {
				let tagId: string;

				if (tagDto.id) {
					// Use existing tag
					tagId = tagDto.id;
				} else {
					// Find or create tag without userId
					let tag = await tx.tag.findFirst({
						where: {
							userId: null,
							name: { equals: tagDto.name, mode: 'insensitive' },
						},
					});

					if (!tag) {
						tag = await tx.tag.create({
							data: {
								userId: null,
								name: tagDto.name,
								type: TagType.TODO,
							},
						});
					}

					tagId = tag.id;
				}

				tagIds.push(tagId);
			}

			// Batch create task-tag associations
			const taskTagData = taskDto.tags.map((tagDto, index) => ({
				taskId,
				tagId: tagIds[index],
				isPrimary: tagDto.isPrimary ?? false,
			}));

			await tx.taskTag.createMany({
				data: taskTagData,
			});
		}

		return taskId;
	}

	/**
	 * Bulk update task statuses (External API - no authentication)
	 */
	async bulkUpdateStatuses(updates: BulkUpdateTaskStatusDto[]) {
		try {
			// Extract task IDs
			const taskIds = updates.map((u) => u.taskId);

			// Check for duplicate taskIds
			const uniqueIds = new Set(taskIds);
			if (uniqueIds.size !== taskIds.length) {
				throw new ForbiddenException('Duplicate task IDs in request');
			}

			// Fetch all tasks
			const tasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				select: { id: true, status: true },
			});

			// Validate all tasks found
			if (tasks.length !== updates.length) {
				throw new NotFoundException('One or more tasks not found');
			}

			// Build task map for quick lookup
			const taskMap = new Map(tasks.map((task) => [task.id, task]));

			// Build update plan: filter out no-op updates
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
				this.logger.log('Bulk update: No status changes detected');
				return tasks;
			}

			// Execute bulk update in transaction
			const updatedTasks = await this.prisma.$transaction(
				updatePlan.map((plan) =>
					this.prisma.task.update({
						where: { id: plan.taskId },
						data: { status: plan.newStatus },
					}),
				),
			);

			this.logger.log(`Bulk updated ${updatedTasks.length} task statuses`);

			return updatedTasks;
		} catch (error) {
			this.logger.error('Failed to bulk update task statuses', error);
			throw error;
		}
	}

	/**
	 * Bulk update task priorities (External API - no authentication)
	 */
	async bulkUpdatePriorities(updates: BulkUpdateTaskDto[]) {
		try {
			// Extract task IDs
			const taskIds = updates.map((u) => u.taskId);

			// Check for duplicate taskIds
			const uniqueIds = new Set(taskIds);
			if (uniqueIds.size !== taskIds.length) {
				throw new ForbiddenException('Duplicate task IDs in request');
			}

			// Fetch all tasks
			const tasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				select: { id: true, priority: true },
			});

			// Validate all tasks found
			if (tasks.length !== updates.length) {
				throw new NotFoundException('One or more tasks not found');
			}

			// Build task map for quick lookup
			const taskMap = new Map(tasks.map((task) => [task.id, task]));

			// Build update plan: filter out no-op updates
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
				this.logger.log('Bulk update: No priority changes detected');
				return tasks;
			}

			// Execute bulk update in transaction
			const updatedTasks = await this.prisma.$transaction(
				updatePlan.map((plan) =>
					this.prisma.task.update({
						where: { id: plan.taskId },
						data: { priority: plan.newPriority },
					}),
				),
			);

			this.logger.log(`Bulk updated ${updatedTasks.length} task priorities`);

			return updatedTasks;
		} catch (error) {
			this.logger.error('Failed to bulk update task priorities', error);
			throw error;
		}
	}

	/**
	 * Bulk update task fields (External API - no authentication)
	 */
	async bulkUpdateFields(updates: BulkUpdateTaskFieldsDto[]) {
		try {
			// Extract task IDs
			const taskIds = updates.map((u) => u.taskId);

			// Check for duplicate taskIds
			const uniqueIds = new Set(taskIds);
			if (uniqueIds.size !== taskIds.length) {
				throw new ForbiddenException('Duplicate task IDs in request');
			}

			// Fetch all tasks
			const tasks = await this.prisma.task.findMany({
				where: { id: { in: taskIds } },
				select: { id: true, status: true, rank: true, priority: true, taskType: true },
			});

			// Validate all tasks found
			if (tasks.length !== updates.length) {
				throw new NotFoundException('One or more tasks not found');
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

			// If no actual changes, return current state
			if (updatePlan.length === 0) {
				this.logger.log('Bulk update: No field changes detected');
				return tasks;
			}

			// Execute bulk update in transaction
			const updatedTasks = await this.prisma.$transaction(
				updatePlan.map((plan) =>
					this.prisma.task.update({
						where: { id: plan.taskId },
						data: {
							...(plan.status !== undefined && { status: plan.status }),
							...(plan.rank !== undefined && { rank: plan.rank }),
							...(plan.priority !== undefined && { priority: plan.priority }),
							...(plan.taskType !== undefined && { taskType: plan.taskType }),
						},
					}),
				),
			);

			this.logger.log(`Bulk updated ${updatedTasks.length} task fields`);

			return updatedTasks;
		} catch (error) {
			this.logger.error('Failed to bulk update task fields', error);
			throw error;
		}
	}

	/**
	 * Add a step to a task (External API - no authentication)
	 */
	async addStep(taskId: string, data: CreateStepDto) {
		try {
			// Verify task exists
			const task = await this.prisma.task.findUnique({
				where: { id: taskId },
			});

			if (!task) {
				throw new NotFoundException(`Task with ID ${taskId} not found`);
			}

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
		} catch (error) {
			this.logger.error(`Failed to add step to task ${taskId}`, error);
			throw error;
		}
	}

	/**
	 * Update a single step (External API - no authentication)
	 */
	async updateStep(taskId: string, stepId: string, data: UpdateStepDto) {
		try {
			const step = await this.prisma.step.findUnique({
				where: { id: stepId },
			});

			if (!step || step.taskId !== taskId) {
				throw new NotFoundException(`Step with ID ${stepId} not found in task ${taskId}`);
			}

			// If orderIndex is provided, handle reordering with transactions
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
						// Moving up: shift down steps in range [newIndex, oldIndex)
						await tx.step.updateMany({
							where: {
								taskId: taskId,
								orderIndex: { gte: newIndex, lt: oldIndex },
							},
							data: { orderIndex: { increment: 1 } },
						});
					} else {
						// Moving down: shift up steps in range (oldIndex, newIndex]
						await tx.step.updateMany({
							where: {
								taskId: taskId,
								orderIndex: { gt: oldIndex, lte: newIndex },
							},
							data: { orderIndex: { decrement: 1 } },
						});
					}

					// Update the step with final data
					return tx.step.update({
						where: { id: stepId },
						data: {
							title: data.title,
							description: data.description,
							userEstMinutes: data.userEstMinutes,
							isDone: data.isDone,
							orderIndex: newIndex,
						},
					});
				});

				this.logger.log(`Updated step ${stepId} with reordering`);
				return updated;
			}

			// No reordering needed, simple update
			const updated = await this.prisma.step.update({
				where: { id: stepId },
				data: {
					title: data.title,
					description: data.description,
					userEstMinutes: data.userEstMinutes,
					isDone: data.isDone,
				},
			});

			this.logger.log(`Updated step ${stepId}`);
			return updated;
		} catch (error) {
			this.logger.error(`Failed to update step ${stepId}`, error);
			throw error;
		}
	}

	/**
	 * Batch update steps (External API - no authentication)
	 */
	async updateSteps(taskId: string, data: UpdateStepsDto) {
		try {
			const steps = data.steps;
			const stepIds = steps.map((s) => s.id);

			if (stepIds.length === 0) return [];

			// Use Transaction for safety
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
							orderIndex: step.orderIndex,
						},
					})
				);

				const result = await Promise.all(updatePromises);

				this.logger.log(`Batch updated ${result.length} steps for task ${taskId}`);
				return result;
			});
		} catch (error) {
			this.logger.error(`Failed to batch update steps for task ${taskId}`, error);
			throw error;
		}
	}

	/**
	 * Delete a step from a task (External API - no authentication)
	 */
	async deleteStep(taskId: string, stepId: string) {
		try {
			const step = await this.prisma.step.findUnique({
				where: { id: stepId },
			});

			if (!step || step.taskId !== taskId) {
				throw new NotFoundException(`Step with ID ${stepId} not found in task ${taskId}`);
			}

			await this.prisma.step.delete({ where: { id: stepId } });
			this.logger.log(`Step deleted: ${stepId}`);
		} catch (error) {
			this.logger.error(`Failed to delete step ${stepId}`, error);
			throw error;
		}
	}
}
