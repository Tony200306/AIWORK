import { Task, TaskStatus, Priority } from "~/models/Task";
import {
  ResponseFailure,
  ResponseDetailSuccess,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface ExtBrainDumpTasksData {
  braindumpId: string;
  status: string;
  contextText: string;
  tasks: Task[];
}

export interface GetExtBrainDumpTasksParams {
  brainDumpId: string;
  status?: TaskStatus;
  priority?: Priority;
  tagId?: string;
}

export const getExtBrainDumpTasks = async (
  params: GetExtBrainDumpTasksParams
): Promise<ResponseDetailSuccess<ExtBrainDumpTasksData>> => {
  const { brainDumpId, ...restParams } = params;

  const response = await fetchApi.request<
    ResponseDetailSuccess<ExtBrainDumpTasksData> | ResponseFailure
  >({
    url: `/ext-braindump/${brainDumpId}/tasks`,
    method: "GET",
    params: restParams,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<ExtBrainDumpTasksData>;
};
