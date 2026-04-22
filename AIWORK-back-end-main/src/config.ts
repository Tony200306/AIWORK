import 'dotenv/config';
import { rabbitmqConfig } from './config/rabbitmq.config';
import { redisConfig } from './config/redis.config';
import { storageConfig } from './config/storage.config';
import { aiConfig } from './config/ai.config';

// Deployment environment: 'PROD' or 'DEV' (default: 'DEV')
export const ENV_DEPLOYMENT = (process.env.ENV_DEPLOYMENT as 'PROD' | 'DEV') || 'DEV';

export default {
	ENV_DEPLOYMENT,
	PORT: parseInt(process.env.PORT as string, 10) || 8000,
	SWAGGER_ENDPOINT: process.env.SWAGGER_ENDPOINT || 'docs',
	JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
	rabbitmq: rabbitmqConfig,
	redis: redisConfig,
	storage: storageConfig,
	ai: aiConfig,
};
