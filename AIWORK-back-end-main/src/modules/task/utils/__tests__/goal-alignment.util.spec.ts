import { GoalTier } from '@prisma/client';
import { computeGoalAlignment } from '../goal-alignment.util';

describe('computeGoalAlignment', () => {
	it('returns 0.25 when no goal is linked', () => {
		expect(computeGoalAlignment(null, null)).toBe(0.25);
		expect(computeGoalAlignment(undefined, undefined)).toBe(0.25);
	});

	it('T1 rank 1 → 1.0 (max)', () => {
		expect(computeGoalAlignment(GoalTier.T1, 1)).toBe(1.0);
	});

	it('T1 rank 2 → 0.85', () => {
		expect(computeGoalAlignment(GoalTier.T1, 2)).toBe(0.85);
	});

	it('T2 rank 1 → 0.8', () => {
		expect(computeGoalAlignment(GoalTier.T2, 1)).toBe(0.8);
	});

	it('T2 rank 3 → 0.56', () => {
		expect(computeGoalAlignment(GoalTier.T2, 3)).toBe(0.56);
	});

	it('T3 rank 1 → 0.55', () => {
		expect(computeGoalAlignment(GoalTier.T3, 1)).toBe(0.55);
	});

	it('T3 rank 4 → 0.33', () => {
		expect(computeGoalAlignment(GoalTier.T3, 4)).toBe(0.33);
	});

	it('rank 5+ uses default weight 0.5', () => {
		expect(computeGoalAlignment(GoalTier.T1, 5)).toBe(0.5);
		expect(computeGoalAlignment(GoalTier.T1, 10)).toBe(0.5);
	});

	it('null rank uses default weight 0.5', () => {
		expect(computeGoalAlignment(GoalTier.T1, null)).toBe(0.5);
	});
});
