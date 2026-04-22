import { UserInfo } from '~/models/UserInfo';
import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface SignupResponseData {
  user: UserInfo;
  access_token: string;

  // payload: {
  //   type: string;
  //   accessToken: string;
  //   refreshToken: string;
  // };
}

export interface SignupPayload {
  email: string;
  password: string;
  role: string;
  name: string;
}

export const signup = async (payload: SignupPayload): Promise<ResponseDetailSuccess<SignupResponseData>> => {
  const response = await fetchApi.request<ResponseDetailSuccess<SignupResponseData> | ResponseFailure>({
    url: 'auth/register',
    method: 'POST',
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<SignupResponseData>;
};
