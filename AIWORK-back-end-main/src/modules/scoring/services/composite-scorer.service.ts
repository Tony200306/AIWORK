import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { TaskStatus } from '@prisma/client';
import { computeGoalAlignment } from '@modules/task/utils/goal-alignment.util';
import { computeTimeSensitivity } from '@modules/task/utils/time-sensitivity.util';
import { computeValuesAlignment } from '@modules/task/utils/values-alignment.util';
import { computeClientWeight } from '@modules/client/utils/client-weight.util';
import { compositeScoreToPriority } from '@modules/task/utils/symbol.util';
import { LlmService } from '@shared/llm/services/llm.service';
import { PromptService } from '@shared/llm/services/prompt.service';
import {
	ScoringEvaluatorSchema,
	ScoringEvaluatorResult,
} from '../schemas/scoring-evaluator.schema';

const WEIGHTS = {
	goalAlignment: 0.4,
	clientWeight: 0.3,
	timeSensitivity: 0.18,
	valuesAlignment: 0.12,
};

const BATCH_SIZE = 50;

const DEFAULT_LLM_SCORES: ScoringEvaluatorResult = {
	impact_score: 1.0,
	visibility_score: 1.0,
};

@Injectable()
export class CompositeScorerService {
	private readonly logger = new Logger(CompositeScorerService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly llmService: LlmService,
		private readonly promptService: PromptService,
	) {}

	/**
	 * Call LLM to evaluate impact_score and visibility_score.
	 * Short-circuits if no goal AND no client (both default 1.0).
	 * On any error, gracefully degrades to { 1.0, 1.0 }.
	 */
	private async evaluateScoringDimensions(
		task: any,
	): Promise<ScoringEvaluatorResult> {
		// Short-circuit: no goal AND no client → skip LLM call
		if (!task.goal && !task.client) {
			return DEFAULT_LLM_SCORES;
		}

		try {
			const systemPrompt = await this.promptService.getPrompt(
				'scoring.evaluator.system_prompt',
			);

			const userPrompt = await this.promptService.getPrompt(
				'scoring.evaluator.user_prompt',
				{
					task_title: task.title,
					task_description: task.description,
					goal_title: task.goal?.title,
					goal_description: task.goal?.description,
					goal_tier: task.goal?.tier,
					client_name: task.client?.name,
					client_revenue: task.client?.revenueRange,
					client_relationship: task.client?.relationshipState,
					client_disposition: task.client?.disposition,
				},
			);

			const result = await this.llmService.invoke<ScoringEvaluatorResult>({
				modelGroup: 'scoring_evaluator',
				schema: ScoringEvaluatorSchema,
				systemPrompt,
				userPrompt,
				traceName: 'scoring.evaluate_task',
			});

			return result;
		} catch (err) {
			this.logger.warn(
				`LLM scoring evaluation failed for task ${task.id}: ${err.message}. Using defaults.`,
			);
			return DEFAULT_LLM_SCORES;
		}
	}

	/**
	 * Score a single task: fetch all related data, compute 4 dimensions,
	 * combine with weights, clip [0,100], persist to DB.
	 */
	async scoreTask(taskId: string) {
		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			include: {
				goal: true,
				client: true,
				taskTags: { include: { tag: true } },
				user: {
					include: {
						userProfile: true,
					},
				},
			},
		});

		if (!task) {
			throw new NotFoundException(`Task ${taskId} not found`);
		}

		// LLM-evaluated scoring dimensions
		const { impact_score, visibility_score } =
			await this.evaluateScoringDimensions(task);

		// 1. Goal Alignment (with LLM impact_score)
		const goalAlignmentVal = computeGoalAlignment(
			task.goal?.tier ?? null,
			task.goal?.rank ?? null,
			impact_score,
		);

		// 2. Client Weight (with LLM visibility_score)
		const clientWeightVal = computeClientWeight(
			task.client?.revenueRange ?? null,
			task.client?.relationshipState ?? null,
			task.client?.disposition ?? null,
			visibility_score,
		) ?? 0;

		// 3. Time Sensitivity
		const timeSensitivityVal = computeTimeSensitivity(
			task.dueAt,
			task.client?.disposition ?? null,
			task.goal?.lastCompletionDate ?? null,
		);

		// 4. Values Alignment
		const tagNames = task.taskTags?.map((tt) => tt.tag.name) ?? [];
		const valuesStack =
			task.user?.userProfile?.valuesStack?.map((v) =>
				v.toLowerCase(),
			) ?? [];
		const valuesAlignmentVal = computeValuesAlignment(tagNames, valuesStack);

		// Composite score
		const raw =
			WEIGHTS.goalAlignment * goalAlignmentVal +
			WEIGHTS.clientWeight * clientWeightVal +
			WEIGHTS.timeSensitivity * timeSensitivityVal +
			WEIGHTS.valuesAlignment * valuesAlignmentVal;

		const compositeScore = Math.round(Math.max(0, Math.min(1, raw)) * 100 * 100) / 100;

		// Legacy priority sync
		const priority = compositeScoreToPriority(compositeScore);

		// Persist
		const updated = await this.prisma.task.update({
			where: { id: taskId },
			data: {
				goalAlignment: goalAlignmentVal,
				clientWeightVal: clientWeightVal,
				timeSensitivity: timeSensitivityVal,
				valuesAlignment: valuesAlignmentVal,
				compositeScore,
				priority,
			},
		});

		this.logger.log(
			`Scored task ${taskId}: ${compositeScore} (goal=${goalAlignmentVal} client=${clientWeightVal} time=${timeSensitivityVal} values=${valuesAlignmentVal} impact=${impact_score} visibility=${visibility_score})`,
		);

		return {
			taskId,
			compositeScore,
			goalAlignment: goalAlignmentVal,
			clientWeightVal,
			timeSensitivity: timeSensitivityVal,
			valuesAlignment: valuesAlignmentVal,
			priority,
		};
	}

	/**
	 * Rescore all non-archived, non-done tasks for a user in batches.
	 */
	async batchRescoreUser(userId: string) {
		const tasks = await this.prisma.task.findMany({
			where: {
				userId,
				archivedAt: null,
				status: { not: TaskStatus.DONE },
			},
			select: { id: true },
		});

		this.logger.log(
			`Batch rescore for user ${userId}: ${tasks.length} tasks`,
		);

		const results = [];
		for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
			const batch = tasks.slice(i, i + BATCH_SIZE);
			const batchResults = await Promise.all(
				batch.map((t) =>
					this.scoreTask(t.id).catch((err) => {
						this.logger.warn(`Failed to score task ${t.id}: ${err.message}`);
						return null;
					}),
				),
			);
			results.push(...batchResults.filter(Boolean));
		}

		return {
			userId,
			totalTasks: tasks.length,
			scoredCount: results.length,
		};
	}

	/**
	 * Lock-aware reshuffle: rescore unlocked tasks, sort by score (pinned first),
	 * merge locked tasks back into original positions.
	 */
	async reshuffleByCompositeScore(
		userId: string,
		taskIds: string[],
		lockedTaskIds: string[] = [],
	) {
		const lockedSet = new Set(lockedTaskIds);

		// Fetch all tasks to get original order
		const tasks = await this.prisma.task.findMany({
			where: { id: { in: taskIds }, userId },
			select: { id: true, rank: true, pinned: true, compositeScore: true },
			orderBy: { rank: 'asc' },
		});

		const taskMap = new Map(tasks.map((t) => [t.id, t]));

		// Split into locked (keep position) and unlocked (to be rescored)
		const ordered = taskIds
			.map((id) => taskMap.get(id))
			.filter(Boolean) as typeof tasks;

		const unlocked = ordered.filter((t) => !lockedSet.has(t.id));
		const lockedPositions = new Map<number, (typeof tasks)[0]>();

		ordered.forEach((t, idx) => {
			if (lockedSet.has(t.id)) {
				lockedPositions.set(idx, t);
			}
		});

		// Rescore unlocked tasks
		await Promise.all(
			unlocked.map((t) =>
				this.scoreTask(t.id).catch((err) => {
					this.logger.warn(
						`Failed to score task ${t.id} during reshuffle: ${err.message}`,
					);
				}),
			),
		);

		// Re-fetch unlocked tasks with updated scores
		const rescored = await this.prisma.task.findMany({
			where: { id: { in: unlocked.map((t) => t.id) } },
			select: { id: true, compositeScore: true, pinned: true },
		});

		// Sort: pinned first, then by score descending
		rescored.sort((a, b) => {
			if (a.pinned && !b.pinned) return -1;
			if (!a.pinned && b.pinned) return 1;
			return (b.compositeScore ?? 0) - (a.compositeScore ?? 0);
		});

		// Merge: locked stay in place, unlocked fill remaining slots
		const final: string[] = [];
		let unlockedIdx = 0;

		for (let i = 0; i < ordered.length; i++) {
			if (lockedPositions.has(i)) {
				final.push(lockedPositions.get(i)!.id);
			} else {
				final.push(rescored[unlockedIdx++]?.id ?? ordered[i].id);
			}
		}

		// Update ranks
		await this.prisma.$transaction(
			final.map((id, idx) =>
				this.prisma.task.update({
					where: { id },
					data: { rank: idx },
				}),
			),
		);

		this.logger.log(
			`Reshuffle complete for user ${userId}: ${final.length} tasks, ${lockedPositions.size} locked`,
		);

		return {
			userId,
			taskIds: final,
			lockedCount: lockedPositions.size,
			rescoredCount: unlocked.length,
		};
	}
}
