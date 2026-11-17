'use client';

import dynamic from 'next/dynamic';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { ChatTrigger } from '@/components/chat/chat-trigger';
import { useIsMac } from '@/components/chat/use-is-mac';
import { useFooterAvoidance } from '@/lib/chat/use-footer-avoidance';

const OPEN_EVENT = 'open-ask-bohdan';

const ChatRoot = lazy(() => import('@/components/chat/chat-root').then((m) => ({ default: m.ChatRoot })));

// The first version of the assistant stays reachable at ?chat=legacy.
const LegacyChatDynamic = dynamic(
  () => import('@/components/ask-bohdan-chat').then((m) => ({ default: m.AskBohdanChat })),
  { ssr: false },
);

// Cyrillic layouts report "л" for the physical K key. Layouts that move K to another Latin key keep their mapping.
const isShortcutKey = (event: KeyboardEvent) =>
  event.key?.toLowerCase() === 'k' || (event.code === 'KeyK' && !/^[a-z]$/i.test(event.key ?? ''));

const CurrentChat = () => {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const { ref: containerRef, offsetPx } = useFooterAvoidance(open);
  const isMac = useIsMac();

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const openChat = useCallback(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body && !panelRef.current?.contains(active)) {
      openerRef.current = active;
    }

    setHasOpened(true);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing) return;

      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && isShortcutKey(event)) {
        event.preventDefault();
        if (event.repeat) return;

        if (open) close();
        else openChat();
        return;
      }

      if (event.key === 'Escape' && !event.defaultPrevented) close();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_EVENT, openChat);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_EVENT, openChat);
    };
  }, [close, open, openChat]);

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] transition-[bottom] duration-200 ease-out motion-reduce:transition-none"
      style={{
        right: 'calc(env(safe-area-inset-right) + clamp(0.75rem, 2vw, 3rem))',
        bottom: `calc(env(safe-area-inset-bottom) + clamp(0.75rem, 2vw, 3rem) + ${offsetPx}px)`,
      }}
    >
      {hasOpened && (
        <Suspense fallback={open ? <ChatTrigger isMac={isMac} pending onClick={openChat} /> : null}>
          <ChatRoot open={open} onClose={close} triggerRef={triggerRef} openerRef={openerRef} panelRef={panelRef} />
        </Suspense>
      )}
      {!open && <ChatTrigger ref={triggerRef} isMac={isMac} onClick={openChat} />}
    </div>
  );
};

export const AskBohdanChatWrapper = () => {
  const [variant, setVariant] = useState<'current' | 'legacy' | null>(null);

  // The query-dependent variant is only known on the client.
  useEffect(() => {
    setVariant(new URLSearchParams(window.location.search).get('chat') === 'legacy' ? 'legacy' : 'current');
  }, []);

  if (variant === 'legacy') return <LegacyChatDynamic />;
  if (variant === 'current') return <CurrentChat />;
  return null;
};
