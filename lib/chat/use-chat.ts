import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { createChatEngine } from '@/lib/chat/chat-engine';
import { getFlowProgress } from '@/lib/chat/contact-flow';
import type { ChatController, UseChatOptions } from '@/lib/chat/types';

/** Conversation state of the assistant. The work happens in chat-engine.ts; this binds it to React and next-intl. */
export const useChat = ({ locale, welcomeScenario = null }: UseChatOptions): ChatController => {
  const t = useTranslations('common.askBohdan');
  const tChat = useTranslations('chat');

  const [engine] = useState(() => createChatEngine({ t, tChat, locale, welcomeScenario }));

  useEffect(() => {
    engine.setEnv({ t, tChat, locale, welcomeScenario });
  });

  useEffect(() => {
    engine.attach();

    return () => engine.detach();
  }, [engine]);

  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);

  const contactFlow = useMemo(
    () => (snapshot.flow ? getFlowProgress(snapshot.flow) : null),
    [snapshot.flow]
  );

  return useMemo(
    () => ({
      messages: snapshot.messages,
      phase: snapshot.phase,
      statusStep: snapshot.statusStep,
      contactFlow,
      send: engine.send,
      stop: engine.stop,
      retry: engine.retry,
      reset: engine.reset,
      startContactFlow: engine.startContactFlow,
      cancelContactFlow: engine.cancelContactFlow
    }),
    [engine, snapshot.messages, snapshot.phase, snapshot.statusStep, contactFlow]
  );
};
