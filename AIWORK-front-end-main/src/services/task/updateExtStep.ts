import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';
import { Step } from '@/models/Task';

export type ExtStepResponseData = Step;

export interface UpdateExtStepInput {
  taskId: string;
  stepId: string;
  title: string;
  description: string;
  orderIndex: number;
  userEstMinutes: number;
}

export const updateExtStep = async (data: UpdateExtStepInput) => {
  const { taskId, stepId, ...payload } = data;
  const response = await fetchApi.request<
    ResponseDetailSuccess<ExtStepResponseData> | ResponseFailure
  >({
    url: `/ext-braindump/tasks/${taskId}/steps/${stepId}`,
    method: "PATCH",
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<ExtStepResponseData>;
};
