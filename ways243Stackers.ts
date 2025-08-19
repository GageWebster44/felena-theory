// src/lib/casino/engines/ways243Stackers.ts
import type { Engine } from "./types";

/** Mulberry32 RNG */
function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type SpinArgs = { betXP: number; seed: number; state?: any; params?: any };
type SymbolKey = "ship"|"robot"|"asteroid"|"planet"|"A"|"K"|"Q"|"J"|"10"|"wild"|"scatter";

type WaysWin = {
  type: "ways";
  symbol: SymbolKey;
  count: number;
  amountXP: number;
  meta?: { ways: number };
};

export type SpinResult = {
  symbols: SymbolKey[][];                          // [rows][reels]
  wins: WaysWin[];
  winXP: number;
  features?: Array<{ type: "freeSpins"; spins: number }>;
  state?: { expandedCols: number[]; scatters: number };
};

const DEFAULTS = {
  rows: 3,
  reels: 5,                       // 243 ways
  wildChance: 0.08,               // per-cell wild chance (reels 2-5)
  scatterChance: 0.03,            // per-cell scatter chance
  expandWildChance: 0.35,         // when a wild appears, chance to expand to full reel
  freeSpins: { "3": 8, "4": 12, "5": 20 },
};

// base paytable (bet multiplier for 3/4/5)
const PAYTABLE: Record<SymbolKey, Record<number, number>> = {
  ship:     { 3: 1.2, 4: 3.0, 5: 8.0 },
  robot:    { 3: 1.0, 4: 2.4, 5: 6.0 },
  asteroid: { 3: 0.8, 4: 1.8, 5: 4.5 },
  planet:   { 3: 0.7, 4: 1.6, 5: 4.0 },
  A:        { 3: 0.5, 4: 1.0, 5: 2.5 },
  K:        { 3: 0.5, 4: 1.0, 5: 2.3 },
  Q:        { 3: 0.4, 4: 0.9, 5: 2.0 },
  J:        { 3: 0.3, 4: 0.8, 5: 1.8 },
  "10":     { 3: 0.3, 4: 0.7, 5: 1.6 },
  wild:     {},
  scatter:  {},
};

const BASE_WEIGHTS: Record<SymbolKey, number> = {
  ship: 6, robot: 7, asteroid: 8, planet: 8,
  A: 10, K: 10, Q: 10, J: 12, "10": 12,
  wild: 0, scatter: 0  // handled separately
};

export function ways243StackersEngine(params: any = {}): Engine {
  const P = { ...DEFAULTS, ...params };

  function spin(args: SpinArgs): Promise<SpinResult> {
    const { betXP, seed } = args;
    const freeMode = !!args?.params?.freeMode;

    const rows = P.rows ?? 3;
    const reels = P.reels ?? 5;
    const R = rng(seed);

    // Per-cell symbol pick with wild/scatter overrides
    function pickBase(): SymbolKey {
      // weighted pick for regular symbols
      let total = 0;
      for (const k in BASE_WEIGHTS) total += (BASE_WEIGHTS as any)[k];
      let t = R() * total;
      for (const k of Object.keys(BASE_WEIGHTS) as SymbolKey[]) {
        t -= BASE_WEIGHTS[k];
        if (t <= 0) return k;
      }
      return "J";
    }

    const symbols: SymbolKey[][] = Array.from({ length: rows }, () => Array.from({ length: reels }, () => "J"));

    // Track which columns expand to wild stack
    const expandedCols: number[] = [];
    let scatters = 0;

    // Fill grid
    for (let c = 0; c < reels; c++) {
      for (let r = 0; r < rows; r++) {
        // scatter
        if (R() < P.scatterChance) {
          symbols[r][c] = "scatter";
          scatters++;
          continue;
        }
        // wilds only on reels 2-5
        const wildBase = P.wildChance * (freeMode ? 1.6 : 1.0);
        if (c >= 1 && R() < wildBase) {
          symbols[r][c] = "wild";
          // expand?
          const expandChance = P.expandWildChance * (freeMode ? 1.35 : 1.0);
          if (R() < expandChance) expandedCols.push(c);
          continue;
        }
        symbols[r][c] = pickBase();
      }
    }

    // Apply expansion: set entire column to wild
    for (const col of Array.from(new Set(expandedCols))) {
      for (let r = 0; r < rows; r++) symbols[r][col] = "wild";
    }

    // Calculate ways wins (exclude wild/scatter as pay symbols)
    const pays: WaysWin[] = [];
    let totalXP = 0;
    const paySyms: SymbolKey[] = ["ship","robot","asteroid","planet","A","K","Q","J","10"];

    for (const sym of paySyms) {
      let length = 0;
      let ways = 1;

      for (let c = 0; c < reels; c++) {
        // count matches on this reel (sym or wild)
        let matches = 0;
        for (let r = 0; r < rows; r++) {
          const tile = symbols[r][c];
          if (tile === sym || tile === "wild") matches++;
        }

        // reel 1 gate: must contain base symbol itself (not only wild)
        if (c === 0) {
          let baseMatches = 0;
          for (let r = 0; r < rows; r++) if (symbols[r][c] === sym) baseMatches++;
          if (baseMatches === 0) break;
        }

        if (matches === 0) break;
        length++;
        ways *= matches;
      }

      if (length >= 3) {
        const pay = PAYTABLE[sym][length];
        if (pay && ways > 0) {
          const amount = Math.floor(betXP * pay * ways);
          if (amount > 0) {
            totalXP += amount;
            pays.push({ type: "ways", symbol: sym, count: length, amountXP: amount, meta: { ways } });
          }
        }
      }
    }

    const features: Array<{ type: "freeSpins"; spins: number }> = [];
    if (scatters >= 3) {
      const spins = (P.freeSpins[String(Math.min(5, scatters)) as "3"|"4"|"5"]) ?? 8;
      features.push({ type: "freeSpins", spins });
    }

    return Promise.resolve({
      symbols,
      wins: pays,
      winXP: totalXP,
      features,
      state: { expandedCols: Array.from(new Set(expandedCols)), scatters },
    });
  }

  return { name: "ways243Stackers", spin };
}
