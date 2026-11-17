import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { LuArrowUpRight, LuDownload, LuFileText } from 'react-icons/lu';

import { CardShell, actionLabelClass, cardAction, cardTitleClass } from '@/components/chat/cards/card-shell';
import { monoFont } from '@/components/chat/ui';
import { getCvCardData } from '@/lib/chat/card-registry';
import { cn } from '@/lib/utils';

export const CvCard = () => {
  const t = useTranslations('chat.cards.cv');
  const cv = getCvCardData();
  // "Download" and "Open in Drive" alone do not say what they open: the card title is their description.
  const titleId = useId();

  return (
    <CardShell>
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[--border-subtle] bg-[--surface-3] text-[--text-secondary]"
        >
          <LuFileText className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p id={titleId} className={cardTitleClass}>
            {t('title')}
          </p>
          <p className={cn(monoFont, 'mt-1 line-clamp-2 text-[11px] leading-[1.45] text-[--text-muted] [overflow-wrap:anywhere]')}>
            {cv.fileName}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a href={cv.fileHref} download={cv.fileName} aria-describedby={titleId} className={cardAction('primary')}>
          <LuDownload aria-hidden className="size-3.5 shrink-0" />
          <span className={actionLabelClass}>{t('download')}</span>
        </a>

        <a
          href={cv.driveHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-describedby={titleId}
          className={cardAction('secondary')}
        >
          <span className={actionLabelClass}>{t('drive')}</span>
          <LuArrowUpRight aria-hidden className="size-3.5 shrink-0" />
        </a>
      </div>
    </CardShell>
  );
};
