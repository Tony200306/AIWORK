import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBulkStatuses,
  UpdateBulkStatusesInput,
} from "@/services/task/updateBulkStatuses";
import { toast } from "sonner";

interface Props {
  brainDumpId?: string;
}

export const useUpdateBulkStatuses = ({ brainDumpId }: Props = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBulkStatusesInput) => updateBulkStatuses(data),
    onSuccess: (data, variables) => {
      // After successful update, update tasks status in cache
      if (brainDumpId) {
        const queryKey = ["task-list-braindump", { brainDumpId }] as const;

        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data?.tasks) return old;

          // Create a map of task IDs to their new status
          const statusMap = new Map(
            variables.tasks?.map((t) => [t.taskId, t.status])
          );

          return {
            ...old,
            data: {
              ...old.data,
              // Update task statuses (BACKLOG tasks will be filtered by groupTasksByPriority)
              tasks: old.data.tasks?.map((task: any) => {
                const newStatus = statusMap.get(task.id);
                if (newStatus) {
                  return {
                    ...task,
                    status: newStatus,
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
      toast.error(err.message || "Failed to update task statuses");
    },
  });
};
