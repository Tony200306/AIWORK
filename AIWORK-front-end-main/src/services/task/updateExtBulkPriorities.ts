import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";
import { Priority } from "@/models/Task";



export interface TaskPriorityUpdate {
  taskId: string;
  priority: Priority;
}

export interface UpdateExtBulkPrioritiesInput {
  tasks: TaskPriorityUpdate[];
}

export interface UpdateExtBulkPrioritiesResponse {
  success: boolean;
  updatedCount: number;
}

export const updateExtBulkPriorities = async (data: UpdateExtBulkPrioritiesInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<UpdateExtBulkPrioritiesResponse> | ResponseFailure
  >({
    url: "/ext-braindump/tasks/priorities",
    method: "PATCH",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<UpdateExtBulkPrioritiesResponse>;
};
