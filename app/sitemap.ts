import type {MetadataRoute} from 'next';

import {siteUrl} from '@/config/seo';
import {locales} from '@/i18n/routing';

const sitemap = (): MetadataRoute.Sitemap => {
  const lastModified = new Date();

  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: locale === 'en' ? 1 : 0.9
  }));
};

export default sitemap;
