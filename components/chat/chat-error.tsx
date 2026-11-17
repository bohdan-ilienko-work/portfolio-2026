'use client';

import { useTranslations } from 'next-intl';
import { LuCircleAlert } from 'react-icons/lu';

import { actionClass } from '@/components/chat/ui';
import type { ChatErrorCode } from '@/lib/chat/protocol';

type ChatErrorProps = {
  code: ChatErrorCode;
  /** Only the newest failed answer can be retried. */
  onRetry?: () => void;
};

/** A failed answer as a quiet row in the conversation, not a banner. The log's live region announces it. */
export const ChatError = ({ code, onRetry }: ChatErrorProps) => {
  const t = useTranslations('chat');

  return (
    <div className="mt-3 flex items-center gap-2 text-[13px] leading-[1.4] text-[--text-secondary]">
      <LuCircleAlert aria-hidden className="size-4 shrink-0 text-[--text-muted]" />
      <span className="min-w-0 flex-1">{code === 'rate_limited' ? t('errors.rateLimited') : t('errors.generic')}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className={actionClass()}>
          {t('errors.retry')}
        </button>
      )}
    </div>
  );
};
