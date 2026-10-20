export const base = __SITE_BASE__;
export const asset = (path: string) => `${base}${path}`;
export type Locale = 'ru' | 'tr' | 'de' | 'en';
export const localePath = (lang: Locale) => `${base}${lang === 'ru' ? '/' : `/${lang}/`}`;
