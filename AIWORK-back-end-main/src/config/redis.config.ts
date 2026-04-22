import 'dotenv/config';

export interface RedisConfig {
	host: string;
	port: number;
	password?: string;
	db: number;
	enabled: boolean;
	ttl: number; // Default TTL in seconds
}

export const redisConfig: RedisConfig = {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT as string, 10) || 6379,
	password: process.env.REDIS_PASSWORD,
	db: parseInt(process.env.REDIS_DB as string, 10) || 0,
	enabled: process.env.REDIS_ENABLED === 'true',
	ttl: parseInt(process.env.REDIS_TTL as string, 10) || 0, // 0 = no expiration by default
};
