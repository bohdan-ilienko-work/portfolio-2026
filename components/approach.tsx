import {useTranslations} from 'next-intl';
import type {SVGProps} from 'react';

import styles from './approach.module.css';

const phases = [
  {number: 1, title: 'approach.phase1Title', description: 'approach.phase1Description', colors: 'bg-emerald-950 text-emerald-300'},
  {number: 2, title: 'approach.phase2Title', description: 'approach.phase2Description', colors: 'bg-black text-pink-400'},
  {number: 3, title: 'approach.phase3Title', description: 'approach.phase3Description', colors: 'bg-sky-900 text-sky-300'}
] as const;

export const Approach = () => {
  const t = useTranslations('common');

  return (
    <section id="approach" className="w-full py-20">
      <h2 className="heading">
        {t('approach.headingPrefix')} <span className="text-purple">{t('approach.headingHighlight')}</span>
      </h2>

      <div className="my-20 flex flex-col items-center justify-center gap-4 lg:flex-row">
        {phases.map(({number, title, description, colors}) => (
          <article
            key={number}
            tabIndex={0}
            className={`${styles.card} relative mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-4 rounded-3xl border p-4 text-center lg:h-[35rem]`}
            style={{borderColor: 'var(--border-medium)'}}
          >
            <Corner className="absolute -left-3 -top-3 z-10 h-6 w-6 text-[--text-primary]" />
            <Corner className="absolute -bottom-3 -left-3 z-10 h-6 w-6 text-[--text-primary]" />
            <Corner className="absolute -right-3 -top-3 z-10 h-6 w-6 text-[--text-primary]" />
            <Corner className="absolute -bottom-3 -right-3 z-10 h-6 w-6 text-[--text-primary]" />

            <div aria-hidden="true" className={`${styles.background} pointer-events-none absolute inset-0 overflow-hidden rounded-3xl ${colors}`} />
            <span className={`${styles.badge} relative z-10 inline-flex h-12 items-center justify-center rounded-lg border border-purple/70 bg-[--magic-btn-bg] px-7 text-sm font-medium text-white md:w-60`}>
              {t('approach.phase', {number})}
            </span>

            <div className={`${styles.details} relative z-10`}>
              <h3 className="text-3xl font-bold">{t(title)}</h3>
              <p className="mt-4 text-sm font-bold">{t(description)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const Corner = (props: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M0 12h24M12 0v24" />
  </svg>
);
