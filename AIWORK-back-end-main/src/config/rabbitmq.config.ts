import 'dotenv/config';

export interface RabbitMQConfig {
	url: string;
	exchanges: {
		default: string;
	};
	queues: {
		userEvents: string;
		emailNotifications: string;
		fileIngest: string;
		fileEvent: string;
		brainDumpOutput: string;
		brainDumpIngest: string;
		taskPriority: string;
	};
	enabled: boolean;
}

// Queue suffix based on deployment environment (PROD adds '_prod' suffix)
const queueSuffix = process.env.ENV_DEPLOYMENT === 'PROD' ? '_prod' : '';

// Queue name constants for easy import
export const QUEUES = {
	USER_EVENTS: `user.events${queueSuffix}`,
	EMAIL_NOTIFICATIONS: `email.notifications${queueSuffix}`,
	FILE_INGEST: `app-file-ingest${queueSuffix}`,
	FILE_EVENT: `app-file-event${queueSuffix}`,
	BRAIN_DUMP_OUTPUT: `app-brain-dump-output${queueSuffix}`,
	BRAIN_DUMP_INGEST: `app-brain-dump-ingest${queueSuffix}`,
	TASK_PRIORITY: `app-task-priority${queueSuffix}`,
} as const;

export const rabbitmqConfig: RabbitMQConfig = {
	url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
	exchanges: {
		default: process.env.RABBITMQ_EXCHANGE || 'app.events',
	},
	queues: {
		userEvents: QUEUES.USER_EVENTS,
		emailNotifications: QUEUES.EMAIL_NOTIFICATIONS,
		fileIngest: QUEUES.FILE_INGEST,
		fileEvent: QUEUES.FILE_EVENT,
		brainDumpOutput: QUEUES.BRAIN_DUMP_OUTPUT,
		brainDumpIngest: QUEUES.BRAIN_DUMP_INGEST,
		taskPriority: QUEUES.TASK_PRIORITY,
	},
	enabled: process.env.RABBITMQ_ENABLED === 'true',
};
