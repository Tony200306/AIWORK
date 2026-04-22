import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface ValidateOTPResponseData {}

export interface ValidateOTP {
  username: string;
  otp: number;
}

export const validateOTP = async (data: ValidateOTP) => {
  const response = await fetchApi.request<ResponseDetailSuccess<ValidateOTPResponseData> | ResponseFailure>({
    url: '/api/authz/validate-otp',
    method: 'POST',
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<ValidateOTPResponseData>;
};
