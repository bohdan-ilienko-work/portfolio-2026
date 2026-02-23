'use client';

import {usePathname, useRouter, useSearchParams} from 'next/navigation';

import {locales, type Locale} from '@/i18n/routing';

type LanguageOption = {
  locale: Locale;
  label: string;
};

const languageOptions: LanguageOption[] = [
  {locale: 'en', label: '🇬🇧 English (en)'},
  {locale: 'uk', label: '🇺🇦 Українська (uk)'},
  {locale: 'ru', label: '🇷🇺 Русский (ru)'},
  {locale: 'pl', label: '🇵🇱 Polski (pl)'},
  {locale: 'de', label: '🇩🇪 Deutsch (de)'},
  {locale: 'es', label: '🇪🇸 Español (es)'}
];

export const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeLocale = (() => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    return locales.includes((firstSegment ?? '') as Locale)
      ? (firstSegment as Locale)
      : null;
  })();

  const switchLocale = (locale: Locale) => {
    const query = searchParams.toString();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    const segments = pathname.split('/').filter(Boolean);
    const hasLocalePrefix = locales.includes((segments[0] ?? '') as Locale);

    const nextSegments = hasLocalePrefix
      ? [locale, ...segments.slice(1)]
      : [locale, ...segments];

    const nextPathname = `/${nextSegments.join('/')}`;
    const nextUrl = `${nextPathname}${query ? `?${query}` : ''}${hash}`;

    Reflect.set(
      document,
      'cookie',
      `NEXT_LOCALE=${locale}; Max-Age=31536000; Path=/; SameSite=Lax`
    );

    router.push(nextUrl);
  };

  return (
    <div className="relative rounded-full border border-[--border-medium] bg-[--surface-card] p-1 shadow-sm">
      <select
        aria-label="Select language"
        value={activeLocale ?? 'en'}
        onChange={(event) => switchLocale(event.target.value as Locale)}
        className="h-8 min-w-[165px] appearance-none rounded-full border border-transparent bg-transparent px-3 pr-9 text-xs font-medium text-[--text-primary] outline-none transition hover:bg-[--surface-1] focus:border-purple/60"
      >
        {languageOptions.map((option) => (
          <option key={option.locale} value={option.locale}>
            {option.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[--text-muted]">
        ▾
      </span>
    </div>
  );
};
