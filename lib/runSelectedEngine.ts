// src/lib/runSelectedEngine.ts

export type EngineKey = 'jarvis' | 'snubnose' | 'synapse' | (string & {});

export type MarketData = {
  symbol?: string | null;
  /** Percent change for the current window, e.g. +1.23 for +1.23% */
  priceChangePct?: number | null;
  /** Optional signal produced upstream */
  signal?: 'buy' | 'sell' | 'hold' | null;
  /** Optional current position hint */
  position?: string | null;
};

export type EngineRunResult = {
  profitUSD: number;          // raw USD profit for this iteration
  symbol: string | null;
  position: string | null;
  override: boolean;          // whether manual override affected result
  crates: number;             // crates awarded from this pass
};

/**
 * Lightweight, dependency-free engine selector.
 * Replace the inner strategies with your real ones later if needed.
 *
 * Contract:
 * - Returns { profitUSD, symbol, position, override, crates }
 * - profitUSD is >= 0
 * - crates is an integer >= 0
 */
export default async function runSelectedEngine(
  engine: EngineKey,
  userId: string,
  market: MarketData
): Promise<EngineRunResult> {
  // Normalize inputs
  const symbol = market.symbol ?? null;
  const basePos = market.position ?? null;
  const pct = Number.isFinite(market.priceChangePct as number)
    ? (market.priceChangePct as number)
    : 0;

  // Simple helper: convert a % change into a USD profit figure.
  // Tweak the scaler to suit your simulation; we floor negatives to 0
  // so the caller only grants XP on actual gains.
  const profitFromPct = (p: number) => Math.max(0, Math.round(p * 10) / 10); // e.g. +2.34% -> $2.3

  let result: EngineRunResult = {
    profitUSD: 0,
    symbol,
    position: basePos,
    override: false,
    crates: 0,
  };

  switch (engine) {
    case 'jarvis': {
      // Momentum-biased: reward green moves more than red
      const bias = market.signal === 'buy' ? 1.25 : 1.0;
      result.profitUSD = profitFromPct(pct * bias);
      result.position = basePos ?? (pct >= 0 ? 'long' : 'flat');
      break;
    }

    case 'snubnose': {
      // Mean-reversion nibble: small profits on small reversals
      const magnitude = Math.abs(pct);
      const nibble = magnitude > 0.5 ? 0.6 : 0.3; // scale down big swings
      result.profitUSD = profitFromPct(magnitude * nibble);
      result.position = basePos ?? 'scalp';
      break;
    }

    case 'synapse': {
      // Signal-driven: only profit when we have a clear signal
      if (market.signal === 'buy') {
        result.profitUSD = profitFromPct(Math.max(0, pct));
        result.position = 'long';
      } else if (market.signal === 'sell') {
        // If you model shorting, convert down moves into gains
        result.profitUSD = profitFromPct(Math.max(0, -pct));
        result.position = 'short';
      } else {
        result.profitUSD = 0;
        result.position = basePos ?? 'flat';
      }
      break;
    }

    default: {
      // Unknown engine: no-op but safe
      result.profitUSD = profitFromPct(pct);
      result.position = basePos ?? 'flat';
      break;
    }
  }

  // Optional: tiny crate chance on decent wins
  if (result.profitUSD >= 5) {
    result.crates = 1;
  }

  return result;
}