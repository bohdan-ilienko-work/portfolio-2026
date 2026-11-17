'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { ChatPanel } from '@/components/chat/chat-panel';
import { useMediaQuery } from '@/components/chat/use-media-query';
import { SECTION_ANCHORS, type SectionId } from '@/lib/chat/protocol';
import type { SendOptions } from '@/lib/chat/types';
import { useChat } from '@/lib/chat/use-chat';

const MOBILE_QUERY = '(max-width: 639px)';

const scrollToSection = (section: SectionId) => {
  document.querySelector(SECTION_ANCHORS[section])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

type ChatRootProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  openerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
};

/** The popover on desktop and bottom sheet on phones. It stays mounted between opens to keep the conversation. */
export const ChatRoot = ({ open: requestedOpen, onClose, triggerRef, openerRef, panelRef }: ChatRootProps) => {
  const locale = useLocale();
  const chat = useChat({ locale });
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const reduceMotion = useReducedMotion() ?? false;
  const [draft, setDraft] = useState('');
  const [ready, setReady] = useState(false);

  // useChat restores the session during its first effect. Mount the live region with that history already in place.
  useEffect(() => setReady(true), []);
  const open = ready && requestedOpen;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wasOpenRef = useRef(false);
  const lastFocusedRef = useRef<Element | null>(null);
  const pendingSectionRef = useRef<SectionId | null>(null);

  const { send, reset, startContactFlow } = chat;

  // The sheet covers the page, so the page behind it must not scroll.
  useEffect(() => {
    if (!open || !isMobile) return;

    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';

    return () => {
      root.style.overflow = previous;
    };
  }, [open, isMobile]);

  // Focus goes into the panel when it opens and back to where it came from (the trigger when that is gone) when it
  // closes. On phones it goes to the panel itself: focusing the textarea would raise the keyboard over the starters.
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      wasOpenRef.current = true;
      (isMobile ? panelRef.current : textareaRef.current)?.focus({ preventScroll: true });
    } else if (!open && wasOpenRef.current) {
      wasOpenRef.current = false;

      const opener = openerRef.current;
      openerRef.current = null;

      if (opener?.isConnected) opener.focus({ preventScroll: true });
      if (document.activeElement !== opener) triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open, isMobile, openerRef, panelRef, triggerRef]);

  // A control that unmounts while it holds focus (Stop turns into Send, Retry and Cancel vanish, a chip goes with its
  // answer) drops focus on <body>, and on the modal sheet the next Tab would leave the dialog. So the focus inside the
  // panel is tracked and, when its element is gone, moves to the composer (the panel itself on touch, where focusing
  // the textarea would raise the keyboard). Clicking the page behind the popover is a choice, not a loss.
  useEffect(() => {
    if (!open) return;

    const onFocusIn = (event: FocusEvent) => {
      lastFocusedRef.current = panelRef.current?.contains(event.target as Node) ? (event.target as Element) : null;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) lastFocusedRef.current = null;
    };

    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('pointerdown', onPointerDown, true);

    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('pointerdown', onPointerDown, true);
      lastFocusedRef.current = null;
    };
  }, [open, panelRef]);

  useLayoutEffect(() => {
    const lost = lastFocusedRef.current;
    if (!open || !lost || lost.isConnected) return;
    if (document.activeElement && document.activeElement !== document.body) return;

    lastFocusedRef.current = null;
    (!isMobile && window.matchMedia('(pointer: fine)').matches ? textareaRef : panelRef).current?.focus({
      preventScroll: true,
    });
  });

  // "Show on the page" from the sheet: scroll once the sheet is gone and the page can scroll again.
  useEffect(() => {
    const section = pendingSectionRef.current;
    if (open || !section) return;

    pendingSectionRef.current = null;
    scrollToSection(section);
  }, [open]);

  const focusComposer = useCallback(() => {
    if (!isMobile) textareaRef.current?.focus({ preventScroll: true });
  }, [isMobile]);

  const handleSubmit = () => {
    if (send(draft)) setDraft('');
  };

  const handlePick = useCallback(
    (text: string, options?: SendOptions) => {
      if (send(text, options)) focusComposer();
    },
    [send, focusComposer],
  );

  const handleStartRequest = useCallback(() => {
    startContactFlow();
    focusComposer();
  }, [startContactFlow, focusComposer]);

  const handleNewChat = useCallback(() => {
    reset();
    setDraft('');
    focusComposer();
  }, [reset, focusComposer]);

  const handleNavigate = useCallback(
    (section: SectionId) => {
      if (!isMobile) {
        scrollToSection(section);
        return;
      }

      pendingSectionRef.current = section;
      onClose();
    },
    [isMobile, onClose],
  );

  return (
    <>
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            key="backdrop"
            aria-hidden
            className="fixed inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.16 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <ChatPanel
            key="panel"
            variant={isMobile ? 'sheet' : 'popover'}
            reduceMotion={reduceMotion}
            chat={chat}
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={handleSubmit}
            onPick={handlePick}
            onNewChat={handleNewChat}
            onStartRequest={handleStartRequest}
            onNavigate={handleNavigate}
            onClose={onClose}
            panelRef={panelRef}
            textareaRef={textareaRef}
          />
        )}
      </AnimatePresence>
    </>
  );
};
