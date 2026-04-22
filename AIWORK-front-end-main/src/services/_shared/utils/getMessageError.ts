import { useNextTranslation } from '~/hooks/useNextTranslation';
// import { StatusCodeMappingToString } from '../constants/StringMappingToStatusCode';
import { NetworkException } from './NetworkException';
import { ServiceException } from './ServiceException';

export const getMessageError = (error: any): string => {
  console.log('getMessageError -> error', error);
  if (error instanceof ServiceException) {
    // if (error.cause.errorCode) {
    //   return (
    //     useNextTranslation?.translate(`ServiceErrorLocales.${StatusCodeMappingToString[error.cause.errorCode]}`) ?? ''
    //   );
    // }
    return (error as any)?.response?.data?.message ?? error.message;
  } else if (error instanceof NetworkException) {
    return useNextTranslation?.translate(`ServiceErrorLocales.NETWORK`) ?? '';
  } else if (error instanceof Error) {
    return (error as any)?.response?.data?.message ?? error.message;

  }
  return useNextTranslation?.translate(`ServiceErrorLocales.UNKNOWN`) ?? '';
};
