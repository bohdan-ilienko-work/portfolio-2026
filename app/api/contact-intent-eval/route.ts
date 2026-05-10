import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

type ContactIntentPayload = {
    userInput?: string;
};

type IntentResult = {
    intent: 'contact' | 'other';
    confidence?: number;
};

const parseJsonFromContent = (content: string): IntentResult | null => {
    try {
        const parsed = JSON.parse(content) as IntentResult;
        if (!parsed?.intent) return null;
        if (!['contact', 'other'].includes(parsed.intent)) return null;

        const confidence =
            typeof parsed.confidence === 'number'
                ? Math.max(0, Math.min(1, parsed.confidence))
                : undefined;

        return {
            intent: parsed.intent,
            confidence,
        };
    } catch {
        return null;
    }
};

export const runtime = 'nodejs';

export const POST = async (request: NextRequest) => {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { ok: false, error: 'OPENAI_API_KEY is missing in environment variables' },
            { status: 500 }
        );
    }

    let payload: ContactIntentPayload = {};
    try {
        payload = (await request.json()) as ContactIntentPayload;
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const userInput = String(payload.userInput ?? '').trim();
    if (!userInput) {
        return NextResponse.json({ ok: true, result: { intent: 'other', confidence: 0 } }, { status: 200 });
    }

    const model = new ChatOpenAI({ model: 'gpt-4.1-mini', temperature: 0 });

    const prompt = [
        'Classify whether a user message is trying to contact/hire/collaborate with Bohdan.',
        'Return contact intent if message asks about reaching out, joining team, hiring, collaboration, proposal, scheduling, or communication channels.',
        'Otherwise return other.',
        'Be robust to slang and stress-test phrasing in any language.',
        '',
        'Return STRICT JSON only with shape:',
        '{"intent":"contact|other","confidence":0..1}',
        '',
        `User input: ${userInput.slice(0, 1200)}`,
    ].join('\n');

    try {
        const response = await model.invoke(prompt);
        const content =
            typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        const result = parseJsonFromContent(content);

        if (!result) {
            return NextResponse.json({ ok: true, result: { intent: 'other', confidence: 0 } }, { status: 200 });
        }

        return NextResponse.json({ ok: true, result }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { ok: false, error: error instanceof Error ? error.message : 'Contact intent evaluation failed' },
            { status: 500 }
        );
    }
};
