import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import config from 'src/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RedisService.name);
	private client: Redis | null = null;
	private readonly config = config.redis;

	async onModuleInit() {
		if (!this.config.enabled) {
			this.logger.warn('Redis is disabled. Skipping connection.');
			return;
		}

		try {
			this.client = new Redis({
				host: this.config.host,
				port: this.config.port,
				password: this.config.password,
				db: this.config.db,
				retryStrategy: (times) => {
					const delay = Math.min(times * 50, 2000);
					return delay;
				},
				maxRetriesPerRequest: 3,
			});

			this.client.on('connect', () => {
				this.logger.log('Successfully connected to Redis');
			});

			this.client.on('error', (err) => {
				this.logger.error('Redis connection error', err);
			});

			this.client.on('ready', () => {
				this.logger.log('Redis client is ready');
			});

			await this.client.ping();
		} catch (error) {
			this.logger.error('Failed to initialize Redis', error);
			throw error;
		}
	}

	async onModuleDestroy() {
		if (this.client) {
			await this.client.quit();
			this.logger.log('Redis connection closed');
		}
	}

	/**
	 * Set a value with optional TTL (defaults to config.ttl or 0 for no expiration)
	 */
	async set(key: string, value: any, ttl?: number): Promise<void> {
		if (!this.isEnabled()) {
			return;
		}

		try {
			const serialized = JSON.stringify(value);
			// Use provided TTL, fall back to config TTL (defaults to 0 = no expiration)
			const expirationTime = ttl ?? this.config.ttl ?? 0;

			if (expirationTime > 0) {
				await this.client.setex(key, expirationTime, serialized);
			} else {
				await this.client.set(key, serialized);
			}
		} catch (error) {
			this.logger.error(`Failed to set key ${key}`, error);
			throw error;
		}
	}

	/**
	 * Get a value by key
	 */
	async get<T = any>(key: string): Promise<T | null> {
		if (!this.isEnabled()) {
			return null;
		}

		try {
			const value = await this.client.get(key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			this.logger.error(`Failed to get key ${key}`, error);
			return null;
		}
	}

	/**
	 * Delete a key
	 */
	async del(key: string): Promise<void> {
		if (!this.isEnabled()) {
			return;
		}

		try {
			await this.client.del(key);
		} catch (error) {
			this.logger.error(`Failed to delete key ${key}`, error);
			throw error;
		}
	}

	/**
	 * Delete keys matching a pattern
	 */
	async delPattern(pattern: string): Promise<void> {
		if (!this.isEnabled()) {
			return;
		}

		try {
			const keys = await this.client.keys(pattern);
			if (keys.length > 0) {
				await this.client.del(...keys);
			}
		} catch (error) {
			this.logger.error(`Failed to delete pattern ${pattern}`, error);
			throw error;
		}
	}

	/**
	 * Check if a key exists
	 */
	async exists(key: string): Promise<boolean> {
		if (!this.isEnabled()) {
			return false;
		}

		try {
			const result = await this.client.exists(key);
			return result === 1;
		} catch (error) {
			this.logger.error(`Failed to check existence of key ${key}`, error);
			return false;
		}
	}

	/**
	 * Set expiration time for a key
	 */
	async expire(key: string, seconds: number): Promise<void> {
		if (!this.isEnabled()) {
			return;
		}

		try {
			await this.client.expire(key, seconds);
		} catch (error) {
			this.logger.error(`Failed to set expiration for key ${key}`, error);
			throw error;
		}
	}

	/**
	 * Increment a counter
	 */
	async incr(key: string): Promise<number> {
		if (!this.isEnabled()) {
			return 0;
		}

		try {
			return await this.client.incr(key);
		} catch (error) {
			this.logger.error(`Failed to increment key ${key}`, error);
			throw error;
		}
	}

	/**
	 * Decrement a counter
	 */
	async decr(key: string): Promise<number> {
		if (!this.isEnabled()) {
			return 0;
		}

		try {
			return await this.client.decr(key);
		} catch (error) {
			this.logger.error(`Failed to decrement key ${key}`, error);
			throw error;
		}
	}

	/**
	 * Get or set pattern - if key doesn't exist, set it with the factory function
	 */
	async getOrSet<T = any>(
		key: string,
		factory: () => Promise<T>,
		ttl?: number
	): Promise<T> {
		const cached = await this.get<T>(key);

		if (cached !== null) {
			return cached;
		}

		const value = await factory();
		await this.set(key, value, ttl);
		return value;
	}

	/**
	 * Get the Redis client for advanced operations
	 */
	getClient(): Redis | null {
		return this.client;
	}

	/**
	 * Check if Redis is enabled and connected
	 */
	isEnabled(): boolean {
		return this.config.enabled && this.client !== null;
	}

	/**
	 * Ping Redis to check connection
	 */
	async ping(): Promise<boolean> {
		if (!this.isEnabled()) {
			return false;
		}

		try {
			await this.client.ping();
			return true;
		} catch (error) {
			this.logger.error('Redis ping failed', error);
			return false;
		}
	}
}
