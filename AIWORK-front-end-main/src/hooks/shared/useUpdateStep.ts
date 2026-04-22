import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import { StepResponseData } from "@/services/task/createStep";
import { updateStep, UpdateStepInput } from "@/services/task/updateStep";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  setIsEditing: (value: boolean) => void;
  brainDumpId?: string;
}
export function useUpdateStep({ setIsEditing, brainDumpId }: Props) {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseDetailSuccess<StepResponseData>,
    Error,
    UpdateStepInput
  >({
    mutationFn: updateStep,
    onMutate: async (updatedStep) => {
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
          ["task-list-braindump", { brainDumpId }],
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
