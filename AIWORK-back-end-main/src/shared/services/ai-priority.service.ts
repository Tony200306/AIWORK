import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { aiConfig } from '@config/ai.config';
import { Priority } from '@prisma/client';

// Request DTOs
export interface AiPriorityUserProfileDto {
	user_id: string;
	name: string;
	dob?: string;
	gender?: string;
	job: {
		title: string;
		seniority_level:
			| 'junior'
			| 'senior'
			| 'lead_manager'
			| 'other';
		job_description?: string;
	};
	projects: Array<{
		id: string;
		name: string;
		description?: string;
		role_in_project?: string;
	}>;
}

export interface AiPriorityTaskDto {
	id: string;
	text: string;
	est_time: number;
	is_star: boolean;
}

export interface AiPriorityRequestDto {
	user_profile: AiPriorityUserProfileDto;
	tasks: AiPriorityTaskDto[];
}

// Response DTOs
export interface AiPriorityTaskResponseDto {
	id: string;
	text: string;
	est_time: number;
	is_star: boolean;
	priority: number; // 1-5
	priority_reasoning: string;
}

export interface AiPriorityResponseDto {
	tasks: AiPriorityTaskResponseDto[];
}

@Injectable()
export class AiPriorityService {
	private readonly logger = new Logger(AiPriorityService.name);
	private readonly httpClient: AxiosInstance;

	constructor() {
		this.httpClient = axios.create({
			baseURL: aiConfig.vantumAi.baseUrl,
			timeout: aiConfig.vantumAi.timeout,
			headers: {
				'Content-Type': 'application/json',
				...(aiConfig.vantumAi.apiKey && {
					'X-API-Key': aiConfig.vantumAi.apiKey,
				}),
			},
		});
	}

	/**
	 * Call AI Priority Service to calculate task priorities
	 */
	async calculatePriorities(
		request: AiPriorityRequestDto,
	): Promise<AiPriorityResponseDto> {
		if (!aiConfig.vantumAi.enabled) {
			this.logger.warn(
				'AI Priority Service is disabled, skipping priority calculation',
			);
			return { tasks: [] };
		}

		try {
			this.logger.log(
				`Calling AI Priority Service for ${request.tasks.length} tasks`,
			);
			this.logger.debug(
				`AI Priority Request: ${JSON.stringify(request, null, 2)}`,
			);

			const response =
				await this.httpClient.post<AiPriorityResponseDto>(
					'/sprintplanning/priority',
					request,
					{
						headers: {
							'X-API-Key':
								aiConfig.vantumAi.apiKey ||
								'vantumutumutumu',
						},
					},
				);

			this.logger.log(
				`Received priorities for ${response.data.tasks.length} tasks`,
			);
			return response.data;
		} catch (error: any) {
			this.logger.error(
				'Failed to call AI Priority Service',
				error?.message,
			);
			if (error?.response?.data) {
				this.logger.error(
					`API Response: ${JSON.stringify(error.response.data)}`,
				);
			}
			// Return empty result on error (don't block task creation)
			return { tasks: [] };
		}
	}

	/**
	 * Call AI Priority Service to reshuffle task priorities
	 * Endpoint: /sprintplanning/priority/reshuffle
	 */
	async reshufflePriorities(
		request: AiPriorityRequestDto,
	): Promise<AiPriorityResponseDto> {
		if (!aiConfig.vantumAi.enabled) {
			this.logger.warn(
				'AI Priority Service is disabled, skipping priority reshuffle',
			);
			return { tasks: [] };
		}

		try {
			this.logger.log(
				`Calling AI Priority Reshuffle Service for ${request.tasks.length} tasks`,
			);
			this.logger.debug(
				`AI Priority Reshuffle Request: ${JSON.stringify(request, null, 2)}`,
			);

			const response =
				await this.httpClient.post<AiPriorityResponseDto>(
					'/sprintplanning/priority/reshuffle',
					request,
					{
						headers: {
							'X-API-Key':
								aiConfig.vantumAi.apiKey ||
								'vantumutumutumu',
						},
					},
				);

			this.logger.log(
				`Received reshuffled priorities for ${response.data.tasks.length} tasks`,
			);
			return response.data;
		} catch (error: any) {
			this.logger.error(
				'Failed to call AI Priority Reshuffle Service',
				error?.message,
			);
			if (error?.response?.data) {
				this.logger.error(
					`API Response: ${JSON.stringify(error.response.data)}`,
				);
			}
			return { tasks: [] };
		}
	}

	/**
	 * Map AI priority number (1-5) to Prisma Priority enum
	 * 5 → PRIORITY (Critical/Urgent)
	 * 4 → HIGH (High/Important)
	 * 3 → MEDIUM (Medium/Standard)
	 * 2 → LOW (Low/Nice-to-have)
	 * 1 → LOW (Backlog/Future)
	 */
	mapPriorityNumberToEnum(priorityNumber: number): Priority {
		switch (priorityNumber) {
			case 4:
				return Priority.PRIORITY;
			case 3:
				return Priority.HIGH;
			case 2:
				return Priority.MEDIUM;
			case 1:
				return Priority.LOW;
			default:
				this.logger.warn(
					`Invalid priority number: ${priorityNumber}, defaulting to MEDIUM`,
				);
				return Priority.MEDIUM;
		}
	}

	/**
	 * Map Prisma Priority enum to AI priority number (1-5)
	 */
	mapPriorityEnumToNumber(priority: Priority): number {
		switch (priority) {
			case Priority.PRIORITY:
				return 5;
			case Priority.HIGH:
				return 4;
			case Priority.MEDIUM:
				return 3;
			case Priority.LOW:
				return 2;
			default:
				return 3;
		}
	}
}
