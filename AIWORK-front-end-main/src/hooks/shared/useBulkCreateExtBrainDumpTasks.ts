import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bulkCreateExtBrainDumpTasks,
  BulkCreateExtTasksInput,
  BulkCreateExtTasksResponse,
} from "@/services/braindump/bulkCreateExtBrainDumpTasks";
import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import { ExtBrainDumpTasksData } from "@/services/braindump/getExtBrainDumpTasks";

interface UseBulkCreateExtBrainDumpTasksParams {
  braindumpId: string;
}

export const useBulkCreateExtBrainDumpTasks = ({ braindumpId }: UseBulkCreateExtBrainDumpTasksParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseDetailSuccess<BulkCreateExtTasksResponse>,
    Error,
    BulkCreateExtTasksInput
  >({
    mutationFn: (data) => bulkCreateExtBrainDumpTasks(braindumpId, data),
    onSuccess: (response) => {
      // Optimistic update: directly update cache with the new tasks from backend
      const queryKey = ["ext-braindump-tasks", { brainDumpId: braindumpId }];

      queryClient.setQueryData<ResponseDetailSuccess<ExtBrainDumpTasksData>>(
        queryKey,
        (oldData) => {
          if (!oldData) {
            // If no old data, create new structure
            return {
              statusCode: 200,
              success: true,
              message: "Success",
              data: {
                braindumpId: response.data.braindumpId,
                status: "COMPLETED",
                contextText: "",
                tasks: response.data.tasks,
              },
            };
          }

          // Update existing data with new tasks
          return {
            ...oldData,
            data: {
              ...oldData.data,
              tasks: response.data.tasks,
              status: "COMPLETED",
            },
          };
        }
      );
    },
  });
};
