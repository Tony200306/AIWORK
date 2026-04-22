import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateExtBulkStatuses,
  UpdateExtBulkStatusesInput,
} from "@/services/task/updateExtBulkStatuses";
import { toast } from "sonner";

interface Props {
  brainDumpId?: string;
}

export const useUpdateExtBulkStatuses = ({ brainDumpId }: Props = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExtBulkStatusesInput) => updateExtBulkStatuses(data),
    onSuccess: (data, variables) => {
      // After successful update, update tasks status in cache
      if (brainDumpId) {
        const queryKey = ["ext-braindump-tasks", { brainDumpId }] as const;

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
