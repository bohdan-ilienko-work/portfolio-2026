'use client';

import { useTranslations } from 'next-intl';
import { memo } from 'react';

import { ChatCards } from '@/components/chat/cards/chat-cards';
import { ChatError } from '@/components/chat/chat-error';
import { ChatFollowUps } from '@/components/chat/chat-followups';
import { ChatSources } from '@/components/chat/chat-sources';
import { ChatThinking } from '@/components/chat/chat-thinking';
import { MarkdownLite } from '@/components/chat/markdown-lite';
import type { CardRef, SectionId } from '@/lib/chat/protocol';
import type { ChatMessage, ChatStatusStep } from '@/lib/chat/types';

type ChatMessageViewProps = {
  message: ChatMessage;
  /** Only the last message can be waiting for its first token. */
  statusStep: ChatStatusStep | null;
  canFollowUp: boolean;
  canRetry: boolean;
  onNavigate: (section: SectionId) => void;
  /** Undefined while a contact request is being written: a second request cannot start. */
  onStartRequest?: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
};

const CONTACT_CARDS: CardRef[] = [{ kind: 'contact' }];

const ChatMessageBase = ({
  message,
  statusStep,
  canFollowUp,
  canRetry,
  onNavigate,
  onStartRequest,
  onRetry,
  onFollowUp,
}: ChatMessageViewProps) => {
  const t = useTranslations('chat');

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-[10px] rounded-br-[4px] border border-[--border-subtle] bg-[--surface-2] px-3 py-2 text-[13px] leading-[1.5] text-[--text-primary] [overflow-wrap:anywhere]">
          {message.text}
        </p>
      </div>
    );
  }

  const streaming = message.status === 'streaming';
  const failed = message.status === 'error';
  const cards = message.cards ?? [];

  return (
    <div className="min-w-0 [overflow-wrap:anywhere]">
      {streaming && !message.text ? (
        <ChatThinking step={statusStep} />
      ) : (
        message.text && (
          <MarkdownLite
            text={message.text}
            streaming={streaming}
            className="text-[14px] leading-[1.6] text-[--text-primary]"
          />
        )
      )}

      {failed && <ChatError code={message.error ?? 'unavailable'} onRetry={canRetry ? onRetry : undefined} />}

      {failed && message.error === 'unavailable' && (
        <>
          <p className="mt-3 text-[13px] leading-[1.5] text-[--text-secondary]">{t('errors.contactFallback')}</p>
          <div className="mt-2">
            <ChatCards cards={CONTACT_CARDS} onStartRequest={onStartRequest} onNavigate={onNavigate} />
          </div>
        </>
      )}

      {!streaming && cards.length > 0 && (
        <div className="mt-3">
          <ChatCards cards={cards} onStartRequest={onStartRequest} onNavigate={onNavigate} />
        </div>
      )}

      {!streaming && message.sources && <ChatSources sources={message.sources} onNavigate={onNavigate} />}

      {canFollowUp && message.followUps && <ChatFollowUps items={message.followUps} onPick={onFollowUp} />}
    </div>
  );
};

export const ChatMessageView = memo(ChatMessageBase);
