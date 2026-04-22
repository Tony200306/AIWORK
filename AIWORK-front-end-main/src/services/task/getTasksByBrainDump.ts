import { Task, TaskStatus, Priority } from "~/models/Task";
import {
  ResponseFailure,
  ResponseListSuccess,
  ResponseDetailSuccess,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface BrainDumpTasksData {
  braindumpId: string;
  status: string;
  contextText: string;
  tasks: Task[];
}

export interface GetTasksByBrainDumpParams {
  status?: TaskStatus;
  priority?: Priority;
  clientId?: string;
  tagId?: string;
  userId?: string;
  brainDumpId?: string;
}

export const getTasksByBrainDump = async (
  params?: GetTasksByBrainDumpParams
): Promise<ResponseDetailSuccess<BrainDumpTasksData>> => {
  const { brainDumpId, ...res } = params;
  const response = await fetchApi.request<
    ResponseDetailSuccess<BrainDumpTasksData> | ResponseFailure
  >({
    url: `/braindump/${brainDumpId}/tasks`,
    method: "GET",
    params: res,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<BrainDumpTasksData>;
};
