import { Sprint, SprintWindowType } from "~/models/Sprint";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export interface CreateSprintInput {
  title: string;
  windowType: SprintWindowType;
  startDate: string;
  endDate: string;
  capacityMinutes: number;
  taskIds: string[];
}

export type CreateSprintResponse = Sprint;

export const createSprint = async (data: CreateSprintInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<CreateSprintResponse> | ResponseFailure
  >({
    url: "/sprints",
    method: "POST",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<CreateSprintResponse>;
};
