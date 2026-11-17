'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ChatPanel } from '@/components/chat/chat-panel';
import { ChatTrigger } from '@/components/chat/chat-trigger';
import { useIsMac } from '@/components/chat/use-is-mac';
import { useMediaQuery } from '@/components/chat/use-media-query';
import { SECTION_ANCHORS, type SectionId } from '@/lib/chat/protocol';
import type { SendOptions } from '@/lib/chat/types';
import { useChat } from '@/lib/chat/use-chat';
import { useFooterAvoidance } from '@/lib/chat/use-footer-avoidance';

const MOBILE_QUERY = '(max-width: 639px)';
const OPEN_EVENT = 'open-ask-bohdan';

const scrollToSection = (section: SectionId) => {
  document.querySelector(SECTION_ANCHORS[section])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// The chord is the physical K key. On a Cyrillic layout (ru, uk, bg) it reports "л", so the letter alone would miss
// it; a different Latin letter on that key (Dvorak, Colemak) is a layout that really moved K, and stays the browser's.
const isShortcutKey = (event: KeyboardEvent) =>
  event.key?.toLowerCase() === 'k' || (event.code === 'KeyK' && !/^[a-z]$/i.test(event.key ?? ''));

type ChatRootProps = {
  /** The chat was asked for (nav button, event) before this chunk finished loading. */
  initialOpen?: boolean;
};

/** The floating assistant: a trigger that opens a panel (a popover on desktop, a bottom sheet on phones). */
export const ChatRoot = ({ initialOpen = false }: ChatRootProps) => {
  const locale = useLocale();
  const chat = useChat({ locale });
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const isMac = useIsMac();
  const reduceMotion = useReducedMotion() ?? false;

  const [open, setOpen] = useState(initialOpen);
  const [draft, setDraft] = useState('');
  const { ref: containerRef, offsetPx } = useFooterAvoidance(open);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wasOpenRef = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const lastFocusedRef = useRef<Element | null>(null);
  const pendingSectionRef = useRef<SectionId | null>(null);

  const { send, reset, startContactFlow } = chat;

  const close = useCallback(() => setOpen(false), []);

  // Where focus was when the chat was asked for, so closing returns there and not to the floating trigger.
  const rememberOpener = useCallback(() => {
    const active = document.activeElement;

    if (active instanceof HTMLElement && active !== document.body && !panelRef.current?.contains(active)) {
      openerRef.current = active;
    }
  }, []);

  const openChat = useCallback(() => {
    rememberOpener();
    setOpen(true);
  }, [rememberOpener]);

  // Ctrl/Cmd+K toggles from anywhere, including while typing in the composer; the nav's "Ask AI" button fires the event.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;

      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && isShortcutKey(event)) {
        event.preventDefault();

        if (!event.repeat) {
          rememberOpener();
          setOpen((value) => !value);
        }

        return;
      }

      if (event.key === 'Escape' && !event.defaultPrevented) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_EVENT, openChat);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_EVENT, openChat);
    };
  }, [openChat, rememberOpener]);

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
  }, [open, isMobile]);

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
  }, [open]);

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
      setOpen(false);
    },
    [isMobile],
  );

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] transition-[bottom] duration-200 ease-out motion-reduce:transition-none"
      style={{
        right: 'calc(env(safe-area-inset-right) + clamp(0.75rem, 2vw, 3rem))',
        bottom: `calc(env(safe-area-inset-bottom) + clamp(0.75rem, 2vw, 3rem) + ${offsetPx}px)`,
      }}
    >
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
            onClick={close}
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
            onClose={close}
            panelRef={panelRef}
            textareaRef={textareaRef}
          />
        )}
      </AnimatePresence>

      {!open && <ChatTrigger ref={triggerRef} isMac={isMac} reduceMotion={reduceMotion} onClick={openChat} />}
    </div>
  );
};
