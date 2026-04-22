import { Task } from "@/models/Task";
import { ResponseListSuccess } from "@/services/_shared/types/ServiceResponse";
import { getTasks, GetTasksParams } from "@/services/task/getTasks";
import { useQuery } from "@tanstack/react-query";

// Build stable query key from params - only use primitive values
const buildQueryKey = (params?: GetTasksParams) => {
  if (!params) return ["task-list"];

  return [
    "task-list",
    params.taskType,
    params.limit,
    params.search,
    params.priority?.join(","),
    params.status?.join(","),
    params.sortBy,
    params.sortOrder,
  ];
};

export const useGetTaskLists = (params?: GetTasksParams) => {
  const queryKey = buildQueryKey(params);

  return useQuery<ResponseListSuccess<Task>>({
    queryKey,
    queryFn: () => getTasks(params),
    staleTime: 0, // Always refetch when params change
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
};
