import {projects} from '@/data';
import type {Locale} from '@/i18n/routing';

import {
  authorEmail,
  authorJobTitle,
  authorName,
  getLocaleUrl,
  localeLanguageTags,
  sameAs,
  siteName,
  siteUrl
} from '@/config/seo';

type JsonLd = Record<string, unknown>;

type JsonLdScriptProps = {
  data: JsonLd;
};

type LocalizedProject = {
  name: string;
  description: string;
  url: string;
  image?: string;
};

export const personJsonLd = (locale: Locale): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: authorName,
  jobTitle: authorJobTitle,
  email: authorEmail,
  url: getLocaleUrl(locale),
  sameAs
});

export const websiteJsonLd = (locale: Locale): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  inLanguage: localeLanguageTags[locale],
  publisher: {
    '@type': 'Person',
    name: authorName
  }
});

export const webpageJsonLd = (locale: Locale, pathname: string, name: string, description: string): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  description,
  inLanguage: localeLanguageTags[locale],
  url: getLocaleUrl(locale, pathname),
  isPartOf: {
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl
  }
});

export const breadcrumbJsonLd = (locale: Locale, pathname: string, homeLabel: string): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeLabel,
      item: getLocaleUrl(locale, pathname)
    }
  ]
});

export const projectsItemListJsonLd = (locale: Locale, localizedProjects: LocalizedProject[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Projects',
  inLanguage: localeLanguageTags[locale],
  numberOfItems: localizedProjects.length,
  itemListElement: localizedProjects.map((project, index) => {
    const listItem: Record<string, unknown> = {
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: project.name,
        description: project.description,
        url: project.url,
        inLanguage: localeLanguageTags[locale]
      }
    };

    if (project.image) {
      (listItem.item as Record<string, unknown>).image = project.image;
    }

    return listItem;
  })
});

export const getLocalizedProjectsForJsonLd = (
  translate: (key: string) => string
): LocalizedProject[] =>
  projects.map((project) => ({
    name: translate(project.titleKey),
    description: translate(project.desKey),
    url: project.link,
    image: project.img ? `${siteUrl}${project.img}` : undefined
  }));

export const JsonLdScript = ({data}: JsonLdScriptProps) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data)
    }}
  />
);
