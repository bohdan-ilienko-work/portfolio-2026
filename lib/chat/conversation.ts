import { CHAT_LIMITS, type ChatHistoryEntry } from '@/lib/chat/protocol';
import { sanitizeCards, sanitizeFollowUps, sanitizeSources } from '@/lib/chat/stream-client';
import type { ChatMessage } from '@/lib/chat/types';

const STORAGE_KEY = 'ask-bohdan:v2';
const MAX_STORED_MESSAGES = 30;
const MAX_STORED_TEXT_CHARS = 6000;

export const createMessageId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createMessage = (
  role: ChatMessage['role'],
  text: string,
  extra: Partial<ChatMessage> = {}
): ChatMessage => ({ id: createMessageId(), role, text, ...extra });

/** What the model sees of the conversation: text only, no placeholders, errors or contact-request turns. */
export const buildHistory = (messages: ChatMessage[]): ChatHistoryEntry[] =>
  messages
    .filter((message) => !message.flow && message.status !== 'error' && message.text.trim())
    .slice(-CHAT_LIMITS.historyMaxEntries)
    .map((message) => ({
      role: message.role,
      content: message.text.slice(0, CHAT_LIMITS.historyEntryMaxChars)
    }));

const restoreMessage = (value: unknown): ChatMessage | null => {
  if (typeof value !== 'object' || value === null) return null;

  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || typeof item.text !== 'string' || !item.text.trim()) return null;
  if (item.role !== 'user' && item.role !== 'assistant') return null;

  const message: ChatMessage = {
    id: item.id,
    role: item.role,
    text: item.text.slice(0, MAX_STORED_TEXT_CHARS),
    status: 'done'
  };

  const cards = sanitizeCards(item.cards);
  const sources = sanitizeSources(item.sources);
  const followUps = sanitizeFollowUps(item.followUps);

  if (cards.length) message.cards = cards;
  if (sources.length) message.sources = sources;
  if (followUps.length) message.followUps = followUps;

  return message;
};

export const loadConversation = (): ChatMessage[] => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(data)) return [];

    const messages = data.map(restoreMessage).filter((message): message is ChatMessage => message !== null);
    const firstUser = messages.findIndex((message) => message.role === 'user');

    return firstUser === -1 ? [] : messages.slice(firstUser).slice(-MAX_STORED_MESSAGES);
  } catch {
    return [];
  }
};

export const clearConversation = () => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be blocked (private mode, site data off): the chat simply does not persist.
  }
};

/**
 * Answered turns only. A failed turn is dropped with its question, and contact-request turns are never stored
 * because they hold the visitor's contact details.
 */
export const saveConversation = (messages: ChatMessage[]) => {
  const stored: ChatMessage[] = [];

  for (const message of messages) {
    if (message.flow || message.status === 'streaming') continue;

    if (message.status === 'error') {
      if (stored[stored.length - 1]?.role === 'user') stored.pop();
      continue;
    }

    stored.push(message);
  }

  if (stored[stored.length - 1]?.role === 'user') stored.pop();

  if (!stored.length) {
    clearConversation();
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(-MAX_STORED_MESSAGES)));
  } catch {
    // Quota exceeded or storage blocked: ignore.
  }
};
