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
  'footer',
  'chat'
] as const;

const loadMessageFile = async (locale: Locale, fileName: (typeof messageFiles)[number]) => {
  try {
    const messageModule = await import(`../messages/${locale}/${fileName}.json`);
    return messageModule.default ?? {};
  } catch {
    return {};
  }
};

export default getRequestConfig(async ({locale: explicitLocale, requestLocale}) => {
  // Middleware uses the language cookie to redirect unprefixed URLs. The
  // locale in a prefixed URL stays authoritative and can be prerendered.
  const requestedLocale = explicitLocale ?? (await requestLocale) ?? defaultLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  const loadedFiles = await Promise.all(
    messageFiles.map((fileName) => loadMessageFile(locale, fileName))
  );

  return {
    locale,
    messages: Object.assign({}, ...loadedFiles)
  };
});
