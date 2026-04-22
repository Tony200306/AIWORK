import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateGoalDto } from '../dtos/create-goal.dto';
import { UpdateGoalDto } from '../dtos/update-goal.dto';
import { ReorderGoalItemDto } from '../dtos/reorder-goals.dto';
import { CompositeScorerService } from '@modules/scoring/services/composite-scorer.service';

@Injectable()
export class GoalService {
	private readonly logger = new Logger(GoalService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly scorer: CompositeScorerService,
	) {}

	/**
	 * Create a new goal for a user
	 */
	async create(userId: string, data: CreateGoalDto) {
		let rank = data.rank;

		if (!rank) {
			const maxRank = await this.prisma.goal.aggregate({
				where: { userId, tier: data.tier },
				_max: { rank: true },
			});
			rank = (maxRank._max.rank ?? 0) + 1;
		}

		const goal = await this.prisma.goal.create({
			data: {
				userId,
				tier: data.tier,
				rank,
				title: data.title,
				description: data.description,
			},
		});

		this.logger.log(`Goal created: ${goal.id} for user ${userId}`);
		return goal;
	}

	/**
	 * Get all goals for a user, ordered by tier + rank
	 */
	async findAll(userId: string) {
		return this.prisma.goal.findMany({
			where: { userId },
			orderBy: [{ tier: 'asc' }, { rank: 'asc' }],
		});
	}

	/**
	 * Get a single goal by ID with ownership check
	 */
	async findOne(id: string, userId: string) {
		const goal = await this.prisma.goal.findUnique({
			where: { id },
		});

		if (!goal) {
			throw new NotFoundException(`Goal with ID ${id} not found`);
		}

		if (goal.userId !== userId) {
			throw new ForbiddenException('Access denied to this goal');
		}

		return goal;
	}

	/**
	 * Update a goal
	 */
	async update(id: string, userId: string, data: UpdateGoalDto) {
		await this.findOne(id, userId);

		const updated = await this.prisma.goal.update({
			where: { id },
			data: {
				tier: data.tier,
				rank: data.rank,
				title: data.title,
				description: data.description,
			},
		});

		this.logger.log(`Goal updated: ${id}`);

		// Cascade rescore all tasks linked to this goal
		this.cascadeRescoreByGoal(id).catch((err) =>
			this.logger.warn(`Failed to cascade rescore for goal ${id}: ${err.message}`),
		);

		return updated;
	}

	/**
	 * Delete a goal
	 */
	async delete(id: string, userId: string) {
		await this.findOne(id, userId);

		const deleted = await this.prisma.goal.delete({
			where: { id },
		});

		this.logger.log(`Goal deleted: ${id}`);
		return deleted;
	}

	/**
	 * Bulk update ranks via transaction
	 */
	async reorder(userId: string, items: ReorderGoalItemDto[]) {
		const updates = items.map((item) =>
			this.prisma.goal.updateMany({
				where: { id: item.id, userId },
				data: { rank: item.rank },
			}),
		);

		await this.prisma.$transaction(updates);

		this.logger.log(`Goals reordered for user ${userId}: ${items.length} items`);

		// Cascade rescore tasks for all reordered goals
		Promise.all(
			items.map((item) =>
				this.cascadeRescoreByGoal(item.id).catch((err) =>
					this.logger.warn(`Failed to cascade rescore for goal ${item.id}: ${err.message}`),
				),
			),
		).catch(() => {});

		return this.findAll(userId);
	}

	private async cascadeRescoreByGoal(goalId: string) {
		const tasks = await this.prisma.task.findMany({
			where: { goalId },
			select: { id: true },
		});
		await Promise.all(
			tasks.map((t) =>
				this.scorer.scoreTask(t.id).catch((err) =>
					this.logger.warn(`Failed to rescore task ${t.id}: ${err.message}`),
				),
			),
		);
	}
}
