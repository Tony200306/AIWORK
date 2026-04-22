import { computeValuesAlignment } from '../values-alignment.util';

describe('computeValuesAlignment', () => {
	it('returns 0 when values stack is empty', () => {
		expect(computeValuesAlignment(['Strategy'], [])).toBe(0);
	});

	it('returns 1.0 when single value fully matches', () => {
		expect(
			computeValuesAlignment(['Strategy'], ['deep_work']),
		).toBe(1.0);
	});

	it('returns -0.3 when single value has conflict', () => {
		expect(
			computeValuesAlignment(['Admin'], ['deep_work']),
		).toBe(-0.3);
	});

	it('returns 0 when tag has no match or conflict', () => {
		expect(
			computeValuesAlignment(['Unrelated'], ['deep_work']),
		).toBe(0);
	});

	it('averages across multiple values', () => {
		// deep_work: Strategy matches → 1.0
		// health: no match/conflict → 0.0
		// average = (1.0 + 0.0) / 2 = 0.5
		expect(
			computeValuesAlignment(['Strategy'], ['deep_work', 'health']),
		).toBe(0.5);
	});

	it('handles mixed match and conflict across values', () => {
		// deep_work: Strategy matches → 1.0
		// health: Overtime conflicts → -0.3
		// average = (1.0 + -0.3) / 2 = 0.35
		expect(
			computeValuesAlignment(
				['Strategy', 'Overtime'],
				['deep_work', 'health'],
			),
		).toBe(0.35);
	});

	it('is case-insensitive for tags', () => {
		expect(
			computeValuesAlignment(['strategy'], ['deep_work']),
		).toBe(1.0);
	});

	it('skips unknown values in stack', () => {
		// unknown_value is not in dictionary, so skipped
		// deep_work: Strategy matches → 1.0
		// average = 1.0 / 1 (only deep_work counted since unknown skips)
		// Actually: totalScore = 1.0, valuesStack.length = 2
		// average = 1.0 / 2 = 0.5
		expect(
			computeValuesAlignment(['Strategy'], ['deep_work', 'unknown_value']),
		).toBe(0.5);
	});

	it('all 8 values can match', () => {
		const allMatchTags = [
			'Communication', // client_trust
			'Strategy',      // deep_work
			'Protected-block', // family
			'Exercise',      // health
			'Revenue',       // financial_independence
			'Planning',      // strategic_impact (Strategy already covers deep_work)
			'Self-directed', // autonomy
			'Quality',       // craft
		];
		const allValues = [
			'client_trust', 'deep_work', 'family', 'health',
			'financial_independence', 'strategic_impact', 'autonomy', 'craft',
		];
		expect(computeValuesAlignment(allMatchTags, allValues)).toBe(1.0);
	});
});
