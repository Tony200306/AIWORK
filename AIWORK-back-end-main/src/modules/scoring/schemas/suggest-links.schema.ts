import { z } from 'zod';

export const SuggestLinksResultSchema = z.object({
	suggestions: z.array(
		z.object({
			task_id: z.string(),
			suggested_goal_id: z.string().nullable(),
			goal_confidence: z.number().min(0).max(1),
			suggested_client_id: z.string().nullable(),
			client_confidence: z.number().min(0).max(1),
			tags: z.array(z.string()),
			reasoning: z.string(),
		}),
	),
});

export type SuggestLinksResult = z.infer<typeof SuggestLinksResultSchema>;
