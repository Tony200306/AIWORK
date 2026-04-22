import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bulkCreateTasks,
  BulkCreateTasksInput,
  BulkCreateTasksResponse,
} from "@/services/braindump/bulkCreateTasks";
import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import { BrainDumpTasksData } from "@/services/task/getTasksByBrainDump";

interface UseBulkCreateTasksParams {
  braindumpId: string;
}

export const useBulkCreateTasks = ({ braindumpId }: UseBulkCreateTasksParams) => {
  const queryClient = useQueryClient();

  return useMutation<
    ResponseDetailSuccess<BulkCreateTasksResponse>,
    Error,
    BulkCreateTasksInput
  >({
    mutationFn: (data) => bulkCreateTasks(braindumpId, data),
    onSuccess: (response) => {
      // Optimistic update: directly update cache with the new tasks from backend
      const queryKey = ["task-list-braindump", { brainDumpId: braindumpId }];

      queryClient.setQueryData<ResponseDetailSuccess<BrainDumpTasksData>>(
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
