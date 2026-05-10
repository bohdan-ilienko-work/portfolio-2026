import { NextRequest, NextResponse } from 'next/server';

type ContactRequestPayload = {
    name?: string;
    contact?: string;
    proposal?: string;
    callTime?: string | null;
};

const sanitize = (value: unknown, maxLength: number) =>
    String(value ?? '')
        .trim()
        .slice(0, maxLength);

const createMessage = (payload: {
    name: string;
    contact: string;
    proposal: string;
    callTime: string | null;
    ip: string;
    userAgent: string;
}) => {
    return [
        'New contact request from Ask Bohdan chat',
        `Name: ${payload.name}`,
        `Contact: ${payload.contact}`,
        `Proposal: ${payload.proposal}`,
        `Preferred call time: ${payload.callTime ?? 'Not specified'}`,
        `IP: ${payload.ip}`,
        `User-Agent: ${payload.userAgent}`,
        `Time (UTC): ${new Date().toISOString()}`,
    ].join('\n');
};

const getIp = (request: NextRequest) => {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0]?.trim() ?? 'unknown';
    }

    return request.headers.get('x-real-ip') ?? 'unknown';
};

export const runtime = 'nodejs';

export const POST = async (request: NextRequest) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        return NextResponse.json({ ok: false, error: 'Telegram env is not configured' }, { status: 500 });
    }

    let payload: ContactRequestPayload = {};
    try {
        payload = (await request.json()) as ContactRequestPayload;
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const name = sanitize(payload.name, 120);
    const contact = sanitize(payload.contact, 180);
    const proposal = sanitize(payload.proposal, 2200);
    const callTimeRaw = sanitize(payload.callTime, 280);
    const callTime = callTimeRaw.length > 0 ? callTimeRaw : null;

    if (name.length < 2) {
        return NextResponse.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }

    if (contact.length < 5) {
        return NextResponse.json({ ok: false, error: 'Contact is required' }, { status: 400 });
    }

    if (proposal.length < 10) {
        return NextResponse.json({ ok: false, error: 'Proposal is too short' }, { status: 400 });
    }

    const text = createMessage({
        name,
        contact,
        proposal,
        callTime,
        ip: getIp(request),
        userAgent: request.headers.get('user-agent') ?? 'unknown',
    });

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
        }),
        cache: 'no-store',
    });

    if (!telegramResponse.ok) {
        return NextResponse.json({ ok: false, error: 'Failed to send Telegram message' }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
};
