import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  createExtStep,
  CreateExtStepInput,
  ExtStepResponseData,
} from "@/services/task/createExtStep";
import { ExtBrainDumpTasksData } from "@/services/braindump/getExtBrainDumpTasks";
import { Step } from "@/models/Task";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface Props {
  setIsAdding: (value: boolean) => void;
  brainDumpId?: string;
}

export function useCreateExtStep({ setIsAdding, brainDumpId }: Props) {
  const queryClient = useQueryClient();
  const queryKey = ["ext-braindump-tasks", { brainDumpId }];

  return useMutation<
    ResponseDetailSuccess<ExtStepResponseData>,
    Error,
    CreateExtStepInput,
    { previousData: ResponseDetailSuccess<ExtBrainDumpTasksData> | undefined }
  >({
    mutationFn: createExtStep,
    onMutate: async (newStep) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot current data
      const previousData = queryClient.getQueryData<ResponseDetailSuccess<ExtBrainDumpTasksData>>(queryKey);

      // Optimistically update
      if (previousData) {
        const optimisticStep: Step = {
          id: uuidv4(),
          taskId: newStep.taskId,
          title: newStep.title,
          description: newStep.description,
          orderIndex: newStep.orderIndex,
          userEstMinutes: newStep.userEstMinutes,
          isDone: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<ResponseDetailSuccess<ExtBrainDumpTasksData>>(queryKey, {
          ...previousData,
          data: {
            ...previousData.data,
            tasks: previousData.data.tasks?.map((task) =>
              task.id === newStep.taskId
                ? { ...task, steps: [...(task.steps || []), optimisticStep] }
                : task
            ),
          },
        });
      }

      setIsAdding(false);
      return { previousData };
    },
    onError: (error, _newStep, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(error.message || "Failed to create step");
    },
    onSuccess: (data) => {
    },
    onSettled: () => {
      // Always refetch to sync with server
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
