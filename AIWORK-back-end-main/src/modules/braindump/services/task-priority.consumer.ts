import { Injectable, Logger } from '@nestjs/common';
import {
	BaseConsumer,
	MessagePayload,
} from '@shared/messaging/base/base-consumer.service';
import { RabbitMQService } from '@shared/messaging/rabbitmq/rabbitmq.service';
import { TaskPriorityService } from './task-priority.service';
import { QUEUES } from '@config/rabbitmq.config';
import { ITaskPriorityMessage } from '../interfaces/job-message.interface';

/**
 * Consumer for processing task priority calculation messages.
 * This consumer receives task IDs and triggers async priority calculation.
 */
@Injectable()
export class TaskPriorityConsumer extends BaseConsumer {
	protected readonly logger = new Logger(TaskPriorityConsumer.name);
	protected readonly queueName = QUEUES.TASK_PRIORITY;
	protected readonly routingKeyPatterns = undefined; // Direct queue consumption, no topic routing

	constructor(
		protected readonly rabbitMQService: RabbitMQService,
		private readonly taskPriorityService: TaskPriorityService,
	) {
		super(rabbitMQService);
	}

	/**
	 * Process incoming task priority calculation message
	 */
	protected async processMessage(
		payload: MessagePayload<ITaskPriorityMessage>,
	): Promise<void> {
		// Handle both wrapped and unwrapped message formats
		const message: ITaskPriorityMessage =
			(payload.data as ITaskPriorityMessage) ||
			(payload as unknown as ITaskPriorityMessage);

		const { userId, taskIds, metadata } = message;

		this.logger.log(
			`Processing priority calculation for ${taskIds.length} tasks (user: ${userId})`,
		);

		if (metadata?.braindumpId) {
			this.logger.log(
				`Source: braindump ${metadata.braindumpId}`,
			);
		}

		try {
			// Call the task priority service to calculate and update priorities
			await this.taskPriorityService.calculateAndUpdatePrioritiesByTaskIds(
				userId,
				taskIds,
			);

			this.logger.log(
				`Successfully calculated priorities for ${taskIds.length} tasks`,
			);
		} catch (error) {
			this.logger.error(
				`Error calculating priorities for tasks: ${taskIds.join(', ')}`,
				error,
			);
			throw error;
		}
	}
}
