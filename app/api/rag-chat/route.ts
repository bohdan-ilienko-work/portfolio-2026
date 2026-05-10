import { NextRequest, NextResponse } from 'next/server';

import { runBohdanRag, type ChatHistoryMessage, type ChatScenarioContext } from '@/lib/rag/chat-graph';

type ChatRequestBody = {
  question?: string;
  history?: ChatHistoryMessage[];
  scenario?: ChatScenarioContext | null;
};

export const runtime = 'nodejs';

export const POST = async (request: NextRequest) => {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { ok: false, error: 'OPENAI_API_KEY is missing in environment variables' },
      { status: 500 }
    );
  }

  let payload: ChatRequestBody = {};

  try {
    payload = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const question = payload.question?.trim();

  if (!question) {
    return NextResponse.json({ ok: false, error: 'Question is required' }, { status: 400 });
  }

  const history = Array.isArray(payload.history)
    ? payload.history
      .filter((item): item is ChatHistoryMessage => item?.role === 'user' || item?.role === 'assistant')
      .map((item) => ({
        role: item.role,
        content: String(item.content ?? '').slice(0, 3000)
      }))
    : [];

  const scenario = payload.scenario
    ? {
      categoryId: String(payload.scenario.categoryId ?? '').slice(0, 64),
      categoryLabel: String(payload.scenario.categoryLabel ?? '').slice(0, 120),
      topicId: payload.scenario.topicId ? String(payload.scenario.topicId).slice(0, 64) : null,
      topicLabel: payload.scenario.topicLabel ? String(payload.scenario.topicLabel).slice(0, 160) : null
    }
    : null;

  try {
    const result = await runBohdanRag({ question, history, scenario });

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'RAG request failed'
      },
      { status: 500 }
    );
  }
};
