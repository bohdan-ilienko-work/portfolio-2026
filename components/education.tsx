import {useTranslations} from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import {FaLocationArrow} from 'react-icons/fa6';

import {educationItems} from '@/data';

export const Education = () => {
  const t = useTranslations('cv');

  return (
    <section id="education" className="py-20">
      <h2 className="heading">
        {t('education.headingPrefix')} <span className="text-purple">{t('education.headingHighlight')}</span>
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {educationItems.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-3xl border p-4"
            style={{
              borderColor: 'var(--border-medium)',
              background: 'linear-gradient(to bottom, var(--surface-2), var(--surface-3))',
              boxShadow: 'var(--shadow-heavy)'
            }}
          >
            <div className="relative overflow-hidden rounded-2xl border" style={{borderColor: 'var(--border-medium)'}}>
              <Image
                src={item.image}
                alt={t(item.titleKey)}
                width={960}
                height={600}
                className="h-56 w-full object-cover object-center transition duration-300 group-hover:scale-[1.02] md:h-64"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{background: 'linear-gradient(to top, var(--overlay-from), transparent, transparent)'}}
              />
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em]" style={{color: 'var(--text-muted)'}}>
                {t(item.institutionKey)}
              </p>
              <h3 className="mt-2 text-xl font-bold md:text-2xl" style={{color: 'var(--text-primary)'}}>
                {t(item.titleKey)}
              </h3>
              <p className="mt-2 text-sm md:text-base" style={{color: 'var(--text-secondary)'}}>
                {t(item.degreeKey)}
              </p>
              <p className="mt-1 text-sm text-purple">{t(item.periodKey)}</p>
              <p className="mt-3 text-sm" style={{color: 'var(--text-muted)'}}>
                {t(item.descriptionKey)}
              </p>

              <Link
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-flex items-center text-sm text-purple transition-opacity hover:opacity-80 md:text-base"
              >
                {t(item.ctaLabelKey)}
                <FaLocationArrow className="ms-3 h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
