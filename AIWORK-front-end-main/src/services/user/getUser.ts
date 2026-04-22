import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface UserResponseData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string; 
}


export const signup = async (): Promise<ResponseDetailSuccess<UserResponseData>> => {
  const response = await fetchApi.request<ResponseDetailSuccess<UserResponseData> | ResponseFailure>({
    url: `/auth/profile`,
    method: 'GET',
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<UserResponseData>;
};
