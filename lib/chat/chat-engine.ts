import {
  BARE_CONTACT_REGEX,
  BARE_RESUME_REGEX,
  createContactFlow,
  evaluateContactStep,
  submitContactRequest,
  type ContactFlowState
} from '@/lib/chat/contact-flow';
import {
  buildHistory,
  clearConversation,
  createMessage,
  loadConversation,
  saveConversation
} from '@/lib/chat/conversation';
import {
  CHAT_LIMITS,
  type CardRef,
  type ChatErrorCode,
  type ChatMeta,
  type ChatRequest,
  type ChatScenario
} from '@/lib/chat/protocol';
import { streamChat } from '@/lib/chat/stream-client';
import type { ChatMessage, ChatPhase, ChatStatusStep, SendOptions } from '@/lib/chat/types';

// Plain TypeScript on purpose: the async work (stream, contact flow) keeps its state in this closure, so no handler
// can act on a stale render. use-chat.ts subscribes React to it through useSyncExternalStore.

type Translate = (key: string) => string;

export type ChatEngineEnv = {
  /** common.askBohdan */
  t: Translate;
  /** chat */
  tChat: Translate;
  locale: string;
  welcomeScenario: ChatScenario | null;
};

export type ChatSnapshot = {
  messages: ChatMessage[];
  phase: ChatPhase;
  statusStep: ChatStatusStep | null;
  flow: ContactFlowState | null;
};

type Run = { controller: AbortController; messageId: string };

const INITIAL_SNAPSHOT: ChatSnapshot = { messages: [], phase: 'idle', statusStep: null, flow: null };

const normalizeText = (text: string) => text.toLowerCase().replace(/[\s.!?¿¡]+/g, ' ').trim();

const toMetaPatch = (meta: ChatMeta | null): Partial<ChatMessage> => {
  if (!meta) return {};

  const intentCard: CardRef | null =
    meta.intent === 'contact' ? { kind: 'contact' } : meta.intent === 'resume' ? { kind: 'cv' } : null;
  const cards =
    intentCard && !meta.cards.some((card) => card.kind === intentCard.kind)
      ? [...meta.cards, intentCard].slice(-CHAT_LIMITS.maxCards)
      : meta.cards;

  return {
    ...(cards.length ? { cards } : {}),
    ...(meta.sources.length ? { sources: meta.sources } : {}),
    ...(meta.followUps.length ? { followUps: meta.followUps } : {})
  };
};

export const createChatEngine = (initialEnv: ChatEngineEnv) => {
  let env = initialEnv;
  let state = INITIAL_SNAPSHOT;
  let run: Run | null = null;
  let pendingText = '';
  let frame: number | null = null;
  let lastRequest: { text: string; options: SendOptions } | null = null;
  let hydrated = false;

  const listeners = new Set<() => void>();

  const commit = (next: Partial<ChatSnapshot>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };

  const patchMessage = (id: string, patch: Partial<ChatMessage>, rest: Partial<ChatSnapshot> = {}) =>
    commit({ ...rest, messages: state.messages.map((message) => (message.id === id ? { ...message, ...patch } : message)) });

  const cancelFrame = () => {
    if (frame === null) return;
    cancelAnimationFrame(frame);
    frame = null;
  };

  // Deltas are buffered and applied once per animation frame, so a fast stream does not re-render per token.
  const flushPending = (messageId: string) => {
    cancelFrame();
    if (!pendingText) return;

    const chunk = pendingText;
    pendingText = '';
    commit({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, text: message.text + chunk } : message
      )
    });
  };

  const scheduleFlush = (messageId: string) => {
    if (frame !== null) return;

    frame = requestAnimationFrame(() => {
      frame = null;
      flushPending(messageId);
    });
  };

  const settle = (target: Run, patch: Partial<ChatMessage>, flow?: ContactFlowState | null) => {
    if (run !== target) return;

    run = null;
    patchMessage(target.messageId, patch, {
      phase: 'idle',
      statusStep: null,
      ...(flow === undefined ? {} : { flow })
    });
    saveConversation(state.messages);
  };

  const fail = (target: Run, code: ChatErrorCode) => {
    if (run !== target) return;

    flushPending(target.messageId);
    settle(target, { status: 'error', error: code });
  };

  const finish = (target: Run, meta: ChatMeta | null) => {
    if (run !== target) return;

    flushPending(target.messageId);

    const answered = state.messages.some((message) => message.id === target.messageId && message.text.trim());
    if (!answered) {
      settle(target, { status: 'error', error: 'unavailable' });
      return;
    }

    settle(target, { status: 'done', ...toMetaPatch(meta) });
  };

  const beginRun = (user: ChatMessage, placeholder: ChatMessage, statusStep: ChatStatusStep | null): Run => {
    const started: Run = { controller: new AbortController(), messageId: placeholder.id };

    run = started;
    pendingText = '';
    commit({ messages: [...state.messages, user, placeholder], phase: 'thinking', statusStep });

    return started;
  };

  const runStream = async (target: Run, request: ChatRequest) => {
    let meta: ChatMeta | null = null;
    let streaming = false;

    try {
      for await (const event of streamChat(request, target.controller.signal)) {
        if (run !== target) return;

        if (event.t === 'status') {
          if (!streaming) commit({ statusStep: event.step });
        } else if (event.t === 'delta') {
          if (!event.text) continue;

          pendingText += event.text;

          if (!streaming) {
            streaming = true;
            commit({ phase: 'streaming', statusStep: null });
            flushPending(target.messageId);
          } else {
            scheduleFlush(target.messageId);
          }
        } else if (event.t === 'meta') {
          meta = event.meta;
        } else if (event.t === 'error') {
          fail(target, event.code);
          return;
        } else {
          finish(target, meta);
          return;
        }
      }
    } catch {
      // handled below: a run that is still current ended without done/error
    }

    fail(target, 'unavailable');
  };

  const runContactStep = async (target: Run, flow: ContactFlowState, text: string) => {
    const outcome = await evaluateContactStep(flow, text, target.controller.signal);
    if (run !== target) return;

    const reply = (key: string) => env.t(`contactFlow.${key}`);

    switch (outcome.type) {
      case 'cancelled':
        settle(target, { text: reply('cancelled'), status: 'done' }, null);
        return;
      case 'abusive':
        settle(target, { text: reply('abusive'), status: 'done' }, null);
        return;
      case 'retry':
        settle(target, { text: reply(outcome.messageKey), status: 'done' });
        return;
      case 'next':
        settle(target, { text: reply(outcome.messageKey), status: 'done' }, outcome.flow);
        return;
      case 'complete':
        // Telegram may already have the message when Stop is pressed and an aborted fetch cannot take it back, so from
        // here the request is only waited for: stop() and cancelContactFlow() ignore it, and reset() leaves it running.
        commit({ phase: 'sending' });

        try {
          await submitContactRequest(outcome.draft);
        } catch {
          // The flow stays on its last step, so the visitor can send the answer again.
          settle(target, { text: reply('error'), status: 'done', cards: [{ kind: 'contact' }] });
          return;
        }

        settle(target, { text: reply('success'), status: 'done' }, null);
    }
  };

  // Local replies skip the model, so only a request that cannot mean anything else gets one: the two starter rows
  // (compared in the visitor's language) and a message that is just "contact" or "CV". Anything longer that mentions a
  // hire, a call or Telegram goes to the model, which adds the same cards through meta.
  const findLocalReply = (text: string): { text: string; cards: CardRef[] } | null => {
    const message = normalizeText(text);
    const isStarter = (key: string) => message === normalizeText(env.t(`starters.${key}`));

    if (isStarter('contact') || BARE_CONTACT_REGEX.test(text)) {
      return { text: env.tChat('scripted.contact'), cards: [{ kind: 'contact' }] };
    }

    if (isStarter('resumeDownload') || BARE_RESUME_REGEX.test(text)) {
      return { text: env.t('resumeCtaText'), cards: [{ kind: 'cv' }] };
    }

    return null;
  };

  const send = (raw: string, options: SendOptions = {}): boolean => {
    const text = raw.trim().slice(0, CHAT_LIMITS.questionMaxChars);
    if (!text || run) return false;

    const previous = state.messages;
    const { flow } = state;

    if (flow) {
      const target = beginRun(
        createMessage('user', text, { flow: true }),
        createMessage('assistant', '', { status: 'streaming', flow: true }),
        null
      );
      void runContactStep(target, flow, text);
      return true;
    }

    const local = findLocalReply(text);
    if (local) {
      commit({
        messages: [
          ...previous,
          createMessage('user', text),
          createMessage('assistant', local.text, { status: 'done', cards: local.cards })
        ]
      });
      saveConversation(state.messages);
      return true;
    }

    lastRequest = { text, options };

    const target = beginRun(
      createMessage('user', text),
      createMessage('assistant', '', { status: 'streaming' }),
      'retrieve'
    );
    void runStream(target, {
      question: text,
      history: buildHistory(previous),
      locale: env.locale,
      scenario: options.scenario ?? (previous.length === 0 ? env.welcomeScenario : null)
    });

    return true;
  };

  // Keeps what has been written so far; an answer that has not produced text yet is dropped.
  const stop = () => {
    const target = run;
    if (!target || state.phase === 'sending') return;

    run = null;
    target.controller.abort();
    flushPending(target.messageId);

    const hasText = state.messages.some((message) => message.id === target.messageId && message.text.trim());
    commit({
      messages: hasText
        ? state.messages.map((message) => (message.id === target.messageId ? { ...message, status: 'done' } : message))
        : state.messages.filter((message) => message.id !== target.messageId),
      phase: 'idle',
      statusStep: null
    });
    saveConversation(state.messages);
  };

  const retry = () => {
    if (run) return;

    const { messages } = state;
    const failed = messages[messages.length - 1];
    const question = messages[messages.length - 2];
    if (failed?.role !== 'assistant' || failed.status !== 'error' || question?.role !== 'user') return;

    commit({ messages: messages.slice(0, -2) });
    send(question.text, lastRequest?.text === question.text ? lastRequest.options : {});
  };

  const reset = () => {
    const target = run;

    run = null;
    target?.controller.abort();
    cancelFrame();
    pendingText = '';
    lastRequest = null;
    commit(INITIAL_SNAPSHOT);
    clearConversation();
  };

  const startContactFlow = () => {
    if (state.flow) return;

    stop();
    commit({
      flow: createContactFlow(),
      messages: [
        ...state.messages,
        createMessage('assistant', `${env.t('contactFlow.intro')}\n\n${env.t('contactFlow.askName')}`, {
          status: 'done',
          flow: true
        })
      ]
    });
  };

  const cancelContactFlow = () => {
    if (!state.flow || state.phase === 'sending') return;

    stop();
    commit({
      flow: null,
      messages: [
        ...state.messages,
        createMessage('assistant', env.t('contactFlow.cancelled'), { status: 'done', flow: true })
      ]
    });
  };

  // StrictMode mounts, unmounts and mounts again: restoring runs once, tearing down is safe to repeat.
  const attach = () => {
    if (hydrated) return;

    hydrated = true;
    const restored = loadConversation();
    if (restored.length && !state.messages.length) commit({ messages: restored });
  };

  // Also runs on a Fast Refresh remount, so it settles the state instead of leaving a half-finished answer.
  const detach = () => {
    stop();
    cancelFrame();
    pendingText = '';
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    setEnv: (next: ChatEngineEnv) => {
      env = next;
    },
    attach,
    detach,
    send,
    stop,
    retry,
    reset,
    startContactFlow,
    cancelContactFlow
  };
};

export type ChatEngine = ReturnType<typeof createChatEngine>;
