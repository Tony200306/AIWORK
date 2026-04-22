import { UserInfo } from '~/models/UserInfo';
import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface SignupResponseData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string; 
}

export interface UpdateUserPayload {
  email: string;
  password: string;
  role: string;
  name: string;
}

export const signup = async (payload: UpdateUserPayload,id:string): Promise<ResponseDetailSuccess<SignupResponseData>> => {
  const response = await fetchApi.request<ResponseDetailSuccess<SignupResponseData> | ResponseFailure>({
    url: `/user/update/${id}`,
    method: 'PATCH',
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<SignupResponseData>;
};
