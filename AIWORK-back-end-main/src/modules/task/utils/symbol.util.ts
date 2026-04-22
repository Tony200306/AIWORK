import { Priority } from '@prisma/client';

export type Symbol = 'HIGHEST' | 'HIGH' | 'MEDIUM' | 'LOW' | 'LOWEST';

const SYMBOL_TIERS: { min: number; symbol: Symbol }[] = [
	{ min: 85, symbol: 'HIGHEST' },
	{ min: 70, symbol: 'HIGH' },
	{ min: 50, symbol: 'MEDIUM' },
	{ min: 30, symbol: 'LOW' },
	{ min: 0, symbol: 'LOWEST' },
];

const ORDERED_SYMBOLS: Symbol[] = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];

/**
 * Map a composite score (0-100) to a symbol tier.
 */
export function scoreToSymbol(score: number): Symbol {
	for (const tier of SYMBOL_TIERS) {
		if (score >= tier.min) return tier.symbol;
	}
	return 'LOWEST';
}

/**
 * Apply a manual override (shift ±1 tier) or pin override.
 */
export function applySymbolOverride(
	symbol: Symbol,
	override: number,
	pinned: boolean,
): Symbol {
	if (pinned) return 'HIGHEST';

	const idx = ORDERED_SYMBOLS.indexOf(symbol);
	const shifted = Math.max(0, Math.min(ORDERED_SYMBOLS.length - 1, idx - override));
	return ORDERED_SYMBOLS[shifted];
}

/**
 * Map composite score (0-100) to legacy Priority enum for backward compat.
 */
export function compositeScoreToPriority(score: number): Priority {
	if (score >= 85) return Priority.PRIORITY;
	if (score >= 70) return Priority.HIGHEST;
	if (score >= 55) return Priority.HIGH;
	if (score >= 40) return Priority.MEDIUM;
	if (score >= 25) return Priority.LOW;
	return Priority.LOWEST;
}
