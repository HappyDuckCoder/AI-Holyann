/**
 * In-memory rate limit cho auth endpoints (login, register).
 * Production nên dùng Redis hoặc Upstash.
 */
const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 phút
const MAX_REQUESTS = 10; // tối đa 10 request / phút / key

function getKey(identifier: string, prefix: string): string {
  return `${prefix}:${identifier}`;
}

function getIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

export function checkRateLimit(
  request: Request,
  prefix: 'login' | 'register' | 'auth'
): { allowed: boolean; retryAfter?: number } {
  const key = getKey(getIdentifier(request), prefix);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

/** Dọn key hết hạn định kỳ (tránh memory leak) */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
  }, 60000);
}
