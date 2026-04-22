import { SprintItem } from "@/models/Sprint";
import { Task } from "../models/Task";
export type StatusGroup = Record<string, SprintItem[]>;
export function groupTasksByStatus(tasks: SprintItem[]): StatusGroup {
  const initialGroups: StatusGroup = {
    TODO: [],
    DOING: [],
    DONE: [],
  };

  return tasks?.reduce((groups, task) => {
    const status = task.task.status || "TODO";

    // Nếu key chưa tồn tại thì tạo mảng rỗng
    if (!groups[status]) {
      groups[status] = [];
    }

    // Push task vào nhóm tương ứng
    groups[status].push(task);

    return groups;
  }, initialGroups);
}
