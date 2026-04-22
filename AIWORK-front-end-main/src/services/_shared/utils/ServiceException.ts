import { AxiosResponse } from 'axios';
import { useNextTranslation } from '~/hooks/useNextTranslation';
import { useAuthStore } from '~/stores/authStore';
import { StringMappingToStatusCode } from '../constants/StringMappingToStatusCode';
import { ResponseFailure } from '../types/ServiceResponse';
import { toast } from 'sonner';
import { getMessageError } from './getMessageError';

export class ServiceException extends Error {
  public cause: ResponseFailure;
  constructor(message: string, cause: ResponseFailure) {
    super(message);
    this.name = 'ServiceException';
    this.cause = cause;
  }

  public static isResponseError = (
    response: AxiosResponse | ResponseFailure,
  ): response is AxiosResponse<ResponseFailure> => {
    const responseData =
      "data" in response ? (response.data as ResponseFailure) : response;
    const statusCode = responseData.statusCode;
    const isError =
      typeof responseData === "object" &&
      "statusCode" in responseData &&
      !(statusCode >= 200 && statusCode < 300);
    const isAuthError =
      responseData?.statusCode ===
      StringMappingToStatusCode["HTTP_UNAUTHORIZED"];
    if (isAuthError && !responseData.path.includes("/login")) {
      toast(useNextTranslation.translate("AuthLocales.session_expired"), {
        description: getMessageError(responseData),
      });
      useAuthStore.getState().logout();
    }

    return !!isError;
  };
}
