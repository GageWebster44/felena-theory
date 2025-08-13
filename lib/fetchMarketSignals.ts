// src/lib/fetchMarketSignals.ts
/**
 * Minimal market snapshot for engines.
 * Add/extend fields as your engines need more data.
 */
export type MarketSnapshot = {
  asOf: string;                // ISO timestamp
  symbols: string[];           // symbols included
  prices: Record<string, number>;     // spot prices in USD
  momentum: Record<string, number>;   // -1..1 (down to up)
  volatility: Record<string, number>; // 0..1 (low to high)
};

/**
 * Optional JSON feed shape, if you point MARKET_FEED_URL to a service.
 * Any extra fields on your feed are ignored safely.
 */
type FeedResponse = Partial<{
  asOf: string;
  symbols: string[];
  prices: Record<string, number>;
  momentum: Record<string, number>;
  volatility: Record<string, number>;
}>;

/**
 * Fetches a market snapshot for the trading engines.
 * - If `process.env.MARKET_FEED_URL` is set and responds with JSON, we use it.
 * - Otherwise we return a deterministic synthetic snapshot so the app works offline.
 */
export default async function fetchMarketSignals(
  symbols: string[] = ['AAPL', 'MSFT', 'NVDA']
): Promise<MarketSnapshot> {
  const url = process.env.MARKET_FEED_URL;

  if (url) {
    try {
      const res = await fetch(url, { headers: { 'accept': 'application/json' } });
      if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
      const json = (await res.json()) as FeedResponse;

      // Merge feed with safe fallbacks
      const now = new Date().toISOString();
      const mergedSymbols = (json.symbols && json.symbols.length ? json.symbols : symbols).slice(0, 20);

      return {
        asOf: json.asOf ?? now,
        symbols: mergedSymbols,
        prices: fillRecord(mergedSymbols, json.prices, (s, i) => 100 + 5 * i),
        momentum: fillRecord(mergedSymbols, json.momentum, (s, i) => clamp(-1, 1, (i % 5) / 2.5 - 1)),
        volatility: fillRecord(mergedSymbols, json.volatility, (_s, i) => clamp(0, 1, 0.1 + ((i * 7) % 10) / 20)),
      };
    } catch (err) {
      // Fall through to synthetic snapshot if the feed fails
      // eslint-disable-next-line no-console
      console.warn('[fetchMarketSignals] Feed failed, using synthetic snapshot:', (err as Error)?.message);
    }
  }

  // Synthetic, deterministic snapshot (seeded by date) for dev/offline runs
  return buildSyntheticSnapshot(symbols);
}

/* ------------------------- helpers ------------------------- */

function clamp(min: number, max: number, v: number): number {
  return Math.max(min, Math.min(max, v));
}

function fillRecord(
  symbols: string[],
  provided: Record<string, number> | undefined,
  fallback: (symbol: string, idx: number) => number
): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 0; i < symbols.length; i++) {
    const s = symbols[i];
    const v = provided?.[s];
    out[s] = Number.isFinite(v) ? Number(v) : fallback(s, i);
  }
  return out;
}

/**
 * Build a deterministic snapshot using a simple seeded RNG so engines behave predictably.
 */
function buildSyntheticSnapshot(symbols: string[]): MarketSnapshot {
  const asOf = new Date().toISOString().slice(0, 16); // minute precision
  const rng = seeded(asOf); // seed by timestamp string

  const baseSymbols = symbols.length ? symbols : ['AAPL', 'MSFT', 'NVDA'];
  const prices: Record<string, number> = {};
  const momentum: Record<string, number> = {};
  const volatility: Record<string, number> = {};

  baseSymbols.forEach((sym, i) => {
    const base = 100 + i * 20;
    const vol = 0.05 + (i % 7) * 0.01 + rng() * 0.02; // 5–12% “vol”
    const mom = (rng() - 0.5) * 1.6;                  // ~-0.8..0.8

    prices[sym] = round2(base * (1 + (rng() - 0.5) * vol));
    momentum[sym] = clamp(-1, 1, mom);
    volatility[sym] = clamp(0, 1, vol);
  });

  return { asOf: new Date().toISOString(), symbols: baseSymbols, prices, momentum, volatility };
}

/**
 * Tiny seeded PRNG (xorshift-ish) based on a string seed.
 * Deterministic across runs for the same seed.
 */
function seeded(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    // xorshift32
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}