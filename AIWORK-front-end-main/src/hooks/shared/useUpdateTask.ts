import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  TaskResponseData
} from "@/services/task/updateTask";
import { updateTask, UpdateTaskInput } from "@/services/task/updateTask";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  onCancel: (value: string) => void;
}
export function useUpdateTask({ onCancel }: Props) {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseDetailSuccess<TaskResponseData>,
    Error,
    UpdateTaskInput
  >({
    mutationFn: updateTask,
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["task-list"] });

      const previousData = queryClient.getQueryData(["task-list"]);

      // Update cache trực tiếp
      queryClient.setQueryData(["task-list", {}], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data?.map((task: any) =>
            task.id === newTask.taskId
              ? {
                ...task,
                title: newTask.title,
                totalEstimatedMinutes: newTask.expectedTimeHours,
              }
              : task
          ),
        };
      });

      return { previousData };
    },
    onSuccess: (data) => {
      // queryClient.invalidateQueries({ queryKey: ["task-list"] });
      onCancel(null);
    },
  });
}
