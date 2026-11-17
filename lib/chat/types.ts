import type { CardRef, ChatErrorCode, ChatScenario, SectionId } from '@/lib/chat/protocol';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status?: 'streaming' | 'done' | 'error';
  cards?: CardRef[];
  sources?: SectionId[];
  followUps?: string[];
  error?: ChatErrorCode;
  /** Part of the contact request: kept out of the model history and out of sessionStorage (it holds the visitor's contact details). */
  flow?: boolean;
};

/** `sending`: the last answer of the contact request is on its way and can no longer be stopped. */
export type ChatPhase = 'idle' | 'thinking' | 'streaming' | 'sending';
export type ChatStatusStep = 'retrieve' | 'write';

export type ContactFlowStep = 'name' | 'contact' | 'proposal' | 'callTime';
export type ContactFlowProgress = { step: ContactFlowStep; index: number; total: number };

export type SendOptions = {
  scenario?: ChatScenario | null;
};

export type UseChatOptions = {
  locale: string;
  /** Scenario for the first question of an empty conversation when the caller passes none. */
  welcomeScenario?: ChatScenario | null;
};

export type ChatController = {
  messages: ChatMessage[];
  phase: ChatPhase;
  statusStep: ChatStatusStep | null;
  contactFlow: ContactFlowProgress | null;
  /** Returns false when the text was empty or the chat was busy, so the caller keeps its draft. */
  send: (text: string, options?: SendOptions) => boolean;
  stop: () => void;
  retry: () => void;
  reset: () => void;
  startContactFlow: () => void;
  cancelContactFlow: () => void;
};
