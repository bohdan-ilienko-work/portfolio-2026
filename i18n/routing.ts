import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'uk', 'ru', 'pl', 'de', 'es'] as const;
export const defaultLocale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);
