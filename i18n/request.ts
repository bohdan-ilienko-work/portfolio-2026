import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';

import {defaultLocale, isLocale, type Locale} from './routing';

const messageFiles = [
  'common',
  'hero',
  'grid',
  'projects',
  'testimonials',
  'experience',
  'cv',
  'footer'
] as const;

const loadMessageFile = async (locale: Locale, fileName: (typeof messageFiles)[number]) => {
  try {
    const messageModule = await import(`../messages/${locale}/${fileName}.json`);
    return messageModule.default ?? {};
  } catch {
    return {};
  }
};

export default getRequestConfig(async ({requestLocale}) => {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const localeFromRequest = await requestLocale;

  let locale: Locale = defaultLocale;
  const cookieCandidate = localeFromCookie ?? '';
  const requestCandidate = localeFromRequest ?? '';

  if (isLocale(cookieCandidate)) {
    locale = cookieCandidate;
  } else if (isLocale(requestCandidate)) {
    locale = requestCandidate;
  }

  const loadedFiles = await Promise.all(
    messageFiles.map((fileName) => loadMessageFile(locale, fileName))
  );

  return {
    locale,
    messages: Object.assign({}, ...loadedFiles)
  };
});
