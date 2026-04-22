import { Task, TaskType } from "~/models/Task";
import { ScopeFull, ScopeView } from "@/hooks/shared/useAISplitterStream";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface BulkCreateTaskInput {
  title: string;
  description: string;
  expectedTimeHours?: number | null;
  steps: {
    title: string;
    description?: string | null;
    orderIndex?: number | null;
    sysEstMinutes?: number | null;
    difficulty?: number | null;
  }[];
  tags?: {
    name: string;
    contribution_weight?: number;
  }[];
  scope?: ScopeFull | null;
  taskType?: TaskType ;
}

export interface BulkCreateTasksInput {
  tasks: BulkCreateTaskInput[];
}

export interface BulkCreateTasksResponse {
  tasks: Task[];
  braindumpId: string;
}

export const bulkCreateTasks = async (
  braindumpId: string,
  data: BulkCreateTasksInput
): Promise<ResponseDetailSuccess<BulkCreateTasksResponse>> => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<BulkCreateTasksResponse> | ResponseFailure
  >({
    url: `/braindump/${braindumpId}/tasks/bulk`,
    method: "POST",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<BulkCreateTasksResponse>;
};
