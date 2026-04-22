import { Priority, Task, TaskType } from "../models/Task";

export type PriorityGroup = Record<string, Task[]>;
export function groupTasksByPriority(tasks: Task[]): PriorityGroup {
  return tasks.reduce(
    (groups, task) => {
      // Filter out tasks with BACKLOG taskType
      if (task.taskType === TaskType.BACKLOG) {
        return groups;
      }

      // Merge LOWEST into LOW column
      const priority = task.priority === Priority.Lowest ? Priority.Low : task.priority;

      // Initialize priority group if it doesn't exist
      if (!groups[priority]) {
        groups[priority] = [];
      }

      // Push task vào nhóm tương ứng
      groups[priority].push(task);

      return groups;
    }, {} as PriorityGroup);
}
