import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBulkTasks,
  UpdateBulkTasksInput,
} from "@/services/task/updateBulkTasks";
import { toast } from "sonner";

interface Props {
  brainDumpId?: string;
}

export const useUpdateBulkTasks = ({ brainDumpId }: Props = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBulkTasksInput) => updateBulkTasks(data),
    onSuccess: (data, variables) => {
      if (brainDumpId) {
        const queryKey = ["task-list-braindump", { brainDumpId }] as const;

        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data?.tasks) return old;

          const updateMap = new Map(
            variables.tasks?.map((t) => [t.taskId, t])
          );

          return {
            ...old,
            data: {
              ...old.data,
              tasks: old.data.tasks?.map((task: any) => {
                const update = updateMap.get(task.id);
                if (update) {
                  return {
                    ...task,
                    ...(update.status !== undefined && { status: update.status }),
                    ...(update.rank !== undefined && { rank: update.rank }),
                    ...(update.priority !== undefined && { priority: update.priority }),
                    ...(update.taskType !== undefined && { taskType: update.taskType }),
                    ...(update.pinned !== undefined && { pinned: update.pinned }),
                  };
                }
                return task;
              }),
            },
          };
        });
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update tasks");
    },
  });
};
