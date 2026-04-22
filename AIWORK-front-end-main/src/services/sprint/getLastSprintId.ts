import { LastSprintResponse } from "~/models/Sprint";
import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

type LastSprintSuccessResponse = ResponseDetailSuccess<LastSprintResponse | null>;

export const getLastSprintId = async (): Promise<LastSprintSuccessResponse> => {
  const response = await fetchApi.request<
    LastSprintSuccessResponse | ResponseFailure
  >({
    url: `/sprints/last/id`,
    method: "GET",
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as LastSprintSuccessResponse;
};
