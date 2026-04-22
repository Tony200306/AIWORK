import { ClientDisposition } from '@prisma/client';

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/**
 * Deadline proximity sub-signal (0-1.0).
 */
export function computeDeadlineProximity(
	dueAt: Date | null | undefined,
): number {
	if (!dueAt) return 0.15;

	const now = Date.now();
	const diff = dueAt.getTime() - now;

	if (diff <= 0) return 1.0; // overdue
	if (diff <= 24 * MS_PER_HOUR) return 0.95;
	if (diff <= 48 * MS_PER_HOUR) return 0.8;
	if (diff <= 7 * MS_PER_DAY) return 0.55;
	return 0.3; // >7 days
}

const DISPOSITION_URGENCY: Record<ClientDisposition, number> = {
	HAPPY: 0.2,
	NEUTRAL: 0.2,
	ON_EDGE: 0.45,
	HIGH_PRESSURE: 0.7,
	WINDING_DOWN: 0.2,
};

/**
 * Disposition urgency sub-signal (0-1.0).
 */
export function computeDispositionUrgency(
	disposition: ClientDisposition | null | undefined,
): number {
	if (!disposition) return 0;
	return DISPOSITION_URGENCY[disposition] ?? 0;
}

/**
 * Goal starvation sub-signal (0-1.0).
 * How long since the linked goal last had a task completed.
 */
export function computeGoalStarvation(
	lastCompletionDate: Date | null | undefined,
): number {
	if (!lastCompletionDate) return 0;

	const daysSince =
		(Date.now() - lastCompletionDate.getTime()) / MS_PER_DAY;

	if (daysSince >= 14) return 0.7;
	if (daysSince >= 7) return 0.5;
	return 0;
}

/**
 * Combined time sensitivity = MAX of all three sub-signals.
 */
export function computeTimeSensitivity(
	dueAt: Date | null | undefined,
	disposition: ClientDisposition | null | undefined,
	goalLastCompletionDate: Date | null | undefined,
): number {
	const deadline = computeDeadlineProximity(dueAt);
	const urgency = computeDispositionUrgency(disposition);
	const starvation = computeGoalStarvation(goalLastCompletionDate);

	return Math.round(Math.max(deadline, urgency, starvation) * 1000) / 1000;
}
