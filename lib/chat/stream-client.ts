import {
  CHAT_LIMITS,
  cardToken,
  isSectionId,
  parseCardToken,
  type CardRef,
  type ChatErrorCode,
  type ChatMeta,
  type ChatRequest,
  type ChatStreamEvent,
  type SectionId
} from '@/lib/chat/protocol';

const CHAT_ENDPOINT = '/api/chat';
// The route streams for at most 30s (maxDuration); silence for longer than this means the connection is dead.
const STALL_TIMEOUT_MS = 40_000;
const FRAME_BREAK = /\r?\n\r?\n/;
const ERROR_CODES: readonly string[] = ['bad_request', 'rate_limited', 'unavailable'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toErrorCode = (value: unknown, status?: number): ChatErrorCode => {
  if (typeof value === 'string' && ERROR_CODES.includes(value)) return value as ChatErrorCode;
  if (status === 429) return 'rate_limited';
  if (status === 400) return 'bad_request';

  return 'unavailable';
};

/** Cards come from the wire or from sessionStorage; an id the card registry does not know would crash the render. */
export const sanitizeCards = (value: unknown): CardRef[] => {
  if (!Array.isArray(value)) return [];

  const cards: CardRef[] = [];

  for (const item of value) {
    if (!isRecord(item) || typeof item.kind !== 'string') continue;

    const token = typeof item.id === 'string' ? `${item.kind}:${item.id}` : item.kind;
    const card = parseCardToken(token);

    if (card && !cards.some((existing) => cardToken(existing) === cardToken(card))) cards.push(card);
  }

  return cards.slice(0, CHAT_LIMITS.maxCards);
};

export const sanitizeSources = (value: unknown): SectionId[] => {
  if (!Array.isArray(value)) return [];

  const sources = value.filter((item): item is SectionId => typeof item === 'string' && isSectionId(item));

  return Array.from(new Set(sources)).slice(0, CHAT_LIMITS.maxSources);
};

export const sanitizeFollowUps = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, CHAT_LIMITS.followUpMaxChars))
    .filter(Boolean)
    .slice(0, CHAT_LIMITS.maxFollowUps);
};

const sanitizeMeta = (value: unknown): ChatMeta => {
  const source = isRecord(value) ? value : {};
  const intent = source.intent === 'contact' || source.intent === 'resume' ? source.intent : null;

  return {
    cards: sanitizeCards(source.cards),
    followUps: sanitizeFollowUps(source.followUps),
    sources: sanitizeSources(source.sources),
    intent
  };
};

const parseFrame = (frame: string): ChatStreamEvent | null => {
  const data = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).replace(/^ /, ''))
    .join('\n');

  if (!data) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;

  switch (parsed.t) {
    case 'status':
      return parsed.step === 'retrieve' || parsed.step === 'write' ? { t: 'status', step: parsed.step } : null;
    case 'delta':
      return typeof parsed.text === 'string' ? { t: 'delta', text: parsed.text } : null;
    case 'meta':
      return { t: 'meta', meta: sanitizeMeta(parsed.meta) };
    case 'done':
      return { t: 'done' };
    case 'error':
      return { t: 'error', code: toErrorCode(parsed.code) };
    default:
      return null;
  }
};

const readErrorCode = async (response: Response): Promise<ChatErrorCode> => {
  try {
    const body: unknown = await response.json();

    return toErrorCode(isRecord(body) ? body.code : undefined, response.status);
  } catch {
    return toErrorCode(undefined, response.status);
  }
};

const isTerminal = (event: ChatStreamEvent) => event.t === 'done' || event.t === 'error';

/**
 * POST /api/chat and yield the SSE events as they arrive. Always ends with `done` or `error`, except when the
 * caller aborts: then it ends silently. Network failures and a stalled connection become `error: unavailable`.
 */
export async function* streamChat(request: ChatRequest, signal: AbortSignal): AsyncGenerator<ChatStreamEvent> {
  if (signal.aborted) return;

  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  signal.addEventListener('abort', forwardAbort, { once: true });

  let stallTimer: ReturnType<typeof setTimeout> | undefined;
  const armStallTimer = () => {
    clearTimeout(stallTimer);
    stallTimer = setTimeout(() => controller.abort(), STALL_TIMEOUT_MS);
  };

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  try {
    armStallTimer();

    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    if (!response.ok) {
      yield { t: 'error', code: await readErrorCode(response) };
      return;
    }

    if (!response.body) {
      yield { t: 'error', code: 'unavailable' };
      return;
    }

    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      armStallTimer();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split(FRAME_BREAK);
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        // One network chunk can carry several frames: stop at once when the caller aborted in between.
        if (signal.aborted) return;

        const event = parseFrame(frame);
        if (!event) continue;

        yield event;
        if (isTerminal(event)) return;
      }
    }

    const tail = parseFrame(buffer + decoder.decode());
    if (tail) {
      yield tail;
      if (isTerminal(tail)) return;
    }

    yield { t: 'error', code: 'unavailable' };
  } catch {
    if (!signal.aborted) yield { t: 'error', code: 'unavailable' };
  } finally {
    clearTimeout(stallTimer);
    signal.removeEventListener('abort', forwardAbort);
    reader?.cancel().catch(() => undefined);
  }
}
