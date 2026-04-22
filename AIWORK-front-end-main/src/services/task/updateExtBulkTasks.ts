import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";
import { Priority, TaskStatus, TaskType } from "@/models/Task";

export interface ExtTaskBulkUpdate {
  taskId: string;
  status?: TaskStatus;
  rank?: number;
  priority?: Priority;
  taskType?: TaskType;
}

export interface UpdateExtBulkTasksInput {
  tasks: ExtTaskBulkUpdate[];
}

export interface UpdateExtBulkTasksResponse {
  success: boolean;
  updatedCount: number;
}

export const updateExtBulkTasks = async (data: UpdateExtBulkTasksInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<UpdateExtBulkTasksResponse> | ResponseFailure
  >({
    url: "/ext-braindump/tasks/bulk",
    method: "PATCH",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<UpdateExtBulkTasksResponse>;
};
