import { ResponseListSuccess } from "@/services/_shared/types/ServiceResponse";
import { StepsResponseData } from "@/services/task/updateSteps";
import { updateSteps, UpdateStepsInput } from "@/services/task/updateSteps";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  brainDumpId?: string;
}
export function useUpdateSteps({ brainDumpId }: Props) {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseListSuccess<StepsResponseData>,
    Error,
    UpdateStepsInput
  >({
    mutationFn: updateSteps,
    onMutate: async (updatedSteps) => {
      console.log("Updating steps:", updatedSteps);

      // Cancel query cho brain dump
      if (brainDumpId) {
        await queryClient.cancelQueries({
          queryKey: ["task-list-braindump", { brainDumpId }],
        });
      }

      const previousBrainDumpData = brainDumpId
        ? queryClient.getQueryData(["task-list-braindump", { brainDumpId }])
        : null;

      // Update cache với nested structure
      if (brainDumpId) {
        queryClient.setQueryData(
          ["task-list-braindump", { brainDumpId }],
          (old: any) => {
            if (!old?.data?.tasks) return old;
            return {
              ...old,
              data: {
                ...old.data,
                tasks: old.data.tasks?.map((task: any) =>
                  task.id === updatedSteps.taskId
                    ? {
                      ...task,
                      steps: updatedSteps.steps?.map((step, index) => ({
                        ...step,
                        orderIndex: index + 1,
                      })),
                    }
                    : task
                ),
              },
            };
          }
        );
      }

      return { previousBrainDumpData };
    },
    onError: (err, updatedSteps, context: any) => {
      if (brainDumpId && context?.previousBrainDumpData) {
        queryClient.setQueryData(
          ["task-list-braindump", { brainDumpId }],
          context.previousBrainDumpData
        );
      }
      toast.error("Failed to update steps");
    },
    onSuccess: (data) => {
      // BỎ invalidateQueries để tránh refetch gây nhảy chữ
    },
  });
}
