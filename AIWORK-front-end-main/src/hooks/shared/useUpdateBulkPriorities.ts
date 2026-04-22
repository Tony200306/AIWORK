import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBulkPriorities,
  UpdateBulkPrioritiesInput,
} from "@/services/task/updateBulkPriorities";
import { toast } from "sonner";
import { GetTasksParams } from "@/services/task/getTasks";
import { useMemo } from "react";

interface Props {
  params?: GetTasksParams;
}

export const useUpdateBulkPriorities = ({ params = {} }: Props = {}) => {
  const queryClient = useQueryClient();

  // Sử dụng useMemo để giữ reference cố định cho params
  const queryKey = useMemo(() => ["task-list", params] as const, [JSON.stringify(params)]);

  return useMutation({
    mutationFn: (data: UpdateBulkPrioritiesInput) => updateBulkPriorities(data),
    onMutate: async (updatedPriorities) => {
      console.log("Updating task priorities:", updatedPriorities);

      // Cancel outgoing queries for task-list với params cụ thể
      await queryClient.cancelQueries({
        queryKey,
      });

      // Snapshot the previous value
      const previousTaskListData = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data) return old;

        // Create a map for quick priority lookup
        const priorityMap = new Map(
          updatedPriorities.tasks?.map((t) => [t.taskId, t.priority])
        );

        return {
          ...old,
          data: old.data?.map((task: any) => {
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
        };
      });

      return { previousTaskListData };
    },
    onError: (err: Error, _updatedPriorities, context: any) => {
      // Rollback to previous data on error
      if (context?.previousTaskListData) {
        queryClient.setQueryData(queryKey, context.previousTaskListData);
      }
      toast.error(err.message || "Failed to update task priorities");
    },
    onSuccess: (data) => {
      // BỎ invalidateQueries để tránh refetch gây nhảy chữ
    },
  });
};
