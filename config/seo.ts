import {links} from '@/config';
import {defaultLocale, locales, type Locale} from '@/i18n/routing';

const fallbackSiteUrl = 'https://portfolio-2026.vercel.app';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl).replace(/\/$/, '');
export const siteName = `${links.ownerName} Portfolio`;
export const defaultTitle = `${links.ownerName} | ${links.ownerRole}`;
export const defaultDescription =
  'Production-ready full stack portfolio focused on scalable web and mobile systems, backend architecture, and reliable delivery.';

export const authorName = links.ownerName;
export const authorJobTitle = links.ownerRole;
export const authorEmail = links.ownerEmail;

export const sameAs = [links.ownerGithub, links.ownerLinkedin, links.ownerTelegram, links.ownerInsta];

export const localeLanguageTags: Record<Locale, string> = {
  en: 'en-US',
  uk: 'uk-UA',
  ru: 'ru-RU',
  pl: 'pl-PL',
  de: 'de-DE',
  es: 'es-ES'
};

export const localeLanguageNames: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
  ru: 'Русский',
  pl: 'Polski',
  de: 'Deutsch',
  es: 'Español'
};

export const localeHomeLabels: Record<Locale, string> = {
  en: 'Home',
  uk: 'Головна',
  ru: 'Главная',
  pl: 'Strona główna',
  de: 'Startseite',
  es: 'Inicio'
};

export const localeMeta: Record<Locale, {title: string; description: string}> = {
  en: {
    title: 'Full Stack Engineer Portfolio',
    description:
      'Portfolio of Bohdan Ilienko: production-grade web and mobile delivery with TypeScript, Node.js/NestJS, React/Next.js, and scalable backend architecture.'
  },
  uk: {
    title: 'Портфоліо Full Stack Engineer',
    description:
      'Портфоліо Богдана Ільєнка: веб і мобільна розробка продакшн-рівня на TypeScript, Node.js/NestJS, React/Next.js та надійній backend-архітектурі.'
  },
  ru: {
    title: 'Портфолио Full Stack Engineer',
    description:
      'Портфолио Богдана Ильенко: разработка веб- и мобильных продуктов production-уровня на TypeScript, Node.js/NestJS, React/Next.js и надежной backend-архитектуре.'
  },
  pl: {
    title: 'Portfolio Full Stack Engineer',
    description:
      'Portfolio Bohdana Ilienki: produkcyjne systemy web i mobile z TypeScript, Node.js/NestJS, React/Next.js oraz skalowalną architekturą backendową.'
  },
  de: {
    title: 'Portfolio als Full Stack Engineer',
    description:
      'Portfolio von Bohdan Ilienko: produktionsreife Web- und Mobile-Systeme mit TypeScript, Node.js/NestJS, React/Next.js und skalierbarer Backend-Architektur.'
  },
  es: {
    title: 'Portfolio de Full Stack Engineer',
    description:
      'Portfolio de Bohdan Ilienko: desarrollo web y mobile de nivel producción con TypeScript, Node.js/NestJS, React/Next.js y arquitectura backend escalable.'
  }
};

export const getLocaleUrl = (locale: Locale, pathname = '') => {
  const normalizedPath = pathname ? `/${pathname.replace(/^\//, '')}` : '';
  return `${siteUrl}/${locale}${normalizedPath}`;
};

export const getAlternatesLanguages = () => {
  const entries = locales.map((locale) => [locale, getLocaleUrl(locale)] as const);
  return {
    ...Object.fromEntries(entries),
    'x-default': getLocaleUrl(defaultLocale)
  };
};

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);
