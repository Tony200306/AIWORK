import { Sprint, SprintResponse } from "~/models/Sprint";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";






export const getSprint = async (
  sprintId: string
): Promise<ResponseDetailSuccess<SprintResponse>> => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<SprintResponse> | ResponseFailure
  >({
    url: `/sprints/${sprintId}`,
    method: "GET",
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<SprintResponse>;
};
