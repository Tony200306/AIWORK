import { PrismaClient, SprintLane, Priority } from '@prisma/client';

const prisma = new PrismaClient();

// SprintLane matches Priority values: LOW, MEDIUM, HIGH, PRIORITY
const priorityToLane: Record<Priority, SprintLane> = {
	LOWEST: SprintLane.LOW,
	LOW: SprintLane.LOW,
	MEDIUM: SprintLane.MEDIUM,
	HIGH: SprintLane.HIGH,
	HIGHEST: SprintLane.HIGH,
	PRIORITY: SprintLane.PRIORITY,
};

async function main() {
	// Get the sprint ID from command line or use the one provided
	const sprintId = process.argv[2] || '86427e7b-0dcb-4262-9c83-fe1b69d13951';

	// Find the sprint
	const sprint = await prisma.sprint.findUnique({
		where: { id: sprintId },
	});

	if (!sprint) {
		console.error(`Sprint ${sprintId} not found`);
		process.exit(1);
	}

	const userId = sprint.userId;
	console.log(`Seeding data for sprint: ${sprint.title} (${sprintId})`);
	console.log(`User ID: ${userId}`);

	// Get existing tasks for this user
	const existingTasks = await prisma.task.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' },
	});

	console.log(`Found ${existingTasks.length} existing tasks for user`);

	// Check which tasks are already in this sprint
	const existingSprintItems = await prisma.sprintItem.findMany({
		where: { sprintId },
		select: { taskId: true },
	});
	const tasksInSprint = new Set(existingSprintItems.map((item) => item.taskId));

	// Filter tasks not yet in sprint
	const tasksToAdd = existingTasks.filter((task) => !tasksInSprint.has(task.id));
	console.log(`${tasksToAdd.length} tasks not yet in sprint`);

	// Create sprint items for tasks not in sprint
	let rank = 1000;
	const sprintItems = [];

	for (const task of tasksToAdd) {
		const lane = priorityToLane[task.priority] || SprintLane.LOW;
		const plannedMinutes = task.expectedTimeHours ? Math.round(task.expectedTimeHours * 60) : 60;

		const item = await prisma.sprintItem.create({
			data: {
				sprintId,
				taskId: task.id,
				lane,
				rank,
				plannedMinutes,
			},
		});
		sprintItems.push(item);
		rank += 1000;
	}

	console.log(`Created ${sprintItems.length} sprint items from existing tasks`);

	// Create block templates (recurring events)
	const templates = await Promise.all([
		prisma.blockTemplate.create({
			data: {
				userId,
				title: 'Morning Focus Block',
				description: 'Deep work time - no meetings',
				type: 'FOCUS',
				startTime: '09:00',
				endTime: '12:00',
				timezone: 'America/New_York',
				daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
				recurrenceType: 'WEEKLY',
				isActive: true,
			},
		}),
		prisma.blockTemplate.create({
			data: {
				userId,
				title: 'Daily Standup',
				description: 'Team sync meeting',
				type: 'MEETING',
				startTime: '10:00',
				endTime: '10:30',
				timezone: 'America/New_York',
				daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
				recurrenceType: 'WEEKLY',
				isActive: true,
			},
		}),
		prisma.blockTemplate.create({
			data: {
				userId,
				title: 'Lunch Break',
				description: 'Take a break!',
				type: 'BREAK',
				startTime: '12:00',
				endTime: '13:00',
				timezone: 'America/New_York',
				daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
				recurrenceType: 'WEEKLY',
				isActive: true,
			},
		}),
		prisma.blockTemplate.create({
			data: {
				userId,
				title: 'Afternoon Service Block',
				description: 'Handle meetings and interruptions',
				type: 'SERVICE',
				startTime: '14:00',
				endTime: '17:00',
				timezone: 'America/New_York',
				daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
				recurrenceType: 'WEEKLY',
				isActive: true,
			},
		}),
	]);

	console.log(`Created ${templates.length} block templates`);

	// Generate block instances for the sprint date range
	const startDate = new Date(sprint.startDate);
	const endDate = new Date(sprint.endDate);
	let instanceCount = 0;

	for (const template of templates) {
		const currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			const dayOfWeek = currentDate.getDay();

			if (template.daysOfWeek.includes(dayOfWeek)) {
				const [startHour, startMinute] = template.startTime.split(':').map(Number);
				const [endHour, endMinute] = template.endTime.split(':').map(Number);

				const startAt = new Date(currentDate);
				startAt.setHours(startHour, startMinute, 0, 0);

				const endAt = new Date(currentDate);
				endAt.setHours(endHour, endMinute, 0, 0);

				const durationMinutes = Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60));

				// Create BlockInstance
				const instance = await prisma.blockInstance.create({
					data: {
						templateId: template.id,
						userId,
						date: new Date(currentDate),
						startAt,
						endAt,
						durationMinutes,
						status: 'SCHEDULED',
						title: template.title,
						description: template.description,
					},
				});

				// Create linked ScheduleEvent
				await prisma.scheduleEvent.create({
					data: {
						userId,
						source: 'BLOCK_TEMPLATE',
						externalProvider: 'INTERNAL',
						title: template.title,
						description: template.description,
						startAt,
						endAt,
						timezone: template.timezone,
						isAllDay: false,
						status: 'CONFIRMED',
						blockInstanceId: instance.id,
					},
				});

				instanceCount++;
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}
	}

	console.log(`Created ${instanceCount} block instances and schedule events`);

	// Create some manual schedule events
	const manualEvents = await Promise.all([
		prisma.scheduleEvent.create({
			data: {
				userId,
				source: 'MANUAL',
				externalProvider: 'INTERNAL',
				title: '1:1 with Manager',
				description: 'Weekly check-in',
				startAt: new Date(`${startDate.toISOString().split('T')[0]}T15:00:00`),
				endAt: new Date(`${startDate.toISOString().split('T')[0]}T15:30:00`),
				timezone: 'America/New_York',
				isAllDay: false,
				status: 'CONFIRMED',
			},
		}),
		prisma.scheduleEvent.create({
			data: {
				userId,
				source: 'MANUAL',
				externalProvider: 'INTERNAL',
				title: 'Sprint Planning',
				description: 'Plan next sprint tasks',
				startAt: new Date(`${endDate.toISOString().split('T')[0]}T14:00:00`),
				endAt: new Date(`${endDate.toISOString().split('T')[0]}T15:00:00`),
				timezone: 'America/New_York',
				isAllDay: false,
				status: 'CONFIRMED',
			},
		}),
	]);

	console.log(`Created ${manualEvents.length} manual schedule events`);

	// Create StepRuns with schedule events for some tasks
	let stepRunCount = 0;
	const tasksWithSteps = await prisma.task.findMany({
		where: {
			userId,
			steps: {
				some: {},
			},
		},
		include: {
			steps: {
				orderBy: { orderIndex: 'asc' },
				take: 3, // Get up to 3 steps per task
			},
		},
		take: 3, // Process up to 3 tasks
	});

	console.log(`Found ${tasksWithSteps.length} tasks with steps`);

	for (const task of tasksWithSteps) {
		// Create a TaskRun for this task
		const taskRun = await prisma.taskRun.create({
			data: {
				userId,
				taskId: task.id,
				status: 'TODO',
				startedFrom: 'TODO',
			},
		});

		// Schedule the first 2 steps of this task
		const stepsToSchedule = task.steps.slice(0, 2);
		let currentDate = new Date(startDate);
		currentDate.setDate(currentDate.getDate() + stepRunCount); // Spread steps across different days

		for (const step of stepsToSchedule) {
			// Schedule step at 13:00 (after lunch) for 60 minutes
			const stepStartAt = new Date(currentDate);
			stepStartAt.setHours(13, 0, 0, 0);

			const stepDurationMinutes = step.userEstMinutes || step.sysEstMinutes || 60;
			const stepEndAt = new Date(stepStartAt.getTime() + stepDurationMinutes * 60 * 1000);

			// Create StepRun
			const stepRun = await prisma.stepRun.create({
				data: {
					taskRunId: taskRun.id,
					stepId: step.id,
					status: 'TODO',
					scheduledAt: stepStartAt,
				},
			});

			// Create linked ScheduleEvent
			await prisma.scheduleEvent.create({
				data: {
					userId,
					source: 'STEP_SESSION',
					externalProvider: 'INTERNAL',
					title: step.title,
					description: step.description,
					startAt: stepStartAt,
					endAt: stepEndAt,
					timezone: 'America/New_York',
					isAllDay: false,
					status: 'CONFIRMED',
					stepRunId: stepRun.id,
				},
			});

			stepRunCount++;
			currentDate.setDate(currentDate.getDate() + 1); // Next step on next day
		}
	}

	console.log(`Created ${stepRunCount} step runs with schedule events`);

	console.log('\n--- Seed Complete ---');
	console.log(`Sprint: ${sprint.title}`);
	console.log(`Existing Tasks Found: ${existingTasks.length}`);
	console.log(`Sprint Items Created: ${sprintItems.length}`);
	console.log(`Templates Created: ${templates.length}`);
	console.log(`Block Instances Created: ${instanceCount}`);
	console.log(`Manual Events Created: ${manualEvents.length}`);
	console.log(`Step Runs Created: ${stepRunCount}`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
