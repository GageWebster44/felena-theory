// src/utils/rateLimit.ts
// Lightweight sliding-window limiter (per key). No deps.
// NOTE: In-memory stores reset on deploy. For multi-instance hardening,
// swap to a Supabase table or Redis later.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  windowMs: number;  // e.g., 60_000
  max: number;       // e.g., 30
  key?: string;      // override key (default: ip or user id)
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetMs: number;
};

function now() {
  return Date.now();
}

export function getClientIp(req: { headers: Record<string, any>; socket: any }): string {
  const fwd = (req.headers['x-forwarded-for'] as string) || '';
  return (fwd.split(',')[0] || req.socket?.remoteAddress || '').trim();
}

export function rateLimit(req: any, opts: RateLimitOptions): RateLimitResult {
  const key = (opts.key?.trim() ||
    (req?.userId as string) ||
    getClientIp(req) ||
    'anon') as string;

  const id = `${key}:${opts.windowMs}:${opts.max}`;
  const nowMs = now();
  let b = buckets.get(id);

  if (!b || b.resetAt <= nowMs) {
    b = { count: 0, resetAt: nowMs + opts.windowMs };
    buckets.set(id, b);
  }

  if (b.count >= opts.max) {
    return { ok: false, remaining: 0, resetMs: Math.max(0, b.resetAt - nowMs) };
  }

  b.count += 1;
  return { ok: true, remaining: Math.max(0, opts.max - b.count), resetMs: Math.max(0, b.resetAt - nowMs) };
}