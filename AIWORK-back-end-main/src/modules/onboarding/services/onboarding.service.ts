import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
	GoalTier,
	ClientRevenueRange,
	ClientRelationshipState,
	ValueEnum,
} from '@prisma/client';
import { aiConfig } from '@config/ai.config';
import {
	OnboardingBrainDumpInputDto,
	OnboardingBrainDumpOutputDto,
	OnboardingQuestionDto,
} from '../dtos/onboarding-braindump.dto';
import { DirectClientInputDto } from '../dtos/extract-profile.dto';
import { GoalService } from '@modules/goal/services/goal.service';
import { ClientService } from '@modules/client/services/client.service';
import { UserService } from '@modules/user/services/user.service';

@Injectable()
export class OnboardingService {
	private readonly logger = new Logger(OnboardingService.name);
	private readonly baseUrl: string;
	private readonly apiKey: string;
	private readonly timeout: number;

	constructor(
		private readonly goalService: GoalService,
		private readonly clientService: ClientService,
		private readonly userService: UserService,
	) {
		this.baseUrl = aiConfig.vantumAi.baseUrl;
		this.apiKey = aiConfig.vantumAi.apiKey;
		this.timeout = aiConfig.vantumAi.timeout;
	}

	/**
	 * Call the onboarding braindump API to generate tasks
	 */
	async braindump(
		input: OnboardingBrainDumpInputDto,
	): Promise<OnboardingBrainDumpOutputDto> {
		const url = `${this.baseUrl}/api/v1/onboarding/braindump`;

		// Transform to snake_case for the external API
		const requestBody = {
			query: input.query || null,
			selected_tasks: input.selectedTasks,
			questions: input.questions.map((q) => ({
				question: q.question,
				answer: q.answer,
			})),
			history_actions: (input.historyActions || []).map(
				(h) => ({
					user_query: h.userQuery,
					added_tasks:
						h.addedTasks || [],
				}),
			),
		};

		this.logger.log(`Calling onboarding API: ${url}`);
		this.logger.debug(
			`Request body: ${JSON.stringify(requestBody)}`,
		);

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				this.timeout,
			);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type':
						'application/json',
					Accept: 'application/json',
					'X-API-Key': this.apiKey,
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(
					`Onboarding API error: ${response.status} - ${errorText}`,
				);
				throw new HttpException(
					`Onboarding API error: ${response.statusText}`,
					response.status,
				);
			}

			const data = await response.json();
			this.logger.log(
				`Onboarding API response received successfully`,
			);

			// Transform response from snake_case to camelCase
			const result: OnboardingBrainDumpOutputDto = {
				tasks: (data.tasks || []).map(
					(task: any) => ({
						text: task.text,
						roles:
							task.roles ||
							[],
						estTime:
							task.est_time ||
							0,
					}),
				),
			};

			return result;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}

			if (error.name === 'AbortError') {
				this.logger.error(
					`Onboarding API request timeout after ${this.timeout}ms`,
				);
				throw new HttpException(
					'Onboarding API request timeout',
					HttpStatus.GATEWAY_TIMEOUT,
				);
			}

			this.logger.error(
				`Onboarding API request failed: ${error.message}`,
			);
			throw new HttpException(
				'Failed to connect to onboarding service',
				HttpStatus.BAD_GATEWAY,
			);
		}
	}

	/**
	 * Extract profile: AI for goals only, client & values persisted directly from form data.
	 */
	async extractProfile(
		userId: string,
		questions: OnboardingQuestionDto[],
		userQuery?: string,
		clientInput?: DirectClientInputDto,
		valuesInput?: ValueEnum[],
	) {
		// 1. Call Python AI service — goals only
		const createdGoals = await this.extractGoalsFromAI(userId, questions, userQuery);

		// 2. Persist client directly from form data (no AI needed)
		const createdClients = [];
		if (clientInput?.name) {
			const created = await this.clientService.create(userId, {
				name: clientInput.name,
				revenueRange: clientInput.revenueRange,
				relationshipState: clientInput.relationshipState,
			});
			createdClients.push(created);
		}

		// 3. Update values directly from form picks (no AI needed)
		const suggestedValues: ValueEnum[] = (valuesInput || [])
			.filter((v) => Object.values(ValueEnum).includes(v))
			.slice(0, 3);

		if (suggestedValues.length === 3) {
			await this.userService.updateValuesStack(userId, suggestedValues);
		}

		return {
			goals: createdGoals,
			clients: createdClients,
			suggestedValues,
		};
	}

	/**
	 * Call Python AI to extract goals from onboarding Q&A.
	 */
	private async extractGoalsFromAI(
		userId: string,
		questions: OnboardingQuestionDto[],
		userQuery?: string,
	) {
		const url = `${this.baseUrl}/scoring/extract-goals`;

		const requestBody = {
			questions: questions.map((q) => ({
				question: q.question,
				answer: q.answer,
			})),
			user_query: userQuery || null,
		};

		this.logger.log(`Calling extract-goals API: ${url}`);

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), this.timeout);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-API-Key': this.apiKey,
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				this.logger.error(`Extract goals API error: ${response.status} - ${errorText}`);
				throw new HttpException(
					`Extract goals API error: ${response.statusText}`,
					response.status,
				);
			}

			const data = await response.json();
			this.logger.log(`Extract goals API response received`);

			const createdGoals = [];
			for (const goal of data.goals || []) {
				const tier = goal.tier as GoalTier;
				if (!Object.values(GoalTier).includes(tier)) continue;

				const created = await this.goalService.create(userId, {
					tier,
					title: goal.title,
					description: goal.description || undefined,
				});
				createdGoals.push({
					...created,
					confidence: goal.confidence || 0,
				});
			}

			return createdGoals;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}

			if (error.name === 'AbortError') {
				this.logger.error(`Extract goals API timeout after ${this.timeout}ms`);
				throw new HttpException(
					'Extract goals API request timeout',
					HttpStatus.GATEWAY_TIMEOUT,
				);
			}

			this.logger.error(`Extract goals request failed: ${error.message}`);
			throw new HttpException(
				'Failed to extract goals from onboarding data',
				HttpStatus.BAD_GATEWAY,
			);
		}
	}
}
