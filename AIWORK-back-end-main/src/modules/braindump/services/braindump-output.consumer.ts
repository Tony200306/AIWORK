import { Injectable, Logger } from '@nestjs/common';
import {
	BaseConsumer,
	MessagePayload,
} from '@shared/messaging/base/base-consumer.service';
import { RabbitMQService } from '@shared/messaging/rabbitmq/rabbitmq.service';
import { PrismaService } from '@shared/database/prisma.service';
import { RedisService } from '@shared/cache/redis/redis.service';
import { TaskPriorityService } from './task-priority.service';
import { QUEUES } from '@config/rabbitmq.config';
import {
	BrainDumpOutputMessageDto,
	BrainDumpOutputStatus,
	BrainDumpOutputTaskDto,
} from '../dtos/braindump-output.dto';
import { BrainDumpStatus, TaskStatus, Priority, TagType } from '@prisma/client';

/**
 * Consumer for processing braindump output messages from AI worker.
 * Inserts generated tasks, steps, and tags into the database.
 */
@Injectable()
export class BrainDumpOutputConsumer extends BaseConsumer {
	protected readonly logger = new Logger(BrainDumpOutputConsumer.name);
	protected readonly queueName = QUEUES.BRAIN_DUMP_OUTPUT;
	protected readonly routingKeyPatterns = undefined; // Direct queue consumption, no topic routing

	constructor(
		protected readonly rabbitMQService: RabbitMQService,
		private readonly prisma: PrismaService,
		private readonly redisService: RedisService,
		private readonly taskPriorityService: TaskPriorityService,
	) {
		super(rabbitMQService);
	}

	/**
	 * Process incoming braindump output message (snake_case from AI service)
	 * Handles both wrapped format {data: {...}} and direct format {...}
	 */
	protected async processMessage(
		payload: MessagePayload<BrainDumpOutputMessageDto>,
	): Promise<void> {
		// Handle both wrapped and unwrapped message formats
		const message: BrainDumpOutputMessageDto =
			(payload.data as BrainDumpOutputMessageDto) ||
			(payload as unknown as BrainDumpOutputMessageDto);
		const braindumpId = message.braindump_id;
		this.logger.log(`payload  ${JSON.stringify(payload)}`);
		this.logger.log(`message  ${JSON.stringify(message)}`);

		this.logger.log(
			`Processing braindump output for: ${braindumpId}`,
		);

		try {
			// Validate braindump exists
			const brainDump =
				await this.prisma.brainDump.findUnique({
					where: { id: braindumpId },
				});

			if (!brainDump) {
				this.logger.error(
					`BrainDump not found: ${braindumpId}`,
				);
				return;
			}

			const userId = brainDump.userId;

			// Handle failed status
			if (
				message.status ===
				BrainDumpOutputStatus.FAILED
			) {
				await this.updateBrainDumpStatus(
					braindumpId,
					BrainDumpStatus.FAILED,
					message.error,
				);
				return;
			}

			// Process tasks if present
			if (message.tasks && message.tasks.length > 0) {
				const createdTaskIds =
					await this.processTasks(
						braindumpId,
						userId,
						message.tasks,
					);
				this.logger.log(
					`Created Task IDs: ${JSON.stringify(createdTaskIds)}`,
				);

				// Call AI Priority Service to calculate priorities
				if (createdTaskIds.length > 0) {
					await this.taskPriorityService.calculateAndUpdatePrioritiesByTaskIds(
						userId,
						createdTaskIds,
					);
				}
			}

			// Update braindump status
			const finalStatus =
				message.status ===
				BrainDumpOutputStatus.COMPLETED
					? BrainDumpStatus.COMPLETED
					: BrainDumpStatus.PROCESSING;

			await this.updateBrainDumpStatus(
				braindumpId,
				finalStatus,
			);

			this.logger.log(
				`Successfully processed braindump ${braindumpId}: created ${message.tasks?.length || 0} tasks`,
			);
		} catch (error) {
			this.logger.error(
				`Error processing braindump output for ${braindumpId}`,
				error,
			);
			await this.updateBrainDumpStatus(
				braindumpId,
				BrainDumpStatus.FAILED,
				String(error),
			);
			throw error;
		}
	}

	/**
	 * Process and insert tasks with steps and tags (snake_case from AI service)
	 * Returns array of created task IDs
	 */
	private async processTasks(
		brainDumpId: string,
		userId: string,
		tasks: BrainDumpOutputTaskDto[],
	): Promise<string[]> {
		const createdTaskIds: string[] = [];
		for (const taskData of tasks) {
			await this.prisma.$transaction(async (tx) => {
				// 1. Find or create tags
				const tagIds: string[] = [];
				if (
					taskData.tags &&
					taskData.tags.length > 0
				) {
					for (const tagData of taskData.tags) {
						// Try to find existing tag by name for this user
						let tag =
							await tx.tag.findFirst(
								{
									where: {
										userId,
										name: {
											equals: tagData.name,
											mode: 'insensitive',
										},
									},
								},
							);

						// Create if not exists
						if (!tag) {
							tag =
								await tx.tag.create(
									{
										data: {
											userId,
											name: tagData.name,
											type: TagType.TODO,
										},
									},
								);
							this.logger.debug(
								`Created new tag: ${tag.name} (${tag.id})`,
							);
						}

						tagIds.push(tag.id);
					}
				}

				// 2. Create task (map snake_case to camelCase for Prisma)
				const task = await tx.task.create({
					data: {
						userId,
						title: taskData.title,
						description:
							taskData.description ||
							'',
						expectedTimeHours:
							taskData.expected_time_hours,
						status: TaskStatus.TODO,
						priority: Priority.MEDIUM,
						dueAt: taskData.due_at
							? new Date(
									taskData.due_at,
								)
							: null,
						// Create steps inline
						steps:
							taskData.steps &&
							taskData
								.steps
								.length >
								0
								? {
										create: taskData.steps.map(
											(
												step,
											) => ({
												title: step.title,
												description: step.description,
												orderIndex: step.order_index,
												sysEstMinutes:
													step.sys_est_minutes,
											}),
										),
									}
								: undefined,
						// Create tag associations
						taskTags:
							tagIds.length >
							0
								? {
										create: tagIds.map(
											(
												tagId,
												index,
											) => ({
												tagId,
												isPrimary:
													index ===
													0,
											}),
										),
									}
								: undefined,
					},
				});

				// 3. Link task to braindump via BrainDumpTask
				await tx.brainDumpTask.create({
					data: {
						brainDumpId,
						taskId: task.id,
					},
				});

				this.logger.debug(
					`Created task: ${task.title} (${task.id}) with ${taskData.steps?.length || 0} steps and ${tagIds.length} tags`,
				);

				// Store task ID for priority calculation
				createdTaskIds.push(task.id);
			});
		}

		return createdTaskIds;
	}

	/**
	 * Update braindump status in both Redis and database
	 */
	private async updateBrainDumpStatus(
		brainDumpId: string,
		status: BrainDumpStatus,
		error?: string,
	): Promise<void> {
		// Update Redis
		await this.redisService.set(`job:${brainDumpId}`, {
			jobId: brainDumpId,
			status,
			timestamp: new Date().toISOString(),
			error: error || null,
		});

		// Update database
		await this.prisma.brainDump.update({
			where: { id: brainDumpId },
			data: { status },
		});

		this.logger.log(
			`Updated braindump ${brainDumpId} status to ${status}`,
		);
	}
}
