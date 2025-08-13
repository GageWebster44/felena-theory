// src/utils/fetchMarketSignals.ts
// Pulls lightweight quote + last trade from Polygon and derives a simple signal.

import axios, { AxiosError } from 'axios';

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || '';

/** Default watchlist (override by passing symbols to fetchMarketSignals) */
const DEFAULT_WATCHLIST = ['GFAI', 'BRSH', 'VRPX'] as const;

export type SignalType = 'neutral' | 'spike' | 'drop' | 'momentum';

export interface MarketSignal {
  symbol: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  lastPrice: number;
  signalStrength: number; // 0–100 scale
  signalType: SignalType;
}

/** Small helper to safely read a number, falling back to 0 */
function n(x: unknown): number {
  return typeof x === 'number' && Number.isFinite(x) ? x : 0;
}

/**
 * Fetch signals for a list of symbols (defaults to DEFAULT_WATCHLIST).
 * Keeps types strict and avoids "any".
 */
export default async function fetchMarketSignals(
  symbols: readonly string[] = DEFAULT_WATCHLIST,
): Promise<MarketSignal[]> {
  const results: MarketSignal[] = [];

  for (const raw of symbols) {
    const symbol = String(raw).toUpperCase().trim();
    if (!symbol) continue;

    try {
      // NBBO (best bid/offer)
      const quoteRes = await axios.get(
        `https://api.polygon.io/v2/last/nbbo/${encodeURIComponent(symbol)}?apiKey=${POLYGON_API_KEY}`,
      ); // Polygon NBBO shape: { results: { bid: { price, size }, ask: { price, size }, ... } }
      // But your screenshot accessed book?.bid?.price, so handle both shapes defensively.

      const q = quoteRes.data?.results ?? quoteRes.data;

      const bid = n(q?.bid?.price ?? q?.b?.p);
      const ask = n(q?.ask?.price ?? q?.a?.p);
      const bidSize = n(q?.bid?.size ?? q?.b?.s);
      const askSize = n(q?.ask?.size ?? q?.a?.s); // Last trade (limit 1)

      const tradeRes = await axios.get(
        `https://api.polygon.io/v3/trades/${encodeURIComponent(symbol)}?limit=1&apiKey=${POLYGON_API_KEY}`,
      ); // v3 trades: { results: [{ p: price, t: ts, ... }] }
      const lastPrice = n(tradeRes.data?.results?.[0]?.p); // --- Simple heuristic signal model (same as your screenshots) ---
      // Spread & midpoint based momentum-ish score

      const midpoint = (bid + ask) / 2 || 0;
      const delta = lastPrice - midpoint; // >0 means trading above mid

      let signalStrength = 50;
      let signalType: SignalType = 'neutral';

      if (delta > 0.2 && bidSize >= askSize) {
        signalType = 'spike';
        signalStrength = 75 + Math.min(delta * 100, 25);
      } else if (delta < -0.2 && askSize > bidSize) {
        signalType = 'drop';
        signalStrength = 25 - Math.min(Math.abs(delta) * 100, 25); // Keep inside 0–100
        signalStrength = Math.max(0, signalStrength);
      } else if (Math.abs(delta) > 0.1) {
        signalType = 'momentum';
        signalStrength = 60;
      }

      results.push({
        symbol,
        bid,
        ask,
        bidSize,
        askSize,
        lastPrice,
        signalStrength: Math.max(0, Math.min(100, Math.round(signalStrength))),
        signalType,
      });
    } catch (err) {
      const ax = err as AxiosError;
      const detail =
        typeof ax.response?.data === 'string'
          ? ax.response.data
          : JSON.stringify(ax.response?.data ?? {}); // Don’t throw—just log and continue so one bad symbol doesn’t break the page.
      // eslint-disable-next-line no-console
      console.error(`Polygon API error for ${symbol}:`, ax.message, detail);
    }
  }

  return results;
}
