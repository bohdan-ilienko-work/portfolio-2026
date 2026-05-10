import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

type ContactFlowConsentPayload = {
    userInput?: string;
};

type ConsentResult = {
    decision: 'accept' | 'decline' | 'other';
    confidence?: number;
};

const parseJsonFromContent = (content: string): ConsentResult | null => {
    try {
        const parsed = JSON.parse(content) as ConsentResult;
        if (!parsed?.decision) return null;
        if (!['accept', 'decline', 'other'].includes(parsed.decision)) return null;

        const confidence =
            typeof parsed.confidence === 'number'
                ? Math.max(0, Math.min(1, parsed.confidence))
                : undefined;

        return {
            decision: parsed.decision,
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

    let payload: ContactFlowConsentPayload = {};
    try {
        payload = (await request.json()) as ContactFlowConsentPayload;
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const userInput = String(payload.userInput ?? '').trim();
    if (!userInput) {
        return NextResponse.json({ ok: true, result: { decision: 'other', confidence: 0 } }, { status: 200 });
    }

    const model = new ChatOpenAI({ model: 'gpt-4.1-mini', temperature: 0 });

    const prompt = [
        'You classify a user reply after the assistant asked whether to start a 4-step contact request form.',
        'Return accept if the user agrees explicitly or implicitly, or starts providing relevant info for the form.',
        'Examples of accept: "yes", "ну давай", "let\'s do it", "давай именно форму", "I want to offer part-time", "my name is ...".',
        'Return decline if the user clearly refuses, postpones, or says no.',
        'Return other if the reply is unrelated or asks something else.',
        'Be robust across languages and slang.',
        '',
        'Return STRICT JSON only with shape:',
        '{"decision":"accept|decline|other","confidence":0..1}',
        '',
        `User reply: ${userInput.slice(0, 1200)}`,
    ].join('\n');

    try {
        const response = await model.invoke(prompt);
        const content =
            typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        const result = parseJsonFromContent(content);

        if (!result) {
            return NextResponse.json({ ok: true, result: { decision: 'other', confidence: 0 } }, { status: 200 });
        }

        return NextResponse.json({ ok: true, result }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : 'Contact flow consent evaluation failed',
            },
            { status: 500 }
        );
    }
};
