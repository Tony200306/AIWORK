import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';
import { Step } from '@/models/Task';

export type ExtStepResponseData = Step;

export interface CreateExtStepInput {
  taskId: string;
  title: string;
  description: string;
  orderIndex: number;
  userEstMinutes: number;
}

export const createExtStep = async (data: CreateExtStepInput) => {
  const { taskId, ...payload } = data;
  const response = await fetchApi.request<
    ResponseDetailSuccess<ExtStepResponseData> | ResponseFailure
  >({
    url: `/ext-braindump/tasks/${taskId}/steps`,
    method: "POST",
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<ExtStepResponseData>;
};
