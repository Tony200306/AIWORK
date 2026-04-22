import { Step } from "@/models/Task";
import {
  ResponseFailure,
  ResponseListSuccess
} from "~/services/_shared/types/ServiceResponse";
import { fetchApi } from "~/utils/fetchApi";
import { ServiceException } from "../_shared/utils/ServiceException";

export type StepsResponseData = Step[];

export interface UpdateExtStepsInput {
  taskId: string;
  steps: {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    userEstMinutes: number;
  }[];
}

export const updateExtSteps = async (data: UpdateExtStepsInput) => {
  const { taskId, steps } = data;
  console.log(steps);
  const response = await fetchApi.request<
    ResponseListSuccess<StepsResponseData> | ResponseFailure
  >({
    url: `/ext-braindump/tasks/${taskId}/steps`,
    method: "PATCH",
    data: {
      steps: steps
    },
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseListSuccess<StepsResponseData>;
};
