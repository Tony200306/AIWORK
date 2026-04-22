import { Task, TaskType } from "~/models/Task";
import { ScopeFull, ScopeView } from "@/hooks/shared/useAISplitterStream";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface BulkCreateExtTaskInput {
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
    contributionWeight?: number;
  }[];
  scope?: ScopeFull | null;
  taskType?: TaskType ;
}

export interface BulkCreateExtTasksInput {
  tasks: BulkCreateExtTaskInput[];
}

export interface BulkCreateExtTasksResponse {
  tasks: Task[];
  braindumpId: string;
}

export const bulkCreateExtBrainDumpTasks = async (
  braindumpId: string,
  data: BulkCreateExtTasksInput
): Promise<ResponseDetailSuccess<BulkCreateExtTasksResponse>> => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<BulkCreateExtTasksResponse> | ResponseFailure
  >({
    url: `/ext-braindump/${braindumpId}/tasks/bulk`,
    method: "POST",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<BulkCreateExtTasksResponse>;
};
