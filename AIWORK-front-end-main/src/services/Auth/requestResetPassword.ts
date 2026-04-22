import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface RequestResetResponseData {}

export interface RequestResetPassword {
  username: string;
}

export const requestResetPassword = async (data: RequestResetPassword) => {
  const response = await fetchApi.request<ResponseDetailSuccess<RequestResetResponseData> | ResponseFailure>({
    url: '/api/authz/forgot-password',
    method: 'POST',
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<RequestResetResponseData>;
};
