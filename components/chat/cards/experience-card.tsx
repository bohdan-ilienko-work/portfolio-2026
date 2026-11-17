import { useLocale, useTranslations } from 'next-intl';
import { useId } from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

import {
  CardShell,
  actionLabelClass,
  cardAction,
  cardBodyClass,
  cardTitleClass
} from '@/components/chat/cards/card-shell';
import { MicroLabel } from '@/components/chat/ui';
import {
  companyInitial,
  formatExperiencePeriod,
  parseExperienceTitle,
  splitExperienceDescription
} from '@/lib/chat/card-registry';
import type { ExperienceCardData } from '@/lib/chat/card-registry';
import type { SectionId } from '@/lib/chat/protocol';
import { cn } from '@/lib/utils';

type ExperienceCardProps = { data: ExperienceCardData; onNavigate: (section: SectionId) => void };

export const ExperienceCard = ({ data, onNavigate }: ExperienceCardProps) => {
  const locale = useLocale();
  const tCards = useTranslations('chat.cards');
  const tExperience = useTranslations('experience');
  // "View on the page" alone does not say which job: the company is its description.
  const titleId = useId();

  // The site stores "<role>, <company>, <type>" and "<period> (middle dot) <scope>" as one string each.
  const { company, details } = parseExperienceTitle(tExperience(data.titleKey));
  const { period, scope } = splitExperienceDescription(tExperience(data.descriptionKey));
  const periodLabel = period ? formatExperiencePeriod(period, locale, tCards('present')) : '';

  return (
    <CardShell>
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="flex size-8 shrink-0 select-none items-center justify-center rounded-[8px] border border-[--border-medium] bg-[--surface-3] text-[13px] font-semibold leading-none text-[--text-primary]"
        >
          {companyInitial(company)}
        </span>

        <div className="min-w-0 flex-1">
          <p id={titleId} className={cn(cardTitleClass, 'line-clamp-2')}>
            {company}
          </p>
          {details ? <p className={cn(cardBodyClass, 'mt-0.5 line-clamp-2')}>{details}</p> : null}
        </div>
      </div>

      {periodLabel ? <MicroLabel className="mt-2.5 block [overflow-wrap:anywhere]">{periodLabel}</MicroLabel> : null}

      {scope ? <p className={cn(cardBodyClass, 'line-clamp-3', periodLabel ? 'mt-1.5' : 'mt-2.5')}>{scope}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onNavigate('experience')}
          aria-describedby={titleId}
          className={cardAction('secondary')}
        >
          <span className={actionLabelClass}>{tCards('viewOnPage')}</span>
          <LuArrowUpRight aria-hidden className="size-3.5 shrink-0" />
        </button>
      </div>
    </CardShell>
  );
};
