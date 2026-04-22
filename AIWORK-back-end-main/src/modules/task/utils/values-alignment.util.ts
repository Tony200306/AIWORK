/**
 * TAG_VALUE_DICTIONARY — maps each user value to matching/conflict tags.
 * Replicated from vantum-ai/src/services/application/scoring/suggest_links.py
 */
const TAG_VALUE_DICTIONARY: Record<
	string,
	{ matching: string[]; conflict: string[] }
> = {
	client_trust: {
		matching: ['Communication', 'Follow-up', 'Relationship'],
		conflict: ['Avoidance', 'Delayed'],
	},
	deep_work: {
		matching: ['Strategy', 'Research', 'Creative', 'Architecture'],
		conflict: ['Admin', 'Reactive'],
	},
	family: {
		matching: ['Protected-block', 'Boundary'],
		conflict: ['After-hours', 'Weekend'],
	},
	health: {
		matching: ['Exercise', 'Recovery', 'Protected-block'],
		conflict: ['Overtime', 'Burnout-risk'],
	},
	financial_independence: {
		matching: ['Revenue', 'Business-dev', 'Pipeline'],
		conflict: ['Pro-bono', 'Scope-creep'],
	},
	strategic_impact: {
		matching: ['Strategy', 'Planning', 'High-leverage'],
		conflict: ['Busywork', 'Low-impact'],
	},
	autonomy: {
		matching: ['Self-directed', 'Ownership'],
		conflict: ['Micromanaged', 'Approval-waiting'],
	},
	craft: {
		matching: ['Quality', 'Polish', 'Excellence'],
		conflict: ['Rush', 'Corners-cut'],
	},
};

/**
 * Compute values alignment score.
 * For each user value: match tag → 1.0, conflict tag → -0.3, else → 0.0.
 * Returns average across all values in stack.
 */
export function computeValuesAlignment(
	taskTags: string[],
	valuesStack: string[],
): number {
	if (!valuesStack.length) return 0;

	const tagSet = new Set(taskTags.map((t) => t.toLowerCase()));

	let totalScore = 0;

	for (const value of valuesStack) {
		const dict = TAG_VALUE_DICTIONARY[value];
		if (!dict) continue;

		const hasMatch = dict.matching.some((t) => tagSet.has(t.toLowerCase()));
		const hasConflict = dict.conflict.some((t) =>
			tagSet.has(t.toLowerCase()),
		);

		if (hasMatch) {
			totalScore += 1.0;
		} else if (hasConflict) {
			totalScore += -0.3;
		}
		// else 0.0 — no contribution
	}

	return Math.round((totalScore / valuesStack.length) * 1000) / 1000;
}
