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

export interface UpdateBulkPrioritiesInput {
  tasks: TaskPriorityUpdate[];
}

export interface UpdateBulkPrioritiesResponse {
  success: boolean;
  updatedCount: number;
}

export const updateBulkPriorities = async (data: UpdateBulkPrioritiesInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<UpdateBulkPrioritiesResponse> | ResponseFailure
  >({
    url: "/tasks/bulk/priorities",
    method: "PATCH",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<UpdateBulkPrioritiesResponse>;
};
