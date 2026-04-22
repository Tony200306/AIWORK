import { UserInfo } from '~/models/UserInfo';
import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface ChangePasswordResponseData {
  user: UserInfo;
  payload: {
    type: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPasswordConfirm: string;
  newPassword: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ResponseDetailSuccess<ChangePasswordResponseData>> => {
  const response = await fetchApi.request<ResponseDetailSuccess<ChangePasswordResponseData> | ResponseFailure>({
    url: '/api/authz/change-password',
    method: 'POST',
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<ChangePasswordResponseData>;
};
