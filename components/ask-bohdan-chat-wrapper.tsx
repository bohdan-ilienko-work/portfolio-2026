'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ChatRootDynamic = dynamic(
  () => import('@/components/chat/chat-root').then((m) => ({default: m.ChatRoot})),
  {ssr: false},
);

// The first version of the assistant stays reachable at ?chat=legacy.
const LegacyChatDynamic = dynamic(
  () => import('@/components/ask-bohdan-chat').then((m) => ({default: m.AskBohdanChat})),
  {ssr: false},
);

export const AskBohdanChatWrapper = () => {
  const [variant, setVariant] = useState<'current' | 'legacy' | null>(null);
  const [openRequested, setOpenRequested] = useState(false);

  // Read after mount so the server render and the first client render both show nothing.
  useEffect(() => {
    setVariant(new URLSearchParams(window.location.search).get('chat') === 'legacy' ? 'legacy' : 'current');
  }, []);

  // The nav button can be clicked while the chat chunk is still loading, before the chat listens for the event. This
  // wrapper is mounted by then, so it keeps the request and hands it to the chat as its starting state.
  useEffect(() => {
    const onOpen = () => setOpenRequested(true);

    window.addEventListener('open-ask-bohdan', onOpen);

    return () => window.removeEventListener('open-ask-bohdan', onOpen);
  }, []);

  if (variant === 'legacy') return <LegacyChatDynamic />;
  if (variant === 'current') return <ChatRootDynamic initialOpen={openRequested} />;

  return null;
};
