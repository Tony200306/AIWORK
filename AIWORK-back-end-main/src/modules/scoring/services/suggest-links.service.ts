import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { LlmService } from '@shared/llm/services/llm.service';
import { PromptService } from '@shared/llm/services/prompt.service';
import { TagType } from '@prisma/client';
import {
	SuggestLinksResultSchema,
	SuggestLinksResult,
} from '../schemas/suggest-links.schema';

interface TaskSuggestion {
	taskId: string;
	goalId: string | null;
	goalConfidence: number;
	clientId: string | null;
	clientConfidence: number;
	tags: string[];
	reasoning: string;
}

@Injectable()
export class SuggestLinksService {
	private readonly logger = new Logger(SuggestLinksService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly llmService: LlmService,
		private readonly promptService: PromptService,
	) {}

	/**
	 * Suggest goal, client, and tag links for the given tasks.
	 * Short-circuits when only 1 goal/client exists (auto-assign without LLM).
	 * Applies suggestions directly to the DB.
	 */
	async suggestLinks(userId: string, taskIds: string[]): Promise<TaskSuggestion[]> {
		if (taskIds.length === 0) return [];

		// Fetch tasks, goals, clients, valuesStack
		const [tasks, goals, clients, userProfile] = await Promise.all([
			this.prisma.task.findMany({
				where: { id: { in: taskIds }, userId },
				select: { id: true, title: true, description: true, goalId: true, clientId: true },
			}),
			this.prisma.goal.findMany({
				where: { userId },
				select: { id: true, title: true, description: true, tier: true, rank: true },
				orderBy: [{ tier: 'asc' }, { rank: 'asc' }],
			}),
			this.prisma.client.findMany({
				where: { userId },
				select: { id: true, name: true },
			}),
			this.prisma.userProfile.findFirst({
				where: { userId },
				select: { valuesStack: true },
			}),
		]);

		if (tasks.length === 0) return [];

		const valuesStack = userProfile?.valuesStack ?? [];

		// Build suggestions — short-circuit or LLM
		let suggestions: TaskSuggestion[];

		const needsLlmForGoals = goals.length > 1 && tasks.some((t) => !t.goalId);
		const needsLlmForClients = clients.length > 1 && tasks.some((t) => !t.clientId);
		const needsLlm = needsLlmForGoals || needsLlmForClients;

		if (needsLlm) {
			suggestions = await this.callLlm(tasks, goals, clients, valuesStack);
		} else {
			// Short-circuit: auto-assign if only 1 goal/client exists
			suggestions = tasks.map((t) => ({
				taskId: t.id,
				goalId: !t.goalId && goals.length === 1 ? goals[0].id : null,
				goalConfidence: !t.goalId && goals.length === 1 ? 1.0 : 0.0,
				clientId: !t.clientId && clients.length === 1 ? clients[0].id : null,
				clientConfidence: !t.clientId && clients.length === 1 ? 1.0 : 0.0,
				tags: [],
				reasoning: goals.length <= 1 && clients.length <= 1
					? 'Auto-assigned (single goal/client)'
					: 'No LLM needed',
			}));
		}

		// Apply suggestions to DB
		await this.applySuggestions(userId, tasks, suggestions);

		return suggestions;
	}

	private async callLlm(
		tasks: { id: string; title: string; description: string | null; goalId: string | null; clientId: string | null }[],
		goals: { id: string; title: string; description: string | null; tier: string; rank: number }[],
		clients: { id: string; name: string }[],
		valuesStack: string[],
	): Promise<TaskSuggestion[]> {
		const systemPrompt = await this.promptService.getPrompt(
			'scoring.suggest_links.system_prompt',
		);

		const userPrompt = await this.promptService.getPrompt(
			'scoring.suggest_links.users_prompt',
			{
				goals_text: this.formatGoalsText(goals),
				clients_text: this.formatClientsText(clients),
				values_stack: this.formatValuesStack(valuesStack),
				tasks_text: this.formatTasksText(tasks),
			},
		);

		let llmResult: SuggestLinksResult;
		try {
			llmResult = await this.llmService.invoke<SuggestLinksResult>({
				modelGroup: 'suggest_links',
				schema: SuggestLinksResultSchema,
				systemPrompt,
				userPrompt,
				traceName: 'scoring.suggest_links',
			});
		} catch (err) {
			this.logger.warn(`LLM suggest_links call failed: ${err.message}. Returning defaults.`);
			return tasks.map((t) => ({
				taskId: t.id,
				goalId: null,
				goalConfidence: 0.0,
				clientId: null,
				clientConfidence: 0.0,
				tags: [],
				reasoning: '',
			}));
		}

		return this.validateSuggestions(llmResult, tasks, goals, clients);
	}

	private validateSuggestions(
		llmResult: SuggestLinksResult,
		tasks: { id: string; title: string; description: string | null; goalId: string | null; clientId: string | null }[],
		goals: { id: string }[],
		clients: { id: string }[],
	): TaskSuggestion[] {
		const validGoalIds = new Set(goals.map((g) => g.id));
		const validClientIds = new Set(clients.map((c) => c.id));
		const inputTaskIds = new Set(tasks.map((t) => t.id));

		const byTask = new Map<string, TaskSuggestion>();

		for (const s of llmResult.suggestions) {
			if (!inputTaskIds.has(s.task_id)) {
				this.logger.warn(`LLM returned suggestion for unknown task_id: ${s.task_id}, skipping`);
				continue;
			}

			let goalId = s.suggested_goal_id;
			let goalConf = s.goal_confidence;
			if (goalId && !validGoalIds.has(goalId)) {
				this.logger.warn(`LLM returned invalid goal_id '${goalId}' for task ${s.task_id}, nullifying`);
				goalId = null;
				goalConf = 0.0;
			}

			let clientId = s.suggested_client_id;
			let clientConf = s.client_confidence;
			if (clientId && !validClientIds.has(clientId)) {
				this.logger.warn(`LLM returned invalid client_id '${clientId}' for task ${s.task_id}, nullifying`);
				clientId = null;
				clientConf = 0.0;
			}

			goalConf = Math.max(0, Math.min(1, goalConf));
			clientConf = Math.max(0, Math.min(1, clientConf));

			const tags = s.tags ? s.tags.slice(0, 10) : [];

			byTask.set(s.task_id, {
				taskId: s.task_id,
				goalId,
				goalConfidence: goalConf,
				clientId,
				clientConfidence: clientConf,
				tags,
				reasoning: s.reasoning || '',
			});
		}

		// Fill defaults for missing tasks
		for (const t of tasks) {
			if (!byTask.has(t.id)) {
				this.logger.warn(`LLM did not return suggestion for task_id: ${t.id}, filling default`);
				byTask.set(t.id, {
					taskId: t.id,
					goalId: null,
					goalConfidence: 0.0,
					clientId: null,
					clientConfidence: 0.0,
					tags: [],
					reasoning: '',
				});
			}
		}

		// Return in input order
		return tasks.map((t) => byTask.get(t.id)!);
	}

	/**
	 * Apply suggestions: update task goalId/clientId, create/replace TaskTag entries.
	 * Only updates goalId/clientId if the task doesn't already have one.
	 */
	private async applySuggestions(
		userId: string,
		tasks: { id: string; goalId: string | null; clientId: string | null }[],
		suggestions: TaskSuggestion[],
	): Promise<void> {
		const taskMap = new Map(tasks.map((t) => [t.id, t]));

		for (const suggestion of suggestions) {
			const task = taskMap.get(suggestion.taskId);
			if (!task) continue;

			// Update goalId/clientId only if task doesn't already have one
			const updates: Record<string, any> = {};
			if (!task.goalId && suggestion.goalId) {
				updates.goalId = suggestion.goalId;
			}
			if (!task.clientId && suggestion.clientId) {
				updates.clientId = suggestion.clientId;
			}

			if (Object.keys(updates).length > 0) {
				await this.prisma.task.update({
					where: { id: suggestion.taskId },
					data: updates,
				});
			}

			// Apply tags: find-or-create Tag records, then replace TaskTag associations
			if (suggestion.tags.length > 0) {
				await this.applyTags(userId, suggestion.taskId, suggestion.tags);
			}
		}
	}

	/**
	 * Find-or-create tags by name for the user, then create TaskTag associations.
	 * Merges with any existing tags on the task.
	 */
	private async applyTags(userId: string, taskId: string, tagNames: string[]): Promise<void> {
		// Find existing tags by name for this user
		const existingTags = await this.prisma.tag.findMany({
			where: {
				userId,
				name: { in: tagNames, mode: 'insensitive' },
			},
			select: { id: true, name: true },
		});

		const existingByName = new Map(
			existingTags.map((t) => [t.name.toLowerCase(), t.id]),
		);

		// Create missing tags
		const missingNames = tagNames.filter(
			(name) => !existingByName.has(name.toLowerCase()),
		);

		if (missingNames.length > 0) {
			await this.prisma.tag.createMany({
				data: missingNames.map((name) => ({ userId, name, type: TagType.TODO })),
				skipDuplicates: true,
			});

			// Re-fetch to get IDs of newly created tags
			const newTags = await this.prisma.tag.findMany({
				where: {
					userId,
					name: { in: missingNames, mode: 'insensitive' },
				},
				select: { id: true, name: true },
			});

			for (const t of newTags) {
				existingByName.set(t.name.toLowerCase(), t.id);
			}
		}

		// Collect all tag IDs for this suggestion
		const tagIds = tagNames
			.map((name) => existingByName.get(name.toLowerCase()))
			.filter((id): id is string => id !== undefined);

		if (tagIds.length === 0) return;

		// Get existing TaskTag associations to avoid duplicates
		const existingTaskTags = await this.prisma.taskTag.findMany({
			where: { taskId },
			select: { tagId: true },
		});
		const existingTagIdSet = new Set(existingTaskTags.map((tt) => tt.tagId));

		// Only create new associations
		const newTagIds = tagIds.filter((id) => !existingTagIdSet.has(id));
		if (newTagIds.length > 0) {
			await this.prisma.taskTag.createMany({
				data: newTagIds.map((tagId) => ({
					taskId,
					tagId,
					isPrimary: false,
				})),
				skipDuplicates: true,
			});
		}
	}

	// ==================== FORMATTERS ====================

	private formatGoalsText(goals: { id: string; title: string; description: string | null; tier: string; rank: number }[]): string {
		if (goals.length === 0) return 'No goals defined.';
		return goals
			.map((g) => {
				const desc = g.description ? ` — ${g.description}` : '';
				return `- ID: ${g.id} | Tier: ${g.tier} | Rank: ${g.rank} | ${g.title}${desc}`;
			})
			.join('\n');
	}

	private formatClientsText(clients: { id: string; name: string }[]): string {
		if (clients.length === 0) return 'No clients defined.';
		return clients.map((c) => `- ID: ${c.id} | ${c.name}`).join('\n');
	}

	private formatTasksText(tasks: { id: string; title: string; description: string | null }[]): string {
		return tasks
			.map((t) => {
				const desc = t.description ? `\n  Description: ${t.description}` : '';
				return `- ID: ${t.id} | ${t.title}${desc}`;
			})
			.join('\n');
	}

	private formatValuesStack(valuesStack: string[]): string {
		if (valuesStack.length === 0) return 'No values selected.';
		return valuesStack.map((v, i) => `${i + 1}. ${v}`).join('\n');
	}
}
