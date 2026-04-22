import { GoalTier } from '@prisma/client';

const TIER_WEIGHTS: Record<GoalTier, number> = {
	T1: 1.0,
	T2: 0.8,
	T3: 0.55,
};

const NO_GOAL_WEIGHT = 0.25;

const RANK_WEIGHTS: Record<number, number> = {
	1: 1.0,
	2: 0.85,
	3: 0.7,
	4: 0.6,
};

const DEFAULT_RANK_WEIGHT = 0.5;

/**
 * Compute goal alignment score (0-1.0).
 * If no goal is linked, returns NO_GOAL_WEIGHT (0.25).
 * Optional impactScore (0-1) from LLM evaluation scales the result.
 */
export function computeGoalAlignment(
	tier: GoalTier | null | undefined,
	rank: number | null | undefined,
	impactScore = 1.0,
): number {
	if (!tier) return NO_GOAL_WEIGHT;

	const tierWeight = TIER_WEIGHTS[tier] ?? NO_GOAL_WEIGHT;
	const rankWeight = rank != null ? (RANK_WEIGHTS[rank] ?? DEFAULT_RANK_WEIGHT) : DEFAULT_RANK_WEIGHT;

	return Math.round(tierWeight * rankWeight * impactScore * 1000) / 1000;
}
