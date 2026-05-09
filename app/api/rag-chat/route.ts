import {NextRequest, NextResponse} from 'next/server';

import {runBohdanRag, type ChatHistoryMessage} from '@/lib/rag/chat-graph';

type ChatRequestBody = {
  question?: string;
  history?: ChatHistoryMessage[];
};

export const runtime = 'nodejs';

export const POST = async (request: NextRequest) => {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {ok: false, error: 'OPENAI_API_KEY is missing in environment variables'},
      {status: 500}
    );
  }

  let payload: ChatRequestBody = {};

  try {
    payload = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ok: false, error: 'Invalid JSON body'}, {status: 400});
  }

  const question = payload.question?.trim();

  if (!question) {
    return NextResponse.json({ok: false, error: 'Question is required'}, {status: 400});
  }

  const history = Array.isArray(payload.history)
    ? payload.history
        .filter((item): item is ChatHistoryMessage => item?.role === 'user' || item?.role === 'assistant')
        .map((item) => ({
          role: item.role,
          content: String(item.content ?? '').slice(0, 3000)
        }))
    : [];

  try {
    const result = await runBohdanRag({question, history});

    return NextResponse.json({ok: true, ...result}, {status: 200});
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'RAG request failed'
      },
      {status: 500}
    );
  }
};
