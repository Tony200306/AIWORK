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

export interface UpdateExtBulkStatusesInput {
  tasks: TaskStatusUpdate[];
}

export interface UpdateExtBulkStatusesResponse {
  success: boolean;
  updatedCount: number;
}

export const updateExtBulkStatuses = async (data: UpdateExtBulkStatusesInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<UpdateExtBulkStatusesResponse> | ResponseFailure
  >({
    url: "/ext-braindump/tasks/statuses",
    method: "PATCH",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<UpdateExtBulkStatusesResponse>;
};
