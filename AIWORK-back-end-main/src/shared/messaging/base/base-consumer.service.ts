import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ConsumeMessage, Channel } from 'amqplib';

export interface MessagePayload<T = any> {
	eventName?: string;
	data: T;
	timestamp: string;
}

/**
 * Base consumer class that provides common consuming patterns
 * Extend this class for feature-specific consumers
 */
@Injectable()
export abstract class BaseConsumer implements OnModuleInit {
	protected abstract readonly logger: Logger;
	protected abstract readonly queueName: string;
	protected abstract readonly routingKeyPatterns?: string[];
	protected prefetchCount = 10;

	constructor(protected readonly rabbitMQService: RabbitMQService) {}

	async onModuleInit() {
		if (!this.rabbitMQService.isEnabled()) {
			this.logger.warn('RabbitMQ is disabled. Consumer not started.');
			return;
		}

		// Bind routing key patterns if specified
		if (this.routingKeyPatterns && this.routingKeyPatterns.length > 0) {
			for (const pattern of this.routingKeyPatterns) {
				await this.rabbitMQService.bindQueue(this.queueName, pattern);
			}
		}

		// Start consuming
		await this.rabbitMQService.consume(
			this.queueName,
			this.handleMessage.bind(this),
			{
				prefetch: this.prefetchCount,
			}
		);

		this.logger.log(`Consumer started for queue: ${this.queueName}`);
	}

	/**
	 * Handle incoming messages - override this in your consumer
	 */
	protected abstract processMessage(payload: MessagePayload): Promise<void>;

	/**
	 * Internal message handler that parses and delegates to processMessage
	 */
	private async handleMessage(msg: ConsumeMessage, channel: Channel): Promise<void> {
		try {
			const content = msg.content.toString();
			const payload: MessagePayload = JSON.parse(content);

			this.logger.debug(
				`Processing message from ${this.queueName}: ${payload.eventName || 'unknown'}`
			);

			await this.processMessage(payload);

			this.logger.debug(`Successfully processed message from ${this.queueName}`);
		} catch (error) {
			this.logger.error(
				`Error processing message from ${this.queueName}`,
				error
			);
			throw error; // Re-throw to trigger nack and requeue
		}
	}
}
