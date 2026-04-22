import { ClientDisposition } from '@prisma/client';
import {
	computeDeadlineProximity,
	computeDispositionUrgency,
	computeGoalStarvation,
	computeTimeSensitivity,
} from '../time-sensitivity.util';

describe('computeDeadlineProximity', () => {
	it('returns 0.15 when no due date', () => {
		expect(computeDeadlineProximity(null)).toBe(0.15);
		expect(computeDeadlineProximity(undefined)).toBe(0.15);
	});

	it('returns 1.0 when overdue', () => {
		const past = new Date(Date.now() - 3_600_000);
		expect(computeDeadlineProximity(past)).toBe(1.0);
	});

	it('returns 0.95 when due within 24h', () => {
		const soon = new Date(Date.now() + 12 * 3_600_000);
		expect(computeDeadlineProximity(soon)).toBe(0.95);
	});

	it('returns 0.8 when due within 48h', () => {
		const in36h = new Date(Date.now() + 36 * 3_600_000);
		expect(computeDeadlineProximity(in36h)).toBe(0.8);
	});

	it('returns 0.55 when due within 7 days', () => {
		const in5d = new Date(Date.now() + 5 * 86_400_000);
		expect(computeDeadlineProximity(in5d)).toBe(0.55);
	});

	it('returns 0.3 when due in more than 7 days', () => {
		const in10d = new Date(Date.now() + 10 * 86_400_000);
		expect(computeDeadlineProximity(in10d)).toBe(0.3);
	});
});

describe('computeDispositionUrgency', () => {
	it('returns 0 when no disposition', () => {
		expect(computeDispositionUrgency(null)).toBe(0);
	});

	it('HAPPY → 0.2', () => {
		expect(computeDispositionUrgency(ClientDisposition.HAPPY)).toBe(0.2);
	});

	it('ON_EDGE → 0.45', () => {
		expect(computeDispositionUrgency(ClientDisposition.ON_EDGE)).toBe(0.45);
	});

	it('HIGH_PRESSURE → 0.7', () => {
		expect(computeDispositionUrgency(ClientDisposition.HIGH_PRESSURE)).toBe(0.7);
	});
});

describe('computeGoalStarvation', () => {
	it('returns 0 when no last completion date', () => {
		expect(computeGoalStarvation(null)).toBe(0);
	});

	it('returns 0 when completed recently (≤7 days)', () => {
		const recent = new Date(Date.now() - 3 * 86_400_000);
		expect(computeGoalStarvation(recent)).toBe(0);
	});

	it('returns 0.5 when 7-14 days ago', () => {
		const tenDaysAgo = new Date(Date.now() - 10 * 86_400_000);
		expect(computeGoalStarvation(tenDaysAgo)).toBe(0.5);
	});

	it('returns 0.7 when 14+ days ago', () => {
		const twentyDaysAgo = new Date(Date.now() - 20 * 86_400_000);
		expect(computeGoalStarvation(twentyDaysAgo)).toBe(0.7);
	});
});

describe('computeTimeSensitivity', () => {
	it('returns MAX of all three sub-signals', () => {
		// overdue → 1.0, HIGH_PRESSURE → 0.7, starvation 14+ → 0.7
		const overdue = new Date(Date.now() - 86_400_000);
		const starved = new Date(Date.now() - 20 * 86_400_000);
		expect(
			computeTimeSensitivity(overdue, ClientDisposition.HIGH_PRESSURE, starved),
		).toBe(1.0);
	});

	it('falls back to disposition urgency when no deadline and no starvation', () => {
		expect(
			computeTimeSensitivity(null, ClientDisposition.ON_EDGE, null),
		).toBe(0.45);
	});

	it('returns 0.15 with no signals (deadline none = 0.15)', () => {
		expect(computeTimeSensitivity(null, null, null)).toBe(0.15);
	});
});
