import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { CHAT_LIMITS, type ChatErrorCode, type ChatStreamEvent } from '@/lib/chat/protocol';
import { streamBohdanChat } from '@/lib/rag/chat-graph';
import { checkRateLimit, getClientKey } from '@/lib/rag/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// 10 history entries of 1500 chars plus a 1000 char question is far below this, even in 4-byte characters.
const MAX_BODY_BYTES = 100_000;

const clip = (max: number) => z.string().transform((value) => value.trim().slice(0, max));

const bodySchema = z.object({
  question: z.string().trim().min(1).max(CHAT_LIMITS.questionMaxChars),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: clip(CHAT_LIMITS.historyEntryMaxChars) }))
    .default([])
    .transform((history) => history.filter((entry) => entry.content).slice(-CHAT_LIMITS.historyMaxEntries)),
  // Only letters and dashes survive: the value is logged and unknown locales fall back to English in the prompt.
  locale: z
    .string()
    .transform((value) => value.toLowerCase().replace(/[^a-z-]/g, '').slice(0, 16))
    .catch('en'),
  scenario: z
    .object({
      categoryId: clip(64),
      categoryLabel: clip(120),
      topicId: clip(64).nullable().default(null),
      topicLabel: clip(160).nullable().default(null)
    })
    .nullish()
    .catch(null)
});

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-store, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no'
};

const encoder = new TextEncoder();

const frame = (event: ChatStreamEvent) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`);

const reject = (code: ChatErrorCode, status: number, headers: Record<string, string> = {}) =>
  NextResponse.json({ ok: false, code }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

// request.text() would buffer a body of any size before the cap could be checked. This stops reading at the cap and
// returns null, so an oversized upload (declared or chunked) costs no memory beyond the cap.
const readBody = async (request: NextRequest): Promise<string | null> => {
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return null;

  const reader = request.body?.getReader();

  if (!reader) return '';

  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) return text + decoder.decode();

    bytes += value.byteLength;

    if (bytes > MAX_BODY_BYTES) {
      reader.cancel().catch(() => undefined);

      return null;
    }

    text += decoder.decode(value, { stream: true });
  }
};

async function* unavailable(): AsyncGenerator<ChatStreamEvent, void, undefined> {
  yield { t: 'status', step: 'retrieve' };

  console.error('[chat] OPENAI_API_KEY is not set');

  yield { t: 'error', code: 'unavailable' };
}

// One SSE frame per protocol event. Pull-based, so a slow client slows the model stream instead of buffering it, and
// a cancelled response (tab closed, Stop pressed) aborts the model call.
const toSseStream = (events: AsyncGenerator<ChatStreamEvent, void, undefined>, abort: AbortController) => {
  let cancelled = false;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await events.next();

        if (cancelled) return;

        if (done) controller.close();
        else controller.enqueue(frame(value));
      } catch (error) {
        // streamBohdanChat reports its own failures as error events; this is the last resort.
        console.error('[chat] stream crashed:', error instanceof Error ? error.name : 'unknown');

        if (cancelled) return;

        controller.enqueue(frame({ t: 'error', code: 'unavailable' }));
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
      abort.abort();
      events.return(undefined).catch(() => undefined);
    }
  });
};

export const POST = async (request: NextRequest) => {
  const limit = checkRateLimit(getClientKey(request.headers));

  if (!limit.allowed) return reject('rate_limited', 429, { 'Retry-After': String(limit.retryAfterSec) });

  let payload: unknown;

  try {
    const raw = await readBody(request);

    if (raw === null) return reject('bad_request', 413);

    payload = JSON.parse(raw);
  } catch {
    return reject('bad_request', 400);
  }

  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) return reject('bad_request', 400);

  const abort = new AbortController();

  request.signal.addEventListener('abort', () => abort.abort(), { once: true });

  const events = process.env.OPENAI_API_KEY ? streamBohdanChat(parsed.data, abort.signal) : unavailable();

  return new Response(toSseStream(events, abort), { headers: SSE_HEADERS });
};
