'use client';

import {useRouter, usePathname, useSearchParams} from 'next/navigation';
import {useTranslations} from 'next-intl';

import {locales, type Locale} from '@/i18n/routing';
import {cn} from '@/lib/utils';

export const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('common');

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

  const activeLocale = (() => {
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0];
    return locales.includes((locale ?? '') as Locale) ? (locale as Locale) : null;
  })();

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-[--border-medium] bg-[--surface-card] p-1 shadow-sm"
      aria-label={t('languageSwitcherLabel')}
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          className={cn(
            'flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold transition-all duration-200',
            activeLocale === locale
              ? 'bg-purple/20 text-purple shadow-sm'
              : 'text-[--text-muted] hover:text-[--text-secondary]'
          )}
          aria-label={`${t('languageSwitcherLabel')}: ${t(`languages.${locale}`)}`}
        >
          {t(`languages.${locale}`)}
        </button>
      ))}
    </div>
  );
};
