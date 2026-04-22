import { UserInfo } from '~/models/UserInfo';
import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';
import { Step } from '@/models/Task';

export type StepResponseData = Step;

export interface UpdateStepInput {
  taskId: string;
  stepId:string;
  title: string;
  description: string;
  orderIndex: number;
  userEstMinutes: number;
}

export const updateStep = async (data: UpdateStepInput) => {
  const { taskId,stepId, ...payload } = data;
  const response = await fetchApi.request<
    ResponseDetailSuccess<StepResponseData> | ResponseFailure
  >({
    url: `/tasks/${taskId}/steps/${stepId}`,
    method: "PATCH",
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<StepResponseData>;
};
