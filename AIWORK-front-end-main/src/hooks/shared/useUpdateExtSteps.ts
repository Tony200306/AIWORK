import { ResponseListSuccess } from "@/services/_shared/types/ServiceResponse";
import { StepsResponseData } from "@/services/task/updateExtSteps";
import { updateExtSteps, UpdateExtStepsInput } from "@/services/task/updateExtSteps";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  brainDumpId?: string;
}

export function useUpdateExtSteps({ brainDumpId }: Props) {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseListSuccess<StepsResponseData>,
    Error,
    UpdateExtStepsInput
  >({
    mutationFn: updateExtSteps,
    onMutate: async (updatedSteps) => {
      console.log("Updating steps:", updatedSteps);

      // Cancel query cho ext brain dump
      if (brainDumpId) {
        await queryClient.cancelQueries({
          queryKey: ["ext-braindump-tasks", { brainDumpId }],
        });
      }

      const previousBrainDumpData = brainDumpId
        ? queryClient.getQueryData(["ext-braindump-tasks", { brainDumpId }])
        : null;

      // Update cache với nested structure
      if (brainDumpId) {
        queryClient.setQueryData(
          ["ext-braindump-tasks", { brainDumpId }],
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
          ["ext-braindump-tasks", { brainDumpId }],
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
