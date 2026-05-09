'use client';

import dynamic from 'next/dynamic';

const AskBohdanChatDynamic = dynamic(
  () => import('@/components/ask-bohdan-chat').then((m) => ({default: m.AskBohdanChat})),
  {ssr: false},
);

export const AskBohdanChatWrapper = () => <AskBohdanChatDynamic />;
