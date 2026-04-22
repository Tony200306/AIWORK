import {
	ClientRevenueRange,
	ClientRelationshipState,
	ClientDisposition,
} from '@prisma/client';

const REVENUE_SCORES: Record<ClientRevenueRange, number> = {
	UNDER_3K: 0.3,
	K3_TO_7K: 0.55,
	K7_TO_12K: 0.8,
	K12_PLUS: 1.0,
};

const RELATIONSHIP_SCORES: Record<ClientRelationshipState, number> = {
	THRIVING: 1.0,
	STABLE: 0.7,
	UNDER_PRESSURE: 0.85,
	AT_RISK: 1.0,
};

const DISPOSITION_MAP: Record<ClientRelationshipState, ClientDisposition> = {
	THRIVING: ClientDisposition.HAPPY,
	STABLE: ClientDisposition.NEUTRAL,
	UNDER_PRESSURE: ClientDisposition.ON_EDGE,
	AT_RISK: ClientDisposition.HIGH_PRESSURE,
};

const DISPOSITION_MULTIPLIERS: Record<ClientDisposition, number> = {
	HAPPY: 1.0,
	NEUTRAL: 1.0,
	ON_EDGE: 1.15,
	HIGH_PRESSURE: 1.3,
	WINDING_DOWN: 0.7,
};

export function computeDisposition(
	relationshipState: ClientRelationshipState | null | undefined,
): ClientDisposition | null {
	if (!relationshipState) return null;
	return DISPOSITION_MAP[relationshipState] ?? null;
}

/**
 * Compute client weight score.
 * Optional visibilityScore (0-1) from LLM evaluation scales the result.
 */
export function computeClientWeight(
	revenueRange: ClientRevenueRange | null | undefined,
	relationshipState: ClientRelationshipState | null | undefined,
	disposition: ClientDisposition | null | undefined,
	visibilityScore = 1.0,
): number | null {
	if (!revenueRange && !relationshipState) return null;

	const revenueScore = revenueRange ? REVENUE_SCORES[revenueRange] : 0;
	const relationshipScore = relationshipState
		? RELATIONSHIP_SCORES[relationshipState]
		: 0;

	const baseWeight = revenueScore * 0.5 + relationshipScore * 0.5;
	const multiplier = disposition
		? DISPOSITION_MULTIPLIERS[disposition]
		: 1.0;

	return (
		Math.round(
			baseWeight * multiplier * visibilityScore * 1000,
		) / 1000
	);
}
