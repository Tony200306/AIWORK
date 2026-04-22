import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";
import { TaskStatus } from "@/models/Task";

export interface TaskStatusUpdate {
  taskId: string;
  status: TaskStatus;
}

export interface UpdateBulkStatusesInput {
  tasks: TaskStatusUpdate[];
}

export interface UpdateBulkStatusesResponse {
  success: boolean;
  updatedCount: number;
}

export const updateBulkStatuses = async (data: UpdateBulkStatusesInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<UpdateBulkStatusesResponse> | ResponseFailure
  >({
    url: "/tasks/bulk/statuses",
    method: "PATCH",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<UpdateBulkStatusesResponse>;
};
