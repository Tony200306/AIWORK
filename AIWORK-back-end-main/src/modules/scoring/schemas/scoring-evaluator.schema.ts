import { z } from 'zod';

export const ScoringEvaluatorSchema = z.object({
	impact_score: z.number().min(0).max(1),
	visibility_score: z.number().min(0).max(1),
});

export type ScoringEvaluatorResult = z.infer<typeof ScoringEvaluatorSchema>;
