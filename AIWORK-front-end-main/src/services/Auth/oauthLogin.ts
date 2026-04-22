import { UserInfo } from '~/models/UserInfo';
import { ResponseDetailSuccess, ResponseFailure } from '~/services/_shared/types/ServiceResponse';
import { fetchApi } from '~/utils/fetchApi';
import { ServiceException } from '../_shared/utils/ServiceException';

export interface OAuthLoginPayload {
  email: string;
  provider: 'google' | 'github';
  provider_id: string;
  name: string;
  avatar_url?: string;
  braindump_id?: string; // Link pending braindump to user account
}

export interface OAuthLoginResponseData {
  user: UserInfo;
  access_token: string;
}

/**
 * OAuth login/register - creates user if not exists
 * Backend should handle:
 * - Check if user exists by email
 * - If exists: login and return token
 * - If not exists: create user without password and return token
 * - If braindump_id provided: link braindump to user account
 */
export const oauthLogin = async (payload: OAuthLoginPayload): Promise<ResponseDetailSuccess<OAuthLoginResponseData>> => {
  const response = await fetchApi.request<ResponseDetailSuccess<OAuthLoginResponseData> | ResponseFailure>({
    url: '/auth/oauth-login',
    method: 'POST',
    data: payload,
  }).axiosPromise;

  if (ServiceException.isResponseError(response)) {
    throw new ServiceException(response.data.message, response.data);
  }

  return response.data as ResponseDetailSuccess<OAuthLoginResponseData>;
};
