export const locales = ['en', 'cn'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
