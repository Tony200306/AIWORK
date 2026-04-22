import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface DeleteBulkTasksInput {
  taskIds: string[];
}

export interface DeleteBulkTasksResponse {
  success: boolean;
  deletedCount: number;
}

export const deleteBulkTasks = async (data: DeleteBulkTasksInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<DeleteBulkTasksResponse> | ResponseFailure
  >({
    url: "/tasks/bulk",
    method: "DELETE",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<DeleteBulkTasksResponse>;
};
