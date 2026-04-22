import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

/**
 * Base publisher class that provides common publishing methods
 * Extend this class for feature-specific publishers
 */
@Injectable()
export abstract class BasePublisher {
	protected abstract readonly logger: Logger;
	protected abstract readonly routingKeyPrefix: string;

	constructor(protected readonly rabbitMQService: RabbitMQService) {}

	/**
	 * Publish an event to the exchange
	 */
	protected async publishEvent<T = any>(
		eventName: string,
		data: T,
		options?: {
			persistent?: boolean;
			expiration?: number;
		}
	): Promise<void> {
		const routingKey = `${this.routingKeyPrefix}.${eventName}`;

		try {
			const success = await this.rabbitMQService.publish(
				routingKey,
				{
					eventName,
					data,
					timestamp: new Date().toISOString(),
				},
				options
			);

			if (success) {
				this.logger.log(`Published event: ${routingKey}`);
			} else {
				this.logger.warn(`Failed to publish event: ${routingKey}`);
			}
		} catch (error) {
			this.logger.error(`Error publishing event ${routingKey}`, error);
			throw error;
		}
	}

	/**
	 * Send a message directly to a specific queue
	 */
	protected async sendToQueue<T = any>(
		queueName: string,
		data: T,
		options?: {
			persistent?: boolean;
			expiration?: number;
			priority?: number;
		}
	): Promise<void> {
		try {
			const success = await this.rabbitMQService.sendToQueue(
				queueName,
				{
					data,
					timestamp: new Date().toISOString(),
				},
				options
			);

			if (success) {
				this.logger.log(`Sent message to queue: ${queueName}`);
			} else {
				this.logger.warn(`Failed to send message to queue: ${queueName}`);
			}
		} catch (error) {
			this.logger.error(`Error sending to queue ${queueName}`, error);
			throw error;
		}
	}
}
