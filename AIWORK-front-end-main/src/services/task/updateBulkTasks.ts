import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";
import { Priority, TaskStatus, TaskType } from "@/models/Task";

export interface TaskBulkUpdate {
  taskId: string;
  status?: TaskStatus;
  rank?: number;
  priority?: Priority;
  taskType?: TaskType;
  sprintId?: string;
  pinned?: boolean;
}

export interface UpdateBulkTasksInput {
  tasks: TaskBulkUpdate[];
}

export interface UpdateBulkTasksResponse {
  success: boolean;
  updatedCount: number;
}

export const updateBulkTasks = async (data: UpdateBulkTasksInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<UpdateBulkTasksResponse> | ResponseFailure
  >({
    url: "/tasks/bulk",
    method: "PATCH",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<UpdateBulkTasksResponse>;
};
