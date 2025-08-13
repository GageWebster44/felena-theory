// src/pages/api/alpaca/broker/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import seAdmin from '@/utils/supabaseAdmin';

type Ok = {
  ok: true;
  account_id: string;
  status_raw: string;
  status_normalized: 'approved' | 'submitted' | 'action_required' | 'rejected' | 'none' | 'unknown';
};
type Err = { ok: false; error: string };

const KEY = process.env.APCA_API_KEY_ID;
const SECRET = process.env.APCA_API_SECRET_KEY;
const ENV = (process.env.ALPACA_BROKER_ENV || 'sandbox').toLowerCase();
const BASE =
  process.env.ALPACA_BROKER_BASE_URL ||
  (ENV === 'sandbox'
    ? 'https://broker-api.sandbox.alpaca.markets'
    : 'https://broker-api.alpaca.markets');

// simple per-IP limiter
const BUCKET: Record<string, number[]> = {};
const WINDOW_MS = 60_000;
const MAX = 20;
function rl(ip: string): boolean {
  const now = Date.now();
  const arr = (BUCKET[ip] ||= []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX) return false;
  arr.push(now);
  BUCKET[ip] = arr;
  return true;
}

function normalizeStatus(s?: string): Ok['status_normalized'] {
  if (!s) return 'unknown';
  const u = s.toUpperCase();
  if (['APPROVED', 'ACTIVE', 'ACCOUNT_APPROVED'].includes(u)) return 'approved';
  if (['SUBMITTED', 'PENDING', 'ACCOUNT_SUBMITTED', 'OPENING'].includes(u)) return 'submitted';
  if (['ACTION_REQUIRED', 'DOCUMENT_REQUIRED', 'ACCOUNT_ACTION_REQUIRED'].includes(u)) return 'action_required';
  if (['REJECTED', 'DENIED', 'ACCOUNT_REJECTED', 'CLOSED'].includes(u)) return 'rejected';
  return 'unknown';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ok | Err>) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  if (!rl(ip)) return res.status(429).json({ ok: false, error: 'Too many requests' });

  if (!KEY || !SECRET) return res.status(500).json({ ok: false, error: 'Missing broker credentials' });

  // Get user
  const supabase = createPagesServerClient({ req, res });
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  // Accept accountId from query/body; otherwise look it up by user
  const accountId =
    (req.method === 'GET'
      ? (req.query.accountId as string) || ''
      : (req.body?.accountId as string) || '')?.trim();

  let acct = accountId;
  if (!acct) {
    // try to find account for this user
    const { data } = await seAdmin
      .from('alpaca_accounts') // or broker_links if that's your table name
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle();
    acct = data?.account_id || '';
    if (!acct) {
      return res.status(200).json({
        ok: true,
        account_id: '',
        status_raw: 'none',
        status_normalized: 'none',
      });
    }
  }

  // Hit Alpaca Broker API
  let statusRaw = 'unknown';
  try {
    const r = await fetch(`${BASE}/v1/accounts/${encodeURIComponent(acct)}`, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': KEY,
        'APCA-API-SECRET-KEY': SECRET,
      },
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ ok: false, error: j?.message || 'Broker status error' });
    }
    statusRaw = (j?.status as string) || 'unknown';
  } catch (e: any) {
    return res.status(502).json({ ok: false, error: e?.message || 'Broker request failed' });
  }

  const normalized = normalizeStatus(statusRaw);

  // Persist latest status for the user
  try {
    await seAdmin
      .from('alpaca_accounts')
      .upsert(
        { user_id: user.id, account_id: acct, status: statusRaw, updated_at: new Date().toISOString() } as any,
        { onConflict: 'user_id' }
      );
  } catch {
    /* non-fatal */
  }

  return res.status(200).json({
    ok: true,
    account_id: acct,
    status_raw: statusRaw,
    status_normalized: normalized,
  });
}