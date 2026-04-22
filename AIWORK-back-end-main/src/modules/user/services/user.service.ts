import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, ValueEnum } from '@prisma/client';

import { PrismaService } from '@shared/database/prisma.service';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * User service - handles all user-related business logic
 * Simple and straightforward patterns for easy understanding
 */
@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Find a single user by ID or email
	 */
	async findOne(where: Prisma.UserWhereUniqueInput) {
		try {
			return await this.prisma.user.findUnique({ where });
		} catch (error) {
			this.logger.error('Failed to find user', error);
			throw error;
		}
	}

	/**
	 * Find multiple users with optional filters
	 */
	async findMany(params?: {
		skip?: number;
		take?: number;
		where?: any;
		orderBy?: any;
	}) {
		try {
			return await this.prisma.user.findMany(params);
		} catch (error) {
			this.logger.error('Failed to find users', error);
			throw error;
		}
	}

	/**
	 * Get all users
	 */
	async getAll() {
		try {
			return await this.prisma.user.findMany();
		} catch (error) {
			this.logger.error('Failed to get all users', error);
			throw error;
		}
	}

	/**
	 * Create a new user
	 */
	async create(data: CreateUserDto) {
		try {
			const user = await this.prisma.user.create({ data });
			this.logger.log(`User created: ${user.email}`);
			return user;
		} catch (error) {
			this.logger.error('Failed to create user', error);
			throw error;
		}
	}

	/**
	 * Update an existing user
	 */
	async update(id: string, data: UpdateUserDto) {
		try {
			const updateData: Partial<UpdateUserDto> = { ...data };

			// Only hash password if it's provided in the update
			if (data.password) {
				updateData.password = await bcrypt.hash(data.password, 10);
			}

			const user = await this.prisma.user.update({
				where: { id },
				data: updateData,
			});
			this.logger.log(`User updated: ${user.id}`);
			return user;
		} catch (error) {
			this.logger.error('Failed to update user', error);
			throw error;
		}
	}

	/**
	 * Delete a user
	 */
	async delete(id: string) {
		try {
			const user = await this.prisma.user.delete({
				where: { id },
			});
			this.logger.log(`User deleted: ${user.id}`);
			return user;
		} catch (error) {
			this.logger.error('Failed to delete user', error);
			throw error;
		}
	}

	/**
	 * Check if user exists by email
	 */
	async existsByEmail(email: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { email },
		});
		return !!user;
	}

	// ==================== VALUES STACK ====================

	/**
	 * Update user profile's values stack
	 */
	async updateValuesStack(userId: string, valuesStack: ValueEnum[]) {
		const profile = await this.prisma.userProfile.findUnique({
			where: { userId },
		});

		if (!profile) {
			throw new NotFoundException('User profile not found');
		}

		const updated = await this.prisma.userProfile.update({
			where: { userId },
			data: { valuesStack },
		});

		this.logger.log(`Values stack updated for user: ${userId}`);
		return { valuesStack: updated.valuesStack };
	}

	// ==================== SCHEDULE PREFERENCE ====================

	/**
	 * Get user's schedule preference
	 */
	async getSchedulePreference(userId: string) {
		let preference = await this.prisma.userSchedulePreference.findUnique({
			where: { userId },
		});

		// Create default preference if not exists
		if (!preference) {
			preference = await this.prisma.userSchedulePreference.create({
				data: {
					userId,
					weeklyCapacityMinutes: 1890, // 31.5 hours default
					dailyCapacityMinutes: 480, // 8 hours default
					defaultFocusMinutes: 60, // 1 hour default
				},
			});
		}

		return {
			weeklyCapacityMinutes: preference.weeklyCapacityMinutes,
			dailyCapacityMinutes: preference.dailyCapacityMinutes,
			defaultFocusMinutes: preference.defaultFocusMinutes,
		};
	}

	/**
	 * Update user's schedule preference
	 */
	async updateSchedulePreference(
		userId: string,
		data: {
			weeklyCapacityMinutes?: number;
			dailyCapacityMinutes?: number;
			defaultFocusMinutes?: number;
		},
	) {
		const preference = await this.prisma.userSchedulePreference.upsert({
			where: { userId },
			update: {
				weeklyCapacityMinutes: data.weeklyCapacityMinutes,
				dailyCapacityMinutes: data.dailyCapacityMinutes,
				defaultFocusMinutes: data.defaultFocusMinutes,
			},
			create: {
				userId,
				weeklyCapacityMinutes: data.weeklyCapacityMinutes ?? 1890,
				dailyCapacityMinutes: data.dailyCapacityMinutes ?? 480,
				defaultFocusMinutes: data.defaultFocusMinutes ?? 60,
			},
		});

		this.logger.log(`Schedule preference updated for user: ${userId}`);

		return {
			weeklyCapacityMinutes: preference.weeklyCapacityMinutes,
			dailyCapacityMinutes: preference.dailyCapacityMinutes,
			defaultFocusMinutes: preference.defaultFocusMinutes,
		};
	}
}
