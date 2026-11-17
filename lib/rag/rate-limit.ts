// In-memory sliding window per client. Best effort only: on serverless every instance has its own map and a cold
// start forgets it, and x-forwarded-for can be spoofed on a host that does not overwrite it. It stops a script
// hammering one instance, not a determined abuser; a shared store (Redis / Upstash) would be needed for that.

export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 20;

const MAX_TRACKED_CLIENTS = 2000;

const hits = new Map<string, number[]>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSec: number };

/** First hop of x-forwarded-for, else x-real-ip, else 'unknown' (all unidentifiable clients share one bucket). */
export const getClientKey = (headers: Headers) => {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const candidate = forwarded || headers.get('x-real-ip')?.trim();

  return candidate ? candidate.slice(0, 64) : 'unknown';
};

const prune = (now: number) => {
  for (const [key, stamps] of hits) {
    if (stamps.length === 0 || now - stamps[stamps.length - 1] >= RATE_LIMIT_WINDOW_MS) hits.delete(key);
  }

  // Still too many live keys (rotating spoofed addresses): forget the oldest ones.
  for (const key of hits.keys()) {
    if (hits.size <= MAX_TRACKED_CLIENTS) break;
    hits.delete(key);
  }
};

export const checkRateLimit = (key: string, now = Date.now()): RateLimitResult => {
  if (hits.size > MAX_TRACKED_CLIENTS) prune(now);

  const stamps = (hits.get(key) ?? []).filter((stamp) => now - stamp < RATE_LIMIT_WINDOW_MS);

  if (stamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    hits.set(key, stamps);

    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((stamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000)) };
  }

  stamps.push(now);
  hits.set(key, stamps);

  return { allowed: true };
};
