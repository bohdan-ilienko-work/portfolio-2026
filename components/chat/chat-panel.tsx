'use client';

import { motion, type MotionStyle } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState, type KeyboardEvent, type Ref, type RefObject } from 'react';

import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatEmpty } from '@/components/chat/chat-empty';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatLog, getAnnounceKey } from '@/components/chat/chat-log';
import { useVisualViewport, type VisualViewportBox } from '@/components/chat/use-visual-viewport';
import type { SectionId } from '@/lib/chat/protocol';
import type { ChatController, SendOptions } from '@/lib/chat/types';
import { cn } from '@/lib/utils';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type ChatPanelVariant = 'popover' | 'sheet';

type ChatPanelProps = {
  variant: ChatPanelVariant;
  reduceMotion: boolean;
  chat: ChatController;
  draft: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  onPick: (text: string, options?: SendOptions) => void;
  onNewChat: () => void;
  onStartRequest: () => void;
  onNavigate: (section: SectionId) => void;
  onClose: () => void;
  panelRef: Ref<HTMLElement>;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

const getMotion = (variant: ChatPanelVariant, reduceMotion: boolean) => {
  const offset = variant === 'sheet' ? 24 : 8;
  const scale = variant === 'sheet' ? 1 : 0.98;
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, y: offset, scale };

  return {
    initial: hidden,
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: hidden,
    transition: { duration: reduceMotion ? 0 : 0.16, ease: 'easeOut' as const },
  };
};

// The popover grows from the corner it sits in; the sheet follows the visible area while the keyboard is up.
const getStyle = (isSheet: boolean, keyboard: VisualViewportBox | null): MotionStyle | undefined => {
  if (!isSheet) return { originX: 1, originY: 1 };

  return keyboard ? { bottom: keyboard.bottom, height: Math.min(keyboard.height * 0.92, 720) } : undefined;
};

export const ChatPanel = ({
  variant,
  reduceMotion,
  chat,
  draft,
  onDraftChange,
  onSubmit,
  onPick,
  onNewChat,
  onStartRequest,
  onNavigate,
  onClose,
  panelRef,
  textareaRef,
}: ChatPanelProps) => {
  const t = useTranslations('common.askBohdan');
  const isSheet = variant === 'sheet';
  const hasMessages = chat.messages.length > 0;
  const keyboard = useVisualViewport(isSheet);
  // Taken once per open: the answer that is already on screen is not read aloud again by the log's live region.
  const [quietKey] = useState(() => getAnnounceKey(chat.messages[chat.messages.length - 1]));

  // The sheet is modal: keep Tab inside it. The popover is not, so Tab leaves it as on any page.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isSheet || event.key !== 'Tab') return;

    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => element.getClientRects().length > 0,
    );
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <motion.section
      ref={panelRef}
      id="ask-bohdan-panel"
      role="dialog"
      aria-label={t('aria.chatPanel')}
      aria-modal={isSheet || undefined}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={getStyle(isSheet, keyboard)}
      className={cn(
        'flex flex-col overflow-hidden border border-[--border-medium] bg-[--surface-1] [box-shadow:var(--shadow-popup)] outline-none',
        // The popover is out of flow so the trigger that mounts while it fades out cannot push it up.
        isSheet
          ? 'fixed inset-x-0 bottom-0 h-[min(92dvh,720px)] rounded-t-2xl border-b-0'
          : 'absolute bottom-0 right-0 h-[min(680px,calc(100dvh-6rem))] w-[420px] max-w-[calc(100vw-1.5rem)] rounded-2xl',
      )}
      {...getMotion(variant, reduceMotion)}
    >
      <ChatHeader hasMessages={hasMessages} onNewChat={onNewChat} onClose={onClose} />

      {hasMessages ? (
        <ChatLog
          messages={chat.messages}
          phase={chat.phase}
          statusStep={chat.statusStep}
          flowActive={chat.contactFlow !== null}
          quietKey={quietKey}
          onNavigate={onNavigate}
          onStartRequest={onStartRequest}
          onRetry={chat.retry}
          onFollowUp={onPick}
        />
      ) : (
        <ChatEmpty onPick={onPick} />
      )}

      <ChatComposer
        value={draft}
        onChange={onDraftChange}
        onSubmit={onSubmit}
        onStop={chat.stop}
        busy={chat.phase === 'thinking' || chat.phase === 'streaming'}
        flow={chat.contactFlow}
        onCancelFlow={chat.cancelContactFlow}
        textareaRef={textareaRef}
      />
    </motion.section>
  );
};
