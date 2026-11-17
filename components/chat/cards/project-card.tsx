import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { LuArrowUpRight } from 'react-icons/lu';

import {
  CardShell,
  ChipList,
  actionLabelClass,
  cardAction,
  cardBodyClass,
  cardTitleClass
} from '@/components/chat/cards/card-shell';
import type { ProjectCardData } from '@/lib/chat/card-registry';
import { cn } from '@/lib/utils';

type ProjectCardProps = { data: ProjectCardData };

export const ProjectCard = ({ data }: ProjectCardProps) => {
  const tCards = useTranslations('chat.cards');
  const tProjects = useTranslations('projects');
  // "Source" and "Open" alone say nothing in a list of links: the title is their description.
  const titleId = useId();

  return (
    <CardShell>
      <div className="flex min-w-0 items-start gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-[8px] border border-[--border-subtle] bg-[--surface-3]">
          <Image
            src={data.image}
            alt=""
            fill
            sizes="56px"
            className={cn('object-cover', data.imagePosition === 'top' ? 'object-top' : 'object-center')}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p id={titleId} className={cn(cardTitleClass, 'line-clamp-2')}>
            {tProjects(data.titleKey)}
          </p>
          <p className={cn(cardBodyClass, 'mt-0.5 line-clamp-2')}>{tProjects(data.descriptionKey)}</p>
        </div>
      </div>

      {data.tech.length > 0 ? <ChipList items={data.tech} size="sm" className="mt-2.5" /> : null}

      {data.live || data.source ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.live ? (
            <a
              href={data.live.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby={titleId}
              className={cardAction('primary')}
            >
              <span className={actionLabelClass}>
                {data.live.labelKey ? tProjects(data.live.labelKey) : tCards('open')}
              </span>
              <LuArrowUpRight aria-hidden className="size-3.5 shrink-0" />
            </a>
          ) : null}

          {data.source ? (
            <a
              href={data.source.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby={titleId}
              className={cardAction('secondary')}
            >
              <span className={actionLabelClass}>{tCards('source')}</span>
              <LuArrowUpRight aria-hidden className="size-3.5 shrink-0" />
            </a>
          ) : null}
        </div>
      ) : null}
    </CardShell>
  );
};
