import type {Metadata, Viewport} from 'next';
import {Inter} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {PropsWithChildren} from 'react';

import {siteConfig} from '@/config';

import {defaultLocale, locales, type Locale} from '@/i18n/routing';

import {ThemeProvider} from '../provider';

import '../globals.css';

const inter = Inter({subsets: ['latin']});

export const viewport: Viewport = {
  themeColor: '#000319'
};

type LocaleParams = {
  locale: string;
};

const isSupportedLocale = (locale: string): locale is Locale =>
  locales.includes(locale as Locale);

export const generateStaticParams = () => locales.map((locale) => ({locale}));

export const generateMetadata = async ({
  params
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const {locale} = await params;

  if (!isSupportedLocale(locale)) {
    return siteConfig;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

  return {
    ...siteConfig,
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        en: `${siteUrl}/en`,
        uk: `${siteUrl}/uk`,
        ru: `${siteUrl}/ru`,
        pl: `${siteUrl}/pl`,
        de: `${siteUrl}/de`,
        es: `${siteUrl}/es`,
        'x-default': `${siteUrl}/${defaultLocale}`
      }
    }
  };
};

const LocaleLayout = async ({
  children,
  params
}: Readonly<PropsWithChildren<{params: Promise<LocaleParams>}>>) => {
  const {locale} = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
