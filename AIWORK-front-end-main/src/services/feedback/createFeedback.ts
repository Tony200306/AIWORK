import {
  ResponseDetailSuccess,
  ResponseFailure,
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export type FeedbackDifficulty = "EASY" | "NORMAL" | "HARD";

export interface CreateFeedbackInput {
  sprintId: string;
  difficulty: FeedbackDifficulty;
  slowdown: string;
}

export const createFeedback = async (data: CreateFeedbackInput) => {
  const response = await fetchApi.request<
    ResponseDetailSuccess<unknown> | ResponseFailure
  >({
    url: "/feedbacks",
    method: "POST",
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<unknown>;
};
