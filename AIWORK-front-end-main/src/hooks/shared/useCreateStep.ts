import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  createStep,
  CreateStepInput,
  StepResponseData,
} from "@/services/task/createStep";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface Props {
  setIsAdding: (value: boolean) => void;
  brainDumpId?: string;
}

export function useCreateStep({ setIsAdding, brainDumpId }: Props) {
  const queryClient = useQueryClient();
  return useMutation<
    ResponseDetailSuccess<StepResponseData>,
    Error,
    CreateStepInput
  >({
    mutationFn: createStep,
    onMutate: async (newStep) => {
      // Cancel query for brain dump
      if (brainDumpId) {
        await queryClient.cancelQueries({
          queryKey: ["task-list-braindump", { brainDumpId }],
        });
      }

      const previousBrainDumpData = brainDumpId
        ? queryClient.getQueryData(["task-list-braindump", { brainDumpId }])
        : null;

      // Optimistically add the new step to cache
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
                  task.id === newStep.taskId
                    ? {
                      ...task,
                      steps: [
                        ...(task.steps || []),
                        {
                          id: uuidv4(), // Temporary ID
                          taskId: newStep.taskId,
                          title: newStep.title,
                          description: newStep.description,
                          orderIndex: newStep.orderIndex,
                          userEstMinutes: newStep.userEstMinutes,
                          sysEstMinutes: null,
                          isDone: false,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        },
                      ],
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
    onError: (err, newStep, context: any) => {
      // Rollback on error
      if (brainDumpId && context?.previousBrainDumpData) {
        queryClient.setQueryData(
          ["task-list-braindump", { brainDumpId }],
          context.previousBrainDumpData
        );
      }
      toast.error("Failed to create step");
    },
    onSuccess: (data) => {
      // Invalidate to get the real data from server
      if (brainDumpId) {
        queryClient.invalidateQueries({
          queryKey: ["task-list-braindump", { brainDumpId }],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["task-list"] });
      setIsAdding(false);
    },
  });
}
