// src/utils/executeTrade.ts
// Handles Alpaca trades (paper by default)

import axios, { AxiosError } from 'axios';

/** Basic Alpaca order payload.
 *  Docs: https://alpaca.markets/docs/api-references/trading-api/orders/
 */
export type Side = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
export type TIF = 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';

export interface AlpacaOrderRequest {
  symbol: string;
  side: Side;
  type?: OrderType; // default: 'market'
  time_in_force?: TIF; // default: 'gtc'
  /** either qty OR notional is required (but not both) */
  qty?: number;
  notional?: number; // Optional advanced fields for non‑market orders:

  limit_price?: number;
  stop_price?: number;
  trail_price?: number;
  trail_percent?: number;
  extended_hours?: boolean; // Optional idempotency key (your own)

  client_order_id?: string;
}

export interface AlpacaOrderResponse {
  id: string;
  symbol: string;
  qty: string;
  side: Side;
  type: OrderType;
  time_in_force: TIF;
  status: string;
  submitted_at: string;
  filled_qty: string;
  [k: string]: unknown; // Alpaca returns many fields
}

const ALPACA_KEY = process.env.ALPACA_API_KEY || process.env.NEXT_PUBLIC_ALPACA_API_KEY || '';
const ALPACA_SECRET =
  process.env.ALPACA_API_SECRET_KEY || process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY || '';
const ALPACA_BASE = process.env.ALPACA_API_BASE_URL || 'https://paper-api.alpaca.markets';

if (!ALPACA_KEY || !ALPACA_SECRET) {
  // Prefer soft‑warning so local dev can still boot without crashing
  // You can throw here if you want hard‑fail on missing creds.
  // eslint-disable-next-line no-console
  console.warn('[executeTrade] Missing Alpaca credentials in env.');
}

const http = axios.create({
  baseURL: `${ALPACA_BASE}/v2`,
  timeout: 10_000,
  headers: {
    'APCA-API-KEY-ID': ALPACA_KEY,
    'APCA-API-SECRET-KEY': ALPACA_SECRET,
    'Content-Type': 'application/json',
  },
});

function toAlpacaPayload(o: AlpacaOrderRequest): AlpacaOrderRequest {
  // Minimal validation
  if (!o.symbol) throw new Error('symbol is required');
  if (!o.qty && !o.notional) throw new Error('qty or notional is required');
  if (o.qty && o.notional) throw new Error('Provide only qty OR notional, not both');

  return {
    symbol: o.symbol.toUpperCase(),
    side: o.side,
    type: o.type ?? 'market',
    time_in_force: o.time_in_force ?? 'gtc',
    qty: o.qty,
    notional: o.notional,
    limit_price: o.limit_price,
    stop_price: o.stop_price,
    trail_price: o.trail_price,
    trail_percent: o.trail_percent,
    extended_hours: o.extended_hours ?? false,
    client_order_id: o.client_order_id,
  };
}

/** Place an order with Alpaca.
 *  Returns the Alpaca order object on success.
 *  Throws an Error with a helpful message on failure.
 */
export async function executeTrade(order: AlpacaOrderRequest): Promise<AlpacaOrderResponse> {
  try {
    const payload = toAlpacaPayload(order);
    const { data } = await http.post<AlpacaOrderResponse>('/orders', payload);
    return data;
  } catch (e) {
    const err = e as AxiosError<any>;
    const detail =
      (err.response?.data &&
        (typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data))) ||
      err.message; // eslint-disable-next-line no-console
    console.error('[executeTrade] TRADE FAILED:', detail);
    throw new Error(`Alpaca order failed: ${detail}`);
  }
}

/** Convenience helper for market buy/sell by shares. */
export function marketByQty(
  symbol: string,
  side: Side,
  qty: number,
  opts: Partial<AlpacaOrderRequest> = {},
) {
  return executeTrade({
    symbol,
    side,
    qty,
    type: 'market',
    time_in_force: 'gtc',
    ...opts,
  });
}

/** Convenience helper for market buy by dollar notional. */
export function marketBuyNotional(
  symbol: string,
  notional: number,
  opts: Partial<AlpacaOrderRequest> = {},
) {
  return executeTrade({
    symbol,
    side: 'buy',
    notional,
    type: 'market',
    time_in_force: 'gtc',
    ...opts,
  });
}
