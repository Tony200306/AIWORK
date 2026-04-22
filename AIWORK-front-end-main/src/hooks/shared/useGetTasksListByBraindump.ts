import { ResponseDetailSuccess } from "@/services/_shared/types/ServiceResponse";
import {
  getTasksByBrainDump,
  GetTasksByBrainDumpParams,
  BrainDumpTasksData,
} from "@/services/task/getTasksByBrainDump";
import { useQuery } from "@tanstack/react-query";

export const useGetTasksListByBraindump = (
  params: GetTasksByBrainDumpParams,
  options?: {
    disablePolling?: boolean;
  }
) => {
  return useQuery<ResponseDetailSuccess<BrainDumpTasksData>>({
    queryKey: ["task-list-braindump", params],
    queryFn: () => getTasksByBrainDump(params),
    staleTime: 5 * 60 * 1000,
    refetchInterval: (data) => {
      // Don't poll if explicitly disabled
      if (options?.disablePolling) {
        return false;
      }

      const isNotCompleted = data?.data?.status !== "COMPLETED";
      const hasNoTasks = !data?.data?.tasks || data.data.tasks.length === 0;
      return isNotCompleted && hasNoTasks ? 5000 : false;
    },
  });
};