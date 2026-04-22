// global.d.ts (hoặc global.ts)
import messages from './messages/en.json';     // đường dẫn tới file JSON mặc định
import { getRequestConfig } from './i18n';       // nếu bạn định nghĩa formats riêng

declare module 'next-intl' {
  interface AppConfig {
    Locale: typeof routing.locales[number]; // Hoặc định nghĩa type Locale riêng
    Messages: typeof messages;
    Formats: typeof getRequestConfig;
  }
}
