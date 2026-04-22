import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateExtBulkPriorities,
  UpdateExtBulkPrioritiesInput,
} from "@/services/task/updateExtBulkPriorities";
import { toast } from "sonner";
import { useMemo } from "react";

interface Props {
  brainDumpId?: string;
}

export const useUpdateExtBulkPriorities = ({ brainDumpId }: Props = {}) => {
  const queryClient = useQueryClient();

  // Sử dụng useMemo để giữ reference cố định cho params
  const queryKey = useMemo(
    () => (brainDumpId ? ["ext-braindump-tasks", { brainDumpId }] as const : null),
    [brainDumpId]
  );

  return useMutation({
    mutationFn: (data: UpdateExtBulkPrioritiesInput) => updateExtBulkPriorities(data),
    onMutate: async (updatedPriorities) => {
      console.log("Updating task priorities:", updatedPriorities);

      if (!queryKey) return {};

      // Cancel outgoing queries for ext-braindump-tasks
      await queryClient.cancelQueries({
        queryKey,
      });

      // Snapshot the previous value
      const previousTaskListData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data?.tasks) return old;

        // Create a map for quick priority lookup
        const priorityMap = new Map(
          updatedPriorities.tasks?.map((t) => [t.taskId, t.priority])
        );

        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks?.map((task: any) => {
              const newPriority = priorityMap.get(task.id);
              if (newPriority) {
                return {
                  ...task,
                  priority: newPriority,
                  priorityLevel: newPriority,
                };
              }
              return task;
            }),
          },
        };
      });

      return { previousTaskListData };
    },
    onError: (err: Error, _updatedPriorities, context: any) => {
      // Rollback to previous data on error
      if (queryKey && context?.previousTaskListData) {
        queryClient.setQueryData(queryKey, context.previousTaskListData);
      }
      toast.error(err.message || "Failed to update task priorities");
    },
    onSuccess: (data) => {
      // BỎ invalidateQueries để tránh refetch gây nhảy chữ
    },
  });
};
