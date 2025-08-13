// src/lib/alpaca.ts
// Minimal Alpaca REST helpers + key lookup via Supabase Admin

import { supabaseAdmin } from './supabaseAdmin';

type BrokerRow = {
  id?: string;
  user_id?: string | null;
  email?: string | null;
  alpaca_key?: string | null;
  alpaca_secret?: string | null;
};

export type BrokerSecrets = { key: string; secret: string } | null;

const ALPACA_BASE =
  (process.env.NEXT_PUBLIC_ALPACA_BASE?.trim() || 'https://paper-api.alpaca.markets') + '/v2'; // default to paper endpoint; swap env var for live

/**
 * Lookup an operator's Alpaca API key/secret.
 * 1) Try by user_id in broker_links
 * 2) Fallback: find by email, then backfill user_id for future lookups
 */
export async function getUserBrokerKeys(userId: string): Promise<BrokerSecrets> {
  try {
    // Try to fetch user's email first (so we can do the fallback)
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = user?.user?.email ?? null; // Primary lookup: by user_id

    const { data, error } = await supabaseAdmin
      .from('broker_links')
      .select('alpaca_key, alpaca_secret')
      .eq('user_id', userId)
      .single();

    if (!error && data?.alpaca_key && data?.alpaca_secret) {
      return { key: data.alpaca_key, secret: data.alpaca_secret };
    } // Fallback: by email

    if (email) {
      const { data: byEmail } = await supabaseAdmin
        .from('broker_links')
        .select('id, alpaca_key, alpaca_secret')
        .eq('email', email)
        .maybeSingle<BrokerRow>();

      if (byEmail?.alpaca_key && byEmail?.alpaca_secret) {
        // Backfill user_id for faster future lookups
        if (byEmail.id) {
          await supabaseAdmin.from('broker_links').update({ user_id: userId }).eq('id', byEmail.id);
        }
        return { key: byEmail.alpaca_key, secret: byEmail.alpaca_secret };
      }
    }

    return null;
  } catch (err) {
    console.error('getUserBrokerKeys error:', err);
    return null;
  }
}

/* --------------------------- HTTP helpers --------------------------- */

async function alpacaFetch<T>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE',
  key: string,
  secret: string,
  body?: unknown,
): Promise<T> {
  const url = `${ALPACA_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      'APCA-API-KEY-ID': key,
      'APCA-API-SECRET-KEY': secret,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body), // Important if you call from server components/routes:
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Alpaca ${method} ${path} failed (${res.status}): ${text}`);
  } // DELETE may return empty body

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function alpacaGet<T = any>(path: string, key: string, secret: string): Promise<T> {
  return alpacaFetch<T>(path, 'GET', key, secret);
}

export function alpacaPost<T = any>(
  path: string,
  key: string,
  secret: string,
  body?: unknown,
): Promise<T> {
  return alpacaFetch<T>(path, 'POST', key, secret, body);
}

export function alpacaDelete<T = any>(path: string, key: string, secret: string): Promise<T> {
  return alpacaFetch<T>(path, 'DELETE', key, secret);
}

/* ----------------------- Convenience wrappers ----------------------- */

export function getAccount(
  key: string,
  secret: string,
): Promise<{
  id: string;
  status: string;
  cash: string;
  buying_power: string;
}> {
  return alpacaGet('/account', key, secret);
}

export function getPositions(
  key: string,
  secret: string,
): Promise<
  Array<{
    symbol: string;
    qty: string;
    avg_entry_price: string;
    market_value: string;
    unrealized_pl: string;
  }>
> {
  return alpacaGet('/positions', key, secret);
}

export function placeOrder(
  key: string,
  secret: string,
  order: {
    symbol: string;
    qty: number | string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    time_in_force?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
    limit_price?: number | string;
  },
): Promise<any> {
  return alpacaPost('/orders', key, secret, order);
}
