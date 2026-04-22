import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';
import config from '../../../src/config';

async function bootstrap() {
	const logger = new Logger('WorkerMicroservice');

	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		WorkerModule,
		{
			transport: Transport.RMQ,
			options: {
				urls: [config.rabbitmq.url],
				queue: 'app-file-event',
				queueOptions: {
					durable: true,
				},
				prefetchCount: 5,
				noAck: false,
			},
		},
	);

	await app.listen();
	logger.log('Worker microservice is listening for file events...');
}

bootstrap();
