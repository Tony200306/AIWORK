import en from '../messages/en.json';
import cn from '../messages/cn.json';
import { Language } from './models/CommonEnums/Language';

type MessagesEn = typeof en;
type MessagesCn = typeof cn;

// Sử dụng utility type để đảm bảo cả 2 file có cùng structure
type RequireBoth<T, U> = {
  [K in keyof T & keyof U]: T[K] extends object
  ? U[K] extends object
  ? RequireBoth<T[K], U[K]>
  : never
  : T[K];
};

declare global {
  // Thay vì intersection, dùng MessagesEn làm base và check với MessagesCn
  type IntlMessages = RequireBoth<MessagesEn, MessagesCn>;

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_DEFAULT_LANGUAGE: Language;
      NEXT_PUBLIC_FILE_RESOURCE_URL: string;
      NEXT_PUBLIC_API_BASE_URL: string;
      NEXT_HOST_URL: string;
    }
  }
}

export { };