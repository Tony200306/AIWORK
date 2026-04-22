import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { AiPriorityService } from '@shared/services/ai-priority.service';
import { Priority } from '@prisma/client';

@Injectable()
export class TaskPriorityService {
	private readonly logger = new Logger(TaskPriorityService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly aiPriorityService: AiPriorityService,
	) {}

	/**
	 * Calculate and update priorities for tasks by IDs
	 * Used after braindump processing creates new tasks
	 */
	async calculateAndUpdatePrioritiesByTaskIds(
		userId: string | null,
		taskIds: string[],
	): Promise<void> {
		if (taskIds.length === 0) {
			this.logger.warn(
				'No task IDs provided for priority calculation',
			);
			return;
		}

		const tasks = await this.prisma.task.findMany({
			where: { id: { in: taskIds } },
			select: {
				id: true,
				title: true,
				description: true,
				expectedTimeHours: true,
				priority: true,
			},
		});

		if (tasks.length === 0) {
			this.logger.warn(
				'No tasks found for priority calculation',
			);
			return;
		}

		await this.calculateAndUpdatePrioritiesInternal(
			userId,
			tasks,
		);
	}

	/**
	 * Reshuffle priorities for all tasks in a braindump
	 * Called via POST /braindump/:id/reshuffle-priorities
	 */
	async reshufflePrioritiesByBraindumpId(
		braindumpId: string,
		userId: string,
	): Promise<{ updatedCount: number }> {
		this.logger.log(
			`Reshuffling priorities for braindump: ${braindumpId}`,
		);

		// Get all tasks linked to this braindump
		const brainDumpTasks =
			await this.prisma.brainDumpTask.findMany({
				where: { brainDumpId: braindumpId },
				include: {
					task: {
						select: {
							id: true,
							title: true,
							description: true,
							expectedTimeHours: true,
							priority: true,
							userId: true,
						},
					},
				},
			});

		if (brainDumpTasks.length === 0) {
			this.logger.warn(
				`No tasks found for braindump: ${braindumpId}`,
			);
			return { updatedCount: 0 };
		}

		// Filter tasks belonging to user and extract task data
		const tasks = brainDumpTasks
			.filter((bt) => bt.task.userId === userId)
			.map((bt) => ({
				id: bt.task.id,
				title: bt.task.title,
				description: bt.task.description,
				expectedTimeHours:
					bt.task.expectedTimeHours,
				priority: bt.task.priority,
			}));

		if (tasks.length === 0) {
			this.logger.warn(
				`No tasks belong to user ${userId} in braindump: ${braindumpId}`,
			);
			return { updatedCount: 0 };
		}

		const updatedCount =
			await this.reshufflePrioritiesInternal(
				userId,
				tasks,
			);
		return { updatedCount };
	}

	/**
	 * Internal method to calculate and update priorities (for new tasks)
	 * Uses /sprintplanning/priority endpoint
	 */
	private async calculateAndUpdatePrioritiesInternal(
		userId: string | null,
		tasks: Array<{
			id: string;
			title: string;
			description: string | null;
			expectedTimeHours: number | null;
			priority: Priority;
		}>,
	): Promise<number> {
		const aiRequest = await this.buildAiRequest(userId, tasks);

		this.logger.log(`AI Request tasks: ${JSON.stringify(aiRequest.tasks)}`);

		const aiResponse = await this.aiPriorityService.calculatePriorities(aiRequest);

		return this.updateTaskPriorities(aiResponse);
	}

	/**
	 * Internal method to reshuffle priorities (for existing tasks)
	 * Uses /sprintplanning/priority/reshuffle endpoint
	 */
	private async reshufflePrioritiesInternal(
		userId: string,
		tasks: Array<{
			id: string;
			title: string;
			description: string | null;
			expectedTimeHours: number | null;
			priority: Priority;
		}>,
	): Promise<number> {
		const aiRequest = await this.buildAiRequest(userId, tasks);

		this.logger.log(`AI Reshuffle Request tasks: ${JSON.stringify(aiRequest.tasks)}`);

		const aiResponse = await this.aiPriorityService.reshufflePriorities(aiRequest);

		return this.updateTaskPriorities(aiResponse);
	}

	/**
	 * Build AI request with user profile and tasks
	 */
	private async buildAiRequest(
		userId: string | null,
		tasks: Array<{
			id: string;
			title: string;
			description: string | null;
			expectedTimeHours: number | null;
			priority: Priority;
		}>,
	): Promise<any> {
		let userProfileData: any = undefined;

		// Only fetch user profile if userId is provided
		if (userId) {
			// Fetch user profile with job and projects
			const user = await this.prisma.user.findUnique({
				where: { id: userId },
				include: {
					userProfile: {
						include: {
							job: true,
							projects: true,
						},
					},
				},
			});

			const userProfile = user?.userProfile;
			const job = userProfile?.job;
			const projects = userProfile?.projects || [];

			// Build user_profile only if profile data exists
			const hasValidProfile = user && userProfile && job;
			userProfileData = hasValidProfile
				? {
						user_id: user.id,
						name: user.name,
						dob: userProfile.dob?.toISOString().split('T')[0],
						gender: userProfile.gender,
						job: {
							title: job.title,
							seniority_level: job.seniorityLevel?.toLowerCase() as any,
							job_description: job.jobDescription || undefined,
						},
						projects: projects.map((project) => ({
							id: project.id,
							name: project.name,
							description: undefined,
							role_in_project: project.roleInProject || undefined,
						})),
					}
				: undefined;
		}

		const aiRequest: any = {
			tasks: tasks.map((task) => ({
				id: task.id,
				text: `${task.title}\n${task.description || ''}`,
				est_time: task.expectedTimeHours || 0,
				is_star: task.priority === Priority.PRIORITY,
			})),
		};

		if (userProfileData) {
			aiRequest.user_profile = userProfileData;
		}

		return aiRequest;
	}

	/**
	 * Update task priorities in database from AI response
	 */
	private async updateTaskPriorities(aiResponse: { tasks: any[] }): Promise<number> {
		try {
			if (!aiResponse.tasks || aiResponse.tasks.length === 0) {
				this.logger.warn('AI Priority Service returned no results');
				return 0;
			}

			this.logger.log(`AI Response tasks: ${JSON.stringify(aiResponse.tasks)}`);

			const updatePromises = aiResponse.tasks.map(async (aiTask) => {
				const priorityEnum = this.aiPriorityService.mapPriorityNumberToEnum(aiTask.priority);

				return this.prisma.task.update({
					where: { id: aiTask.id },
					data: {
						priority: priorityEnum,
						extraProp: {
							priority_reasoning: aiTask.priority_reasoning,
							ai_priority_number: aiTask.priority,
						},
					},
				});
			});

			await Promise.all(updatePromises);

			this.logger.log(`Successfully updated priorities for ${aiResponse.tasks.length} tasks`);
			return aiResponse.tasks.length;
		} catch (error) {
			this.logger.error('Failed to update task priorities', error);
			return 0;
		}
	}
}
