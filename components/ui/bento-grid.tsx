'use client';

import Image from 'next/image';
import {useEffect, useMemo, useState} from 'react';
import {IoCopyOutline} from 'react-icons/io5';
import dynamic from 'next/dynamic';
import {useLocale, useTranslations} from 'next-intl';

import {links} from '@/config';
import {techStack} from '@/data';
import {cn} from '@/lib/utils';

import {BackgroundGradientAnimation} from './background-gradient-animation';
import {MagicButton} from './magic-button';
import {InView} from './in-view';

const BentoGridLottie = dynamic(() => import('./bento-grid-lottie'), {
  ssr: false
});

const GridGlobe = dynamic(() => import('../grid-globe').then((module) => module.GridGlobe), {
  ssr: false
});

export const BentoGrid = ({
  className,
  children
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-5',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  id,
  className,
  titleKey,
  descriptionKey,
  img,
  imgClassName,
  titleClassName,
  spareImg
}: {
  id?: number;
  className?: string;
  titleKey?: string;
  descriptionKey?: string;
  img?: string;
  imgClassName?: string;
  titleClassName?: string;
  spareImg?: string;
}) => {
  const [copied, setCopied] = useState(false);
  const [copyTrigger, setCopyTrigger] = useState(0);
  const t = useTranslations('grid');
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

  const skillCategoryMap: Record<string, string> = {
    TypeScript: 'language',
    JavaScript: 'language',
    'Node.js': 'backend',
    NestJS: 'backend',
    'Express.js': 'backend',
    React: 'frontend',
    'Next.js': 'frontend',
    'React Native': 'mobile',
    'Redux Toolkit': 'state',
    'Tailwind CSS': 'styling',
    PostgreSQL: 'data',
    MongoDB: 'data',
    Redis: 'caching',
    Docker: 'devops',
    Kubernetes: 'devops',
    'GitHub Actions': 'cicd',
    RabbitMQ: 'messaging',
    Kafka: 'messaging',
    GraphQL: 'api',
    WebSockets: 'realtime'
  };

  const techItems = useMemo(
    () => [
      ...techStack.stack1,
      ...techStack.stack2,
      ...techStack.stack3,
      ...techStack.stack4
    ],
    []
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(links.ownerEmail);
    setCopied(true);
    setCopyTrigger((current) => current + 1);
  };

  useEffect(() => {
    if (!copied) return;

    const copyTimeout = setTimeout(() => {
      setCopied(false);
    }, 3500);

    return () => clearTimeout(copyTimeout);
  }, [copied]);

  return (
    <div
      className={cn(
        'group/bento relative row-span-1 flex flex-col justify-between space-y-4 overflow-hidden rounded-3xl border transition duration-200 hover:shadow-xl',
        className
      )}
      style={{
        borderColor: 'var(--border-medium)',
        background: 'var(--surface-card)',
        backgroundImage: 'var(--surface-card-gradient)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div className={cn('h-full', id === 6 && 'flex justify-center')}>
        <div className="absolute h-full w-full">
          {img && (
            <Image
              width={689}
              height={541}
              src={img}
              alt={descriptionKey ? t(descriptionKey) : 'Portfolio card background'}
              className={cn(
                'object-cover object-center',
                id === 5 &&
                  'brightness-[0.5] saturate-[0.75] contrast-[0.94] transition duration-300',
                imgClassName
              )}
            />
          )}
        </div>

        {id === 5 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, var(--bento-overlay), var(--bento-overlay-mid), var(--bento-overlay-end))'
            }}
          />
        )}

        <div className={cn('absolute right-0 -mb-5', id === 5 && 'w-full opacity-80')}>
          {spareImg && (
            <Image
              width={208}
              height={96}
              src={spareImg}
              alt="Decorative card overlay"
              className={cn(
                'h-full w-full object-cover object-center',
                id === 4 && 'invert opacity-60 dark:invert-0 dark:opacity-100'
              )}
            />
          )}
        </div>

        {id === 6 && <BackgroundGradientAnimation />}

        <div
          className={cn(
            'relative flex min-h-40 flex-col p-5 px-5 transition duration-200 group-hover/bento:translate-x-2 md:h-full lg:p-10',
            titleClassName
          )}
        >
          <div
            className={cn(
              'relative z-20 font-sans text-sm font-extralight md:text-xs lg:text-base',
              id === 1 || id === 6
                ? 'text-[#c1c2d3]'
                : id === 5
                ? 'text-[--text-secondary] dark:text-[#c1c2d3]'
                : 'text-[--text-secondary]'
            )}
          >
            {descriptionKey ? t(descriptionKey) : null}
          </div>

          <div
            className={cn(
              'relative z-20 max-w-96 font-sans text-lg font-bold lg:text-3xl',
              id === 1 || id === 6
                ? 'text-white'
                : id === 5
                ? 'text-[--text-primary] dark:text-white'
                : 'text-[--text-primary]'
            )}
          >
            {titleKey ? t(titleKey, {experience: formatExperience(links.totalExperienceMonths)}) : null}
          </div>

          {id === 2 && (
            <InView className="h-full w-full">
              <GridGlobe />
            </InView>
          )}

          {id === 3 && (
            <div className="relative mt-7 w-full">
              <div
                className="pointer-events-none absolute inset-0 -z-10 rounded-2xl blur-xl"
                style={{background: 'linear-gradient(to bottom, var(--overlay-subtle), transparent)'}}
              />

              <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {techItems.map((item) => {
                  const categoryKey = skillCategoryMap[item.name] ?? 'engineering';

                  return (
                    <div
                      key={item.name}
                      className="group/skill relative overflow-hidden rounded-2xl border px-4 py-3 transition duration-300 hover:-translate-y-1 lg:px-5 lg:py-4"
                      style={{
                        borderColor: 'var(--border-medium)',
                        background: 'linear-gradient(to bottom, var(--skill-from), var(--skill-to))',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    >
                      <div className="pointer-events-none absolute -inset-24 opacity-0 blur-2xl transition duration-300 group-hover/skill:opacity-100">
                        <div
                          className="h-40 w-40 rounded-full"
                          style={{backgroundColor: 'var(--overlay-subtle)'}}
                        />
                      </div>

                      <div className="flex items-center gap-3 lg:gap-3.5">
                        <div
                          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 lg:h-12 lg:w-12"
                          style={{
                            backgroundColor: 'var(--skill-icon-bg)',
                            '--tw-ring-color': 'var(--border-medium)'
                          } as React.CSSProperties}
                        >
                          <div
                            className="pointer-events-none absolute inset-0 rounded-xl opacity-60"
                            style={{background: 'linear-gradient(to bottom, var(--overlay-subtle), transparent)'}}
                          />
                          <Image
                            src={item.icon}
                            alt={`${item.name} icon`}
                            width={26}
                            height={26}
                            unoptimized
                            className="h-6 w-6 lg:h-7 lg:w-7"
                          />
                        </div>

                        <div className="min-w-0">
                          <div
                            className="truncate font-sans text-sm font-semibold lg:text-base"
                            style={{color: 'var(--text-primary)'}}
                          >
                            {item.name}
                          </div>
                          <div className="mt-0.5 text-xs" style={{color: 'var(--text-muted)'}}>
                            {t(`categories.${categoryKey}`)}
                          </div>
                        </div>
                      </div>

                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition duration-300 group-hover/skill:opacity-100"
                        style={{background: 'linear-gradient(to right, transparent, var(--border-strong), transparent)'}}
                      />
                      <div
                        className="pointer-events-none absolute inset-0 rounded-2xl ring-1"
                        style={{'--tw-ring-color': 'var(--border-subtle)'} as React.CSSProperties}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {id === 6 && (
            <div className="group relative mt-5">
              <BentoGridLottie trigger={copyTrigger} />

              <MagicButton
                title={copied ? t('emailCopied') : t('copyMyEmail')}
                icon={<IoCopyOutline />}
                otherClasses="!bg-[--magic-btn-bg]"
                handleClick={handleCopy}
                asChild
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
