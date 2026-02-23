import type {Metadata, Viewport} from 'next';
import {Inter} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {PropsWithChildren} from 'react';

import {JsonLdScript, personJsonLd, websiteJsonLd} from '@/components/seo/jsonld';
import {
  defaultDescription,
  defaultTitle,
  getAlternatesLanguages,
  getLocaleUrl,
  localeLanguageTags,
  localeMeta,
  siteName,
  siteUrl
} from '@/config/seo';

import {locales, type Locale} from '@/i18n/routing';

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
    return {
      title: defaultTitle,
      description: defaultDescription
    };
  }

  const tCommon = await getTranslations({locale, namespace: 'common'});
  const tHero = await getTranslations({locale, namespace: 'hero'});
  const profileName = tCommon('profile.ownerName');
  const localizedMeta = localeMeta[locale];
  const title = `${profileName} | ${tHero('role')}`;
  const description = localizedMeta.description;
  const canonical = getLocaleUrl(locale);
  const languages = getAlternatesLanguages();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${profileName}`
    },
    description,
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      type: 'website',
      locale: localeLanguageTags[locale],
      url: canonical,
      siteName,
      title,
      description,
      images: [
        {
          url: `${siteUrl}/og.jpg`,
          width: 1200,
          height: 630,
          alt: `${profileName} portfolio preview`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og.jpg`]
    },
    keywords: [
      profileName,
      localizedMeta.title,
      tHero('role'),
      'TypeScript',
      'Node.js',
      'NestJS',
      'React',
      'Next.js',
      'React Native',
      'Full Stack Engineer'
    ],
    category: 'technology'
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
        <JsonLdScript data={personJsonLd(locale)} />
        <JsonLdScript data={websiteJsonLd(locale)} />
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
