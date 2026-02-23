import {getTranslations} from 'next-intl/server';

import {Approach} from '@/components/approach';
import {Clients} from '@/components/clients';
import {Cv} from '@/components/cv';
import {Education} from '@/components/education';
import {Experience} from '@/components/experience';
import {Footer} from '@/components/footer';
import {Grid} from '@/components/grid';
import {Hero} from '@/components/hero';
import {RecentProjects} from '@/components/recent-projects';
import {
  JsonLdScript,
  breadcrumbJsonLd,
  getLocalizedProjectsForJsonLd,
  projectsItemListJsonLd,
  webpageJsonLd
} from '@/components/seo/jsonld';
import {localeHomeLabels, localeMeta} from '@/config/seo';
import {FloatingNav} from '@/components/ui/floating-nav';
import {navItems} from '@/data';
import {locales, type Locale} from '@/i18n/routing';

type MainPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

const MainPage = async ({params}: MainPageProps) => {
  const {locale: routeLocale} = await params;
  const locale = locales.includes(routeLocale as Locale) ? (routeLocale as Locale) : 'en';
  const tProjects = await getTranslations({locale, namespace: 'projects'});
  const meta = localeMeta[locale];
  const localizedProjects = getLocalizedProjectsForJsonLd((key) => tProjects(key));

  return (
    <main className="relative mx-auto flex flex-col items-center justify-center overflow-clip bg-[--surface-1] px-5 sm:px-10">
      <JsonLdScript data={webpageJsonLd(locale, '', meta.title, meta.description)} />
      <JsonLdScript data={breadcrumbJsonLd(locale, '', localeHomeLabels[locale])} />
      <JsonLdScript data={projectsItemListJsonLd(locale, localizedProjects)} />

      <FloatingNav navItems={navItems} />

      <div className="w-full max-w-7xl">
        <Hero />
        <Grid />
        <Experience />
        <Education />
        <Cv />
        <RecentProjects />
        <Clients />
        <Approach />
        <Footer />
      </div>
    </main>
  );
};

export default MainPage;
