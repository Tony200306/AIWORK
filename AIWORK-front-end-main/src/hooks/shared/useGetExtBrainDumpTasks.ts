import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  getExtBrainDumpTasks,
  GetExtBrainDumpTasksParams,
  ExtBrainDumpTasksData,
} from "@/services/braindump/getExtBrainDumpTasks";
import { useQuery } from "@tanstack/react-query";

export const useGetExtBrainDumpTasks = (
  params: GetExtBrainDumpTasksParams,
  options?: {
    disablePolling?: boolean;
  }
) => {
  return useQuery<ResponseDetailSuccess<ExtBrainDumpTasksData>>({
    queryKey: ["ext-braindump-tasks", params],
    queryFn: () => getExtBrainDumpTasks(params),
    staleTime: 5 * 60 * 1000,
    refetchInterval: (data) => {
      // Don't poll if explicitly disabled
      if (options?.disablePolling) {
        return false;
      }

      // Poll every 5 seconds if tasks are still processing
      const isNotCompleted = data?.data?.status !== "COMPLETED";
      const hasNoTasks = !data?.data?.tasks || data.data.tasks.length === 0;
      return isNotCompleted && hasNoTasks ? 5000 : false;
    },
  });
};
