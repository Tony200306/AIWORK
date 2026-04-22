import { Task, TaskType } from "@/models/Task";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export type TaskResponseData = Task;

export interface UpdateTaskInput {
  taskId: string;
  title?: string;
  expectedTimeHours?: number;
  taskType?: TaskType;
}

export const updateTask = async (data: UpdateTaskInput) => {
  const { taskId, ...payload } = data;
  const response = await fetchApi.request<
    ResponseDetailSuccess<TaskResponseData> | ResponseFailure
  >({
    url: `/tasks/${taskId}`,
    method: "PATCH",
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<TaskResponseData>;
};
