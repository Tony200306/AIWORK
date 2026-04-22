import { TaskType } from "~/models/Task";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface ApplyReshuffleChangeDto {
  taskId: string;
  taskType: TaskType;
  compositeScore: number;
}

export interface ApplyReshuffleChangesInput {
  changes: ApplyReshuffleChangeDto[];
}

export interface ApplyReshuffleChangesResponse {
  success: boolean;
  updatedCount: number;
}

export const applyReshuffleChanges = async (
  data: ApplyReshuffleChangesInput
): Promise<ResponseDetailSuccess<ApplyReshuffleChangesResponse>> => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<ApplyReshuffleChangesResponse> | ResponseFailure
  >({
    url: "/reshuffle/apply-changes",
    method: "POST",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<ApplyReshuffleChangesResponse>;
};
