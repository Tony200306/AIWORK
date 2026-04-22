import { UserInfo } from '~/models/UserInfo';
import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface LoginResponseData {
  user: UserInfo;
  access_token: string;
  // payload: {
  //   type: string;
  //   accessToken: string;
  //   refreshToken: string;
  // };
}

export interface Login {
  email: string;
  password: string;
}

export const login = async (data: Login) => {
  const response = await fetchApi.request<ResponseDetailSuccess<LoginResponseData> | ResponseFailure>({
    url: '/auth/login',
    method: 'POST',
    data,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }
  return response.data as ResponseDetailSuccess<LoginResponseData>;
};
