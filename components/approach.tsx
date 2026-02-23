'use client';

import {AnimatePresence, LazyMotion, domAnimation, m} from 'framer-motion';
import {useTranslations} from 'next-intl';
import {useState} from 'react';

import {CanvasRevealEffect} from '@/components/ui/canvas-reveal-effect';
import {MagicButton} from '@/components/ui/magic-button';

export const Approach = () => {
  const t = useTranslations('common');

  return (
    <section id="approach" className="w-full py-20">
      <h2 className="heading">
        {t('approach.headingPrefix')} <span className="text-purple">{t('approach.headingHighlight')}</span>
      </h2>

      <LazyMotion features={domAnimation}>
        <div className="my-20 flex flex-col items-center justify-center gap-4 lg:flex-row">
          <Card
            title={t('approach.phase1Title')}
            icon={<MagicButton title={t('approach.phase', {number: 1})} asChild />}
            description={t('approach.phase1Description')}
          >
            <CanvasRevealEffect animationSpeed={5.1} containerClassName="bg-emerald-900" />
          </Card>

          <Card
            title={t('approach.phase2Title')}
            icon={<MagicButton title={t('approach.phase', {number: 2})} asChild />}
            description={t('approach.phase2Description')}
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[
                [236, 72, 153],
                [232, 121, 249]
              ]}
              dotSize={2}
            />
          </Card>

          <Card
            title={t('approach.phase3Title')}
            icon={<MagicButton title={t('approach.phase', {number: 3})} asChild />}
            description={t('approach.phase3Description')}
          >
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-sky-600"
              colors={[[125, 211, 252]]}
            />
          </Card>
        </div>
      </LazyMotion>
    </section>
  );
};

type CardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
};

const Card = ({title, description, icon, children}: CardProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group/canvas-card relative mx-auto flex w-full max-w-sm items-center justify-center rounded-3xl border p-4 lg:h-[35rem]"
      style={{borderColor: 'var(--border-medium)'}}
    >
      <Icon className="absolute -left-3 -top-3 h-6 w-6 text-[--text-primary]" />
      <Icon className="absolute -bottom-3 -left-3 h-6 w-6 text-[--text-primary]" />
      <Icon className="absolute -right-3 -top-3 h-6 w-6 text-[--text-primary]" />
      <Icon className="absolute -bottom-3 -right-3 h-6 w-6 text-[--text-primary]" />

      <AnimatePresence>
        {hovered && (
          <m.div initial={{opacity: 0}} animate={{opacity: 1}} className="absolute inset-0 h-full w-full">
            {children}
          </m.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <div className="absolute left-[50%] top-[50%] mx-auto flex w-full -translate-x-[50%] -translate-y-[50%] items-center justify-center text-center transition duration-200 group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0">
          {icon}
        </div>

        <h2
          className="relative z-10 mt-4 text-3xl font-bold opacity-0 transition duration-200 group-hover/canvas-card:-translate-y-2 group-hover/canvas-card:text-white group-hover/canvas-card:opacity-100"
          style={{color: '#e4ecff'}}
        >
          {title}
        </h2>

        <p
          className="relative z-10 mt-4 text-sm font-bold opacity-0 transition duration-200 group-hover/canvas-card:-translate-y-2 group-hover/canvas-card:text-white group-hover/canvas-card:opacity-100"
          style={{color: '#e4ecff'}}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export const Icon = ({className, ...props}: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
