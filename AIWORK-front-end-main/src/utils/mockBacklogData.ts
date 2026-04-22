import { v4 as uuidv4 } from "uuid";
import { Priority, Task, TaskStatus, TaskType, Step, Tag } from "@/models/Task";

/**
 * Generates mock backlog tasks for development/testing
 */
export function generateMockBacklogData(): Task[] {
  const now = new Date().toISOString();

  const mockTags: Tag[] = [
    { id: uuidv4(), name: "Frontend", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Backend", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "DevOps", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Design", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Bug", createdAt: now, updatedAt: now },
    { id: uuidv4(), name: "Feature", createdAt: now, updatedAt: now },
  ];

  const mockSteps: Step[] = [
    {
      id: uuidv4(),
      taskId: "",
      title: "Research requirements",
      description: "Understand the requirements",
      sysEstMinutes: 30,
      userEstMinutes: 30,
      expectedTimeHours: 0.5,
      difficulty: 2,
      isDone: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      taskId: "",
      title: "Create design mockups",
      description: "Design the UI components",
      sysEstMinutes: 60,
      userEstMinutes: 90,
      expectedTimeHours: 1.5,
      difficulty: 3,
      isDone: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      taskId: "",
      title: "Implement core functionality",
      description: "Write the main logic",
      sysEstMinutes: 120,
      userEstMinutes: 180,
      expectedTimeHours: 3,
      difficulty: 4,
      isDone: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      taskId: "",
      title: "Write tests",
      description: "Add unit and integration tests",
      sysEstMinutes: 60,
      userEstMinutes: 60,
      expectedTimeHours: 1,
      difficulty: 2,
      isDone: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      taskId: "",
      title: "Code review and deploy",
      description: "Review with team and deploy",
      sysEstMinutes: 30,
      userEstMinutes: 30,
      expectedTimeHours: 0.5,
      difficulty: 1,
      isDone: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const createTask = (
    overrides: Partial<Task> = {}
  ): Task => ({
    id: uuidv4(),
    title: "",
    description: "",
    status: TaskStatus.TODO,
    priority: Priority.Medium,
    expectedTimeHours: 2,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });

  const backlogTasks: Task[] = [
    createTask({
      title: "Implement user authentication flow",
      description: "Add login, signup, and password reset functionality",
      status: TaskStatus.TODO,
      priority: Priority.High,
      taskType: TaskType.BACKLOG,
      expectedTimeHours: 4,
      steps: mockSteps?.map((s) => ({ ...s, taskId: "1" })),
      tags: [mockTags[0], mockTags[5]],
    }),
    createTask({
      title: "Design dashboard components",
      description: "Create reusable dashboard UI components",
      status: TaskStatus.TODO,
      priority: Priority.Medium,
      taskType: TaskType.BACKLOG,
      expectedTimeHours: 6,
      steps: mockSteps.slice(0, 3)?.map((s) => ({ ...s, taskId: "2" })),
      tags: [mockTags[3], mockTags[5]],
    }),
    createTask({
      title: "Optimize database queries",
      description: "Improve query performance for large datasets",
      status: TaskStatus.TODO,
      priority: Priority.Highest,
      taskType: TaskType.BACKLOG,
      expectedTimeHours: 8,
      steps: mockSteps.slice(1, 4)?.map((s) => ({ ...s, taskId: "3" })),
      tags: [mockTags[1]],
    }),
    createTask({
      title: "Fix mobile responsive issues",
      description: "Resolve layout problems on mobile devices",
      status: TaskStatus.DOING,
      priority: Priority.High,
      taskType: TaskType.BACKLOG,
      expectedTimeHours: 3,
      steps: [mockSteps[0], mockSteps[2]]?.map((s) => ({ ...s, taskId: "4", isDone: true })),
      tags: [mockTags[0], mockTags[4]],
    }),
    createTask({
      title: "Add unit tests for API endpoints",
      description: "Increase test coverage for backend services",
      status: TaskStatus.TODO,
      priority: Priority.Low,
      taskType: TaskType.BACKLOG,
      expectedTimeHours: 5,
      steps: mockSteps.slice(2, 5)?.map((s) => ({ ...s, taskId: "5" })),
      tags: [mockTags[1]],
    }),
    createTask({
      title: "Implement real-time notifications",
      description: "Add WebSocket-based notification system",
      status: TaskStatus.TODO,
      priority: Priority.Medium,
      taskType: TaskType.BACKLOG,
      expectedTimeHours: 10,
      steps: mockSteps?.map((s) => ({ ...s, taskId: "6" })),
      tags: [mockTags[0], mockTags[1], mockTags[5]],
    }),
    createTask({
      title: "Update documentation",
      description: "Document new API endpoints and components",
      status: TaskStatus.TODO,
      priority: Priority.Lowest,
      taskType: TaskType.BACKLOG,
      expectedTimeHours: 2,
      steps: [mockSteps[0]]?.map((s) => ({ ...s, taskId: "7" })),
      tags: [],
    }),
  ];

  const activeTasks: Task[] = [
    createTask({
      title: "Complete sprint retrospective",
      description: "Analyze sprint performance and improvements",
      status: TaskStatus.DOING,
      priority: Priority.High,
      taskType: TaskType.ACTIVE,
      expectedTimeHours: 2,
      steps: mockSteps.slice(0, 2)?.map((s) => ({ ...s, taskId: "8" })),
      tags: [mockTags[2]],
    }),
    createTask({
      title: "Deploy staging environment",
      description: "Set up staging server for testing",
      status: TaskStatus.TODO,
      priority: Priority.Highest,
      taskType: TaskType.ACTIVE,
      expectedTimeHours: 4,
      steps: mockSteps.slice(1, 4)?.map((s) => ({ ...s, taskId: "9" })),
      tags: [mockTags[2], mockTags[1]],
    }),
    createTask({
      title: "Refactor state management",
      description: "Migrate to new state management solution",
      status: TaskStatus.DOING,
      priority: Priority.Medium,
      taskType: TaskType.ACTIVE,
      expectedTimeHours: 6,
      steps: [mockSteps[0], mockSteps[1]]?.map((s) => ({ ...s, taskId: "10", isDone: true })),
      tags: [mockTags[0]],
    }),
  ];

  const stagingTasks: Task[] = [
    createTask({
      title: "Plan next sprint backlog",
      description: "Select and prioritize tasks for next sprint",
      status: TaskStatus.TODO,
      priority: Priority.High,
      taskType: TaskType.STAGING,
      expectedTimeHours: 3,
      steps: mockSteps.slice(0, 3)?.map((s) => ({ ...s, taskId: "11" })),
      tags: [mockTags[2]],
    }),
    createTask({
      title: "Review technical architecture",
      description: "Evaluate current architecture and propose improvements",
      status: TaskStatus.TODO,
      priority: Priority.Medium,
      taskType: TaskType.STAGING,
      expectedTimeHours: 5,
      steps: mockSteps.slice(2, 5)?.map((s) => ({ ...s, taskId: "12" })),
      tags: [mockTags[1]],
    }),
    createTask({
      title: "Estimate feature complexity",
      description: "Provide time estimates for upcoming features",
      status: TaskStatus.TODO,
      priority: Priority.Low,
      taskType: TaskType.STAGING,
      expectedTimeHours: 2,
      steps: [mockSteps[0]]?.map((s) => ({ ...s, taskId: "13" })),
      tags: [],
    }),
  ];

  return [...backlogTasks, ...activeTasks, ...stagingTasks];
}

/**
 * Generates mock tasks grouped by type
 */
export function generateMockGroupedTasks() {
  const allTasks = generateMockBacklogData();

  return {
    [TaskType.BACKLOG]: allTasks?.filter((t) => t.taskType === TaskType.BACKLOG),
    [TaskType.ACTIVE]: allTasks?.filter((t) => t.taskType === TaskType.ACTIVE),
    [TaskType.STAGING]: allTasks?.filter((t) => t.taskType === TaskType.STAGING),
  };
}

/**
 * Generates a single mock task
 */
export function generateMockTask(overrides: Partial<Task> = {}): Task {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    title: "Sample Task",
    description: "This is a sample task description",
    status: TaskStatus.TODO,
    priority: Priority.Medium,
    taskType: TaskType.BACKLOG,
    expectedTimeHours: 2,
    createdAt: now,
    updatedAt: now,
    steps: [],
    tags: [],
    ...overrides,
  };
}
