import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConsumeMessage, Options } from 'amqplib';
import config from 'src/config';

export interface MessageHandler {
	(msg: ConsumeMessage, channel: Channel): Promise<void> | void;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RabbitMQService.name);
	private connection: amqp.AmqpConnectionManager;
	private channelWrapper: ChannelWrapper;
	private readonly config = config.rabbitmq;

	async onModuleInit() {
		if (!this.config.enabled) {
			this.logger.warn('RabbitMQ is disabled. Skipping connection.');
			return;
		}

		try {
			// Create connection manager
			this.connection = amqp.connect([this.config.url], {
				heartbeatIntervalInSeconds: 30,
				reconnectTimeInSeconds: 5,
			});

			this.connection.on('connect', () => {
				this.logger.log('Successfully connected to RabbitMQ');
			});

			this.connection.on('disconnect', (err) => {
				this.logger.warn('Disconnected from RabbitMQ', err?.err?.message || err);
			});

			this.connection.on('connectFailed', (err) => {
				this.logger.error('Failed to connect to RabbitMQ', err?.err?.message || err);
			});

			// Create channel wrapper
			this.channelWrapper = this.connection.createChannel({
				setup: async (channel: Channel) => {
					// Assert exchange
					await channel.assertExchange(
						this.config.exchanges.default,
						'topic',
						{ durable: true }
					);

					// Assert queues
					for (const queueName of Object.values(this.config.queues)) {
						await channel.assertQueue(queueName, {
							durable: true,
							arguments: {
								'x-message-ttl': 86400000, // 24 hours
								'x-max-length': 10000,
							},
						});
					}

					this.logger.log('RabbitMQ channel setup completed');
				},
			});

			await this.channelWrapper.waitForConnect();
		} catch (error) {
			this.logger.error('Failed to initialize RabbitMQ', error);
			throw error;
		}
	}

	async onModuleDestroy() {
		if (this.channelWrapper) {
			await this.channelWrapper.close();
		}
		if (this.connection) {
			await this.connection.close();
		}
		this.logger.log('RabbitMQ connection closed');
	}

	/**
	 * Publish a message to an exchange with a routing key
	 */
	async publish(
		routingKey: string,
		message: any,
		options?: {
			exchange?: string;
			persistent?: boolean;
			expiration?: number;
		}
	): Promise<boolean> {
		if (!this.config.enabled) {
			this.logger.warn('RabbitMQ is disabled. Message not published.');
			return false;
		}

		try {
			const exchange = options?.exchange || this.config.exchanges.default;
			const content = Buffer.from(JSON.stringify(message));

			return await this.channelWrapper.publish(
				exchange,
				routingKey,
				content,
				{
					deliveryMode: options?.persistent !== false ? 2 : 1,
					contentType: 'application/json',
					timestamp: Date.now(),
					...(options?.expiration && { expiration: options.expiration.toString() }),
				} as Options.Publish
			);
		} catch (error) {
			this.logger.error(`Failed to publish message to ${routingKey}`, error);
			throw error;
		}
	}

	/**
	 * Send a message directly to a queue
	 */
	async sendToQueue(
		queue: string,
		message: any,
		options?: {
			persistent?: boolean;
			expiration?: number;
			priority?: number;
		}
	): Promise<boolean> {
		if (!this.config.enabled) {
			this.logger.warn('RabbitMQ is disabled. Message not sent.');
			return false;
		}

		try {
			const content = Buffer.from(JSON.stringify(message));

			return await this.channelWrapper.sendToQueue(
				queue,
				content,
				{
					deliveryMode: options?.persistent !== false ? 2 : 1,
					contentType: 'application/json',
					timestamp: Date.now(),
					...(options?.expiration && { expiration: options.expiration.toString() }),
					...(options?.priority && { priority: options.priority }),
				} as Options.Publish
			);
		} catch (error) {
			this.logger.error(`Failed to send message to queue ${queue}`, error);
			throw error;
		}
	}

	/**
	 * Consume messages from a queue
	 */
	async consume(
		queue: string,
		handler: MessageHandler,
		options?: {
			prefetch?: number;
			noAck?: boolean;
		}
	): Promise<void> {
		if (!this.config.enabled) {
			this.logger.warn('RabbitMQ is disabled. Consumer not started.');
			return;
		}

		try {
			await this.channelWrapper.addSetup(async (channel: Channel) => {
				if (options?.prefetch) {
					await channel.prefetch(options.prefetch);
				}

				await channel.consume(
					queue,
					async (msg: ConsumeMessage | null) => {
						if (!msg) {
							return;
						}

						try {
							await handler(msg, channel);

							if (!options?.noAck) {
								channel.ack(msg);
							}
						} catch (error) {
							this.logger.error(
								`Error processing message from ${queue}`,
								error
							);

							// Reject and requeue the message
							channel.nack(msg, false, true);
						}
					},
					{ noAck: options?.noAck || false }
				);

				this.logger.log(`Started consuming from queue: ${queue}`);
			});
		} catch (error) {
			this.logger.error(`Failed to start consumer for ${queue}`, error);
			throw error;
		}
	}

	/**
	 * Bind a queue to an exchange with a routing key pattern
	 */
	async bindQueue(
		queue: string,
		routingKeyPattern: string,
		exchange?: string
	): Promise<void> {
		if (!this.config.enabled) {
			return;
		}

		try {
			await this.channelWrapper.addSetup(async (channel: Channel) => {
				await channel.bindQueue(
					queue,
					exchange || this.config.exchanges.default,
					routingKeyPattern
				);
			});

			this.logger.log(`Bound ${queue} to ${routingKeyPattern}`);
		} catch (error) {
			this.logger.error('Failed to bind queue', error);
			throw error;
		}
	}

	/**
	 * Get the channel wrapper for advanced operations
	 */
	getChannel(): ChannelWrapper {
		return this.channelWrapper;
	}

	/**
	 * Check if RabbitMQ is enabled
	 */
	isEnabled(): boolean {
		return this.config.enabled;
	}
}
