import { Task, TaskStatus, TaskType, Priority } from "~/models/Task";
import {
  ResponseFailure,
  ResponseListSuccess,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus[];
  taskType?: TaskType;
  priority?: Priority[];
  tagIds?: string[];
  search?: string;
  sortBy?: "createdAt" | "dueAt" | "priority" | "expectedTimeHours" | "title" | "rank" | "status";
  sortOrder?: "asc" | "desc";
}

export const getTasks = async (
  params?: GetTasksParams
): Promise<ResponseListSuccess<Task>> => {
  const queryParams: Record<string, any> = { ...params };

  // Convert arrays to comma-separated strings for the API
  if (queryParams.priority?.length) {
    queryParams.priority = queryParams.priority.join(",");
  }
  if (queryParams.status?.length) {
    queryParams.status = queryParams.status.join(",");
  }
  if (queryParams.tagIds?.length) {
    queryParams.tagIds = queryParams.tagIds.join(",");
  }

  const response = await fetchApi.request<
    ResponseListSuccess<Task> | ResponseFailure
  >({
    url: `/tasks`,
    method: "GET",
    params: queryParams,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseListSuccess<Task>;
};
