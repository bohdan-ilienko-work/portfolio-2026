'use client';

import { useTranslations } from 'next-intl';

import type { ChatStatusStep } from '@/lib/chat/types';

type ChatThinkingProps = { step: ChatStatusStep | null };

/** Shown while the first token is on its way. The step text is announced through the log's live region. */
export const ChatThinking = ({ step }: ChatThinkingProps) => {
  const t = useTranslations('chat');

  return (
    <div className="flex flex-col gap-2.5 py-0.5">
      {step && <p className="text-[12px] leading-none text-[--text-muted]">{t(`status.${step}`)}</p>}
      <div aria-hidden className="flex flex-col gap-2">
        <div className="chat-shimmer h-2.5 w-[72%] rounded-full" />
        <div className="chat-shimmer h-2.5 w-[48%] rounded-full" />
      </div>
    </div>
  );
};
