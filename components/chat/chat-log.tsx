'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { ChatMessageView } from '@/components/chat/chat-message';
import type { SectionId } from '@/lib/chat/protocol';
import type { ChatMessage, ChatPhase, ChatStatusStep } from '@/lib/chat/types';

const STICK_THRESHOLD_PX = 80;

type ChatLogProps = {
  messages: ChatMessage[];
  phase: ChatPhase;
  statusStep: ChatStatusStep | null;
  flowActive: boolean;
  /** `getAnnounceKey` of the last message when the panel opened: that answer is already known, so it stays silent. */
  quietKey: string | null;
  onNavigate: (section: SectionId) => void;
  onStartRequest: () => void;
  onRetry: () => void;
  onFollowUp: (text: string) => void;
};

/** A question and what answered it: they sit closer together than two exchanges do. */
const groupExchanges = (messages: ChatMessage[]): ChatMessage[][] => {
  const groups: ChatMessage[][] = [];

  for (const message of messages) {
    const current = groups[groups.length - 1];

    if (message.role === 'user' || !current) groups.push([message]);
    else current.push(message);
  }

  return groups;
};

/** What a screen reader should say for an answer: the Markdown markers would be read out as symbols. */
const toPlainText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[ \t]*[-*•][ \t]+/gm, '');

const getLastUserId = (messages: ChatMessage[]): string | undefined => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') return messages[index].id;
  }
};

/** A message in its current state: the live region speaks an answer when this key changes to a finished one. */
export const getAnnounceKey = (message: ChatMessage | undefined) => (message ? `${message.id}:${message.status}` : null);

// The page sets `scroll-behavior: smooth !important` on every element, which would make streaming jitter; the log opts
// out with `!scroll-auto`, so assigning scrollTop is instant.
const scrollToBottom = (element: HTMLElement | null) => {
  if (element) element.scrollTop = element.scrollHeight;
};

export const ChatLog = ({
  messages,
  phase,
  statusStep,
  flowActive,
  quietKey,
  onNavigate,
  onStartRequest,
  onRetry,
  onFollowUp,
}: ChatLogProps) => {
  const t = useTranslations('chat');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stickRef = useRef(true);
  const [armed, setArmed] = useState(false);

  const groups = useMemo(() => groupExchanges(messages), [messages]);
  const last = messages[messages.length - 1];
  const lastUserId = getLastUserId(messages);
  const seenUserId = useRef(lastUserId);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    stickRef.current = element.scrollHeight - element.scrollTop - element.clientHeight <= STICK_THRESHOLD_PX;
  };

  // The content grows while an answer streams and when cards mount; the scroller shrinks when the keyboard comes up or
  // the composer grows, and its content does not change then. Follow both only while the reader is at the bottom, so
  // scrolling up to reread is never undone. Observing also positions a restored conversation.
  useEffect(() => {
    const content = contentRef.current;
    const scroller = scrollRef.current;
    if (!content || !scroller) return;

    const observer = new ResizeObserver(() => {
      if (stickRef.current) scrollToBottom(scroller);
    });
    observer.observe(content);
    observer.observe(scroller);

    return () => observer.disconnect();
  }, []);

  // A question the visitor just sent always scrolls into view.
  useLayoutEffect(() => {
    if (lastUserId === seenUserId.current) return;

    seenUserId.current = lastUserId;
    stickRef.current = true;
    scrollToBottom(scrollRef.current);
  }, [lastUserId]);

  // The live region starts speaking after mount, so text that appears together with it is not lost to screen readers
  // that skip a region's initial content. What was already there when the panel opened is kept silent by `quietKey`.
  useEffect(() => setArmed(true), []);

  let announcement = '';
  if (armed && phase === 'thinking' && statusStep) announcement = t(`status.${statusStep}`);
  if (armed && phase === 'idle' && last?.role === 'assistant' && getAnnounceKey(last) !== quietKey) {
    if (last.status === 'done') announcement = toPlainText(last.text);
    if (last.status === 'error') announcement = t(last.error === 'rate_limited' ? 'errors.rateLimited' : 'errors.generic');
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        role="log"
        aria-live="off"
        aria-label={t('a11y.conversation')}
        tabIndex={0}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain !scroll-auto px-4 py-4 [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[--chat-accent]"
      >
        <div ref={contentRef} className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group[0].id} className="flex flex-col gap-3">
              {group.map((message) => {
                const isLast = message === last;

                return (
                  <ChatMessageView
                    key={message.id}
                    message={message}
                    statusStep={isLast ? statusStep : null}
                    canFollowUp={isLast && message.role === 'assistant' && phase === 'idle' && !flowActive}
                    canRetry={isLast && message.status === 'error'}
                    onNavigate={onNavigate}
                    onStartRequest={flowActive ? undefined : onStartRequest}
                    onRetry={onRetry}
                    onFollowUp={onFollowUp}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div role="status" className="sr-only">
        {announcement}
      </div>
    </div>
  );
};
