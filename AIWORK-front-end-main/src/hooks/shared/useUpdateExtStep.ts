import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import { updateExtStep, UpdateExtStepInput, ExtStepResponseData } from "@/services/task/updateExtStep";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  setIsEditing: (value: boolean) => void;
  brainDumpId?: string;
}

export function useUpdateExtStep({ setIsEditing, brainDumpId }: Props) {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseDetailSuccess<ExtStepResponseData>,
    Error,
    UpdateExtStepInput
  >({
    mutationFn: updateExtStep,
    onMutate: async (updatedStep) => {
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
                  task.id === updatedStep.taskId
                    ? {
                      ...task,
                      steps: task.steps?.map((step: any) =>
                        step.id === updatedStep.stepId
                          ? {
                            ...step,
                            title: updatedStep.title || step.title,
                            description:
                              updatedStep.description || step.description,
                            userEstMinutes:
                              updatedStep.userEstMinutes ??
                              step.userEstMinutes,
                          }
                          : step
                      ),
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
    onError: (err, updatedStep, context: any) => {
      if (brainDumpId && context?.previousBrainDumpData) {
        queryClient.setQueryData(
          ["ext-braindump-tasks", { brainDumpId }],
          context.previousBrainDumpData
        );
      }
      toast.error("Failed to update step");
    },
    onSuccess: (data) => {
      setIsEditing(false);
    },
  });
}
