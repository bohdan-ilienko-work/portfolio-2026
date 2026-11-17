'use client';

import { useTranslations } from 'next-intl';

import { focusRing } from '@/components/chat/ui';
import type { ContactFlowProgress } from '@/lib/chat/types';
import { cn } from '@/lib/utils';

type ChatFlowStripProps = {
  flow: ContactFlowProgress;
  onCancel: () => void;
};

/** Where the visitor is in the contact request, with a way out. Sits above the composer. */
export const ChatFlowStrip = ({ flow, onCancel }: ChatFlowStripProps) => {
  const t = useTranslations('chat');

  return (
    <div className="mb-2.5 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        {/* leading-4, not leading-none: `truncate` clips at the line box, which cuts the tails of g, p, y */}
        <p className="truncate text-[12px] leading-4 text-[--text-secondary]">
          {t('flow.progress', { current: flow.index, total: flow.total })}
        </p>
        <div aria-hidden className="mt-1.5 flex gap-1">
          {Array.from({ length: flow.total }, (_, index) => (
            <span
              key={index}
              className={cn('h-0.5 flex-1 rounded-full', index < flow.index ? 'bg-[--chat-accent]' : 'bg-[--border-medium]')}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className={cn(
          // 32px tall to hit with a thumb; the negative margins keep the strip as small as the label alone.
          '-my-1.5 -mr-1 min-h-8 shrink-0 rounded-[4px] px-2 text-[12px] leading-none text-[--text-secondary] underline-offset-2 transition-colors hover:text-[--text-primary] hover:underline',
          focusRing,
        )}
      >
        {t('flow.cancel')}
      </button>
    </div>
  );
};
