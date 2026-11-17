import {useLocale, useTranslations} from 'next-intl';
import Link from 'next/link';
import {FaLocationArrow} from 'react-icons/fa6';

import {Spotlight} from '@/components/ui/spotlight';
import {TextGenerateEffect} from '@/components/ui/text-generate-effect';
import {MagicButton} from '@/components/ui/magic-button';
import {links} from '@/config';

export const Hero = () => {
  const t = useTranslations('hero');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const getPluralForm = (value: number, forms: [string, string, string]) => {
    const absValue = Math.abs(value) % 100;
    const lastDigit = absValue % 10;

    if (absValue > 10 && absValue < 20) return forms[2];
    if (lastDigit > 1 && lastDigit < 5) return forms[1];
    if (lastDigit === 1) return forms[0];
    return forms[2];
  };

  const formatExperience = (monthsTotal: number) => {
    const years = Math.floor(monthsTotal / 12);
    const months = monthsTotal % 12;

    const parts: string[] = [];
    const isUkrainian = locale.startsWith('uk');
    const isRussian = locale.startsWith('ru');

    if (years > 0) {
      if (isUkrainian) {
        parts.push(`${years} ${getPluralForm(years, ['рік', 'роки', 'років'])}`);
      } else if (isRussian) {
        parts.push(`${years} ${getPluralForm(years, ['год', 'года', 'лет'])}`);
      } else {
        parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
      }
    }

    if (months > 0) {
      if (isUkrainian) {
        parts.push(`${months} ${getPluralForm(months, ['місяць', 'місяці', 'місяців'])}`);
      } else if (isRussian) {
        parts.push(`${months} ${getPluralForm(months, ['месяц', 'месяца', 'месяцев'])}`);
      } else {
        parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
      }
    }

    if (parts.length === 0) {
      return isUkrainian ? '0 місяців' : isRussian ? '0 месяцев' : '0 months';
    }

    return parts.join(' ');
  };

  return (
    <div className="pb-20 pt-36">
      <div>
        <Spotlight
          className="-left-10 -top-40 h-screen md:-left-32 md:-top-20"
          fill="white"
        />
        <Spotlight className="left-full top-10 h-[80vh] w-[50vw]" fill="purple" />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div>

      <div className="absolute left-0 top-0 flex h-screen w-full items-center justify-center bg-white bg-grid-black/[0.04] dark:bg-black-100 dark:bg-grid-white/[0.03]">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black-100" />
      </div>

      <div className="relative z-10 my-20 flex justify-center">
        <div className="flex max-w-[89vw] flex-col items-center justify-center md:max-w-2xl lg:max-w-[60vw]">
          <h2 className="max-w-80 text-center text-xs uppercase tracking-widest text-[--text-secondary]">
            {t('role')}
          </h2>

          <TextGenerateEffect
            className="text-center text-[40px] md:text-5xl lg:text-6xl"
            words={t('headline')}
          />

          <p className="mb-4 text-center text-sm md:text-lg md:tracking-wider lg:text-2xl">
            {t('intro', {
              name: tCommon('profile.ownerName'),
              role: t('role'),
              experience: formatExperience(links.totalExperienceMonths)
            })}
          </p>

          <Link href="#projects" className="md:mt-10">
            <MagicButton title={t('cta')} icon={<FaLocationArrow />} position="right" asChild />
          </Link>
        </div>
      </div>
    </div>
  );
};
