import {NextRequest, NextResponse} from 'next/server';

const VISITOR_COOKIE = 'portfolio_visitor_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type VisitorPayload = {
  url?: string;
  path?: string;
};

const createMessage = ({payload, ip, userAgent, visitorId}: {payload: VisitorPayload; ip: string; userAgent: string; visitorId: string}) => {
  const visitedUrl = payload.url ?? 'unknown';
  const visitedPath = payload.path ?? 'unknown';

  return [
    'New unique visitor',
    `Visitor ID: ${visitorId}`,
    `Path: ${visitedPath}`,
    `URL: ${visitedUrl}`,
    `IP: ${ip}`,
    `User-Agent: ${userAgent}`,
    `Time (UTC): ${new Date().toISOString()}`
  ].join('\n');
};

const getIp = (request: NextRequest) => {
  const forwarded = request.headers.get('x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
};

export const POST = async (request: NextRequest) => {
  if (request.cookies.get(VISITOR_COOKIE)?.value) {
    return NextResponse.json({ok: true, reason: 'already-tracked'}, {status: 200});
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json({ok: false, error: 'Telegram env is not configured'}, {status: 500});
  }

  let payload: VisitorPayload = {};

  try {
    payload = (await request.json()) as VisitorPayload;
  } catch {
    payload = {};
  }

  const visitorId = crypto.randomUUID();
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  const ip = getIp(request);
  const text = createMessage({payload, ip, userAgent, visitorId});

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    }),
    cache: 'no-store'
  });

  if (!telegramResponse.ok) {
    return NextResponse.json({ok: false, error: 'Failed to send Telegram message'}, {status: 502});
  }

  const response = NextResponse.json({ok: true}, {status: 200});

  response.cookies.set({
    name: VISITOR_COOKIE,
    value: visitorId,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return response;
};
