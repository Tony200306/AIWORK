import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface ResetPasswordResponseData {}

export interface ResetPassword {
  newPassword: string;
  confirmPassword: string;
  username: string;
  otp: number;
}

export const resetPassword = async (data: ResetPassword) => {
  const response = await fetchApi.request<ResponseDetailSuccess<ResetPasswordResponseData> | ResponseFailure>({
    url: '/api/authz/reset-password',
    method: 'POST',
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<ResetPasswordResponseData>;
};
