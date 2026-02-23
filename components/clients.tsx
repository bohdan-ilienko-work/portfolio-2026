import {useTranslations} from 'next-intl';

import {testimonials} from '@/data';

import {InfiniteMovingCards} from '@/components/ui/infinite-moving-cards';

export const Clients = () => {
  const t = useTranslations('testimonials');

  const translatedTestimonials = testimonials.map((item) => ({
    quote: t(item.quoteKey),
    name: t(item.nameKey),
    title: t(item.titleKey)
  }));

  return (
    <section id="testimonials" className="py-20">
      <h2 className="heading">
        {t('headingPrefix')} <span className="text-purple">{t('headingHighlight')}</span>
      </h2>

      <div className="flex flex-col items-center max-lg:mt-10">
        <div className="relative flex h-[50vh] flex-col items-center justify-center overflow-hidden rounded-md antialiased md:h-[30rem]">
          <InfiniteMovingCards items={translatedTestimonials} direction="right" speed="slow" />
        </div>
      </div>
    </section>
  );
};
