import { TaskType } from "~/models/Task";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

// --- Types ---

export interface ReshuffleDecision {
  taskId: string;
  title: string;
  priority: string;
  pinned: boolean;
  expectedTimeHours: number | null;
  scoreBefore: number;
  scoreAfter: number;
  zoneBefore: TaskType;
  zoneRecommended: TaskType;
  symbol: string;
  reason: string;
}

export interface ReshuffleChange {
  taskId: string;
  title: string;
  priority: string;
  pinned: boolean;
  expectedTimeHours: number | null;
  scoreBefore: number;
  scoreAfter: number;
  zoneBefore: TaskType;
  zoneRecommended: TaskType;
  symbol: string;
  reason: string;
}

export interface ReshuffleUnchanged {
  taskId: string;
  title: string;
  priority: string;
  pinned: boolean;
  expectedTimeHours: number | null;
  zone: TaskType;
  score: number;
  reason: string;
}

export interface ReshuffleCapacity {
  allocatedHours: number;
  pinnedActiveHours: number;
  availableHours: number;
}

export interface ReshuffleMasterKanbanResult {
  capacity: ReshuffleCapacity;
  decisions: ReshuffleDecision[];
  changes: ReshuffleChange[];
  unchanged: ReshuffleUnchanged[];
}

// --- Service ---

export const reshuffleMasterKanban = async (
  sprintId: string
): Promise<ResponseDetailSuccess<ReshuffleMasterKanbanResult>> => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<ReshuffleMasterKanbanResult> | ResponseFailure
  >({
    url: `/reshuffle/master-kanban`,
    method: "POST",
    data: { sprintId },
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<ReshuffleMasterKanbanResult>;
};
