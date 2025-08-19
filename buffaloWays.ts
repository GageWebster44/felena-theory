// src/lib/casino/engines/buffaloWays.ts
import type { Engine } from "./types";

// Simple seeded RNG (Mulberry32)
function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type SymbolKey =
  | "buffalo" | "eagle" | "cougar" | "wolf" | "elk"
  | "A" | "K" | "Q" | "J" | "10" | "9"
  | "wild" | "bonus";

type SpinArgs = { betXP: number; seed: number; state?: any; params?: any };
type Coord = [number, number];
type Win = { type: "ways"; symbol: SymbolKey; count: number; amountXP: number; path?: Coord[]; meta?: any };

export type SpinResult = {
  symbols: SymbolKey[][];
  wins: Win[];
  winXP: number;
  features?: any[];
  state?: any;
};

const BASE_ROWS = 4;
const BASE_REELS = 5;
const REEL_INDEXES = [0,1,2,3,4];

const DEFAULT_WEIGHTS: Record<SymbolKey, number[]> = {
  buffalo: [6,5,5,5,6],
  eagle:   [7,7,7,7,7],
  cougar:  [8,8,8,8,8],
  wolf:    [8,8,8,8,8],
  elk:     [8,8,8,8,8],
  A:       [10,10,10,10,10],
  K:       [10,10,10,10,10],
  Q:       [10,10,10,10,10],
  J:       [12,12,12,12,12],
  "10":    [12,12,12,12,12],
  "9":     [12,12,12,12,12],
  wild:    [0,6,6,6,0],
  bonus:   [1,1,1,1,1],
};

const PAYTABLE: Record<SymbolKey, Record<number, number>> = {
  buffalo: { 2: 0.5, 3: 1.0, 4: 2.5, 5: 8.0 },
  eagle:   { 3: 0.8, 4: 2.0, 5: 5.0 },
  cougar:  { 3: 0.7, 4: 1.5, 5: 4.0 },
  wolf:    { 3: 0.7, 4: 1.5, 5: 4.0 },
  elk:     { 3: 0.6, 4: 1.2, 5: 3.0 },
  A:       { 3: 0.5, 4: 1.0, 5: 2.5 },
  K:       { 3: 0.5, 4: 1.0, 5: 2.4 },
  Q:       { 3: 0.4, 4: 0.8, 5: 2.0 },
  J:       { 3: 0.4, 4: 0.8, 5: 2.0 },
  "10":    { 3: 0.3, 4: 0.6, 5: 1.6 },
  "9":     { 3: 0.3, 4: 0.6, 5: 1.5 },
  wild:    {},
  bonus:   {},
};

function pickByWeight(r: () => number, weights: Record<SymbolKey, number[]>, reel: number): SymbolKey {
  let total = 0;
  for (const k in weights) total += weights[k as SymbolKey][reel];
  let t = r() * total;
  for (const k of Object.keys(weights) as SymbolKey[]) {
    t -= weights[k][reel];
    if (t <= 0) return k;
  }
  return "J";
}

export function buffaloWaysEngine(params: any = {}): Engine {
  const rows = params.rows ?? params.grid?.rows ?? BASE_ROWS;
  const reels = params.reels ?? params.grid?.cols ?? BASE_REELS;
  const wildMultChoices: number[] = params.wildMultipliers ?? [2,3];
  const wildMultChance = params.wildMultiplierChance ?? 0.15;
  const weights = params.weights ?? DEFAULT_WEIGHTS;

  function spin(args: SpinArgs): Promise<SpinResult> {
    const { betXP, seed } = args;
    const rnd = rng(seed);
    const symbols: SymbolKey[][] = Array.from({ length: rows }, () => Array.from({ length: reels }, () => "J" as SymbolKey));
    const wildMultAt: Record<string, number> = {};

    for (let c = 0; c < reels; c++) {
      for (let rIdx = 0; rIdx < rows; rIdx++) {
        const s = pickByWeight(rnd, weights, c);
        if (c === 0 && (s === "wild")) {
          const w2 = { ...weights, wild: [0,0,0,0,0] };
          symbols[rIdx][c] = pickByWeight(rnd, w2, c);
        } else {
          symbols[rIdx][c] = s;
        }
        if (symbols[rIdx][c] === "wild" && c >= 1 && c <= 3 && rnd() < wildMultChance) {
          const m = wildMultChoices[Math.floor(rnd() * wildMultChoices.length)];
          wildMultAt[`${rIdx},${c}`] = m;
        }
      }
    }

    const wins: Win[] = [];
    let totalXP = 0;

    const paySyms: SymbolKey[] = ["buffalo","eagle","cougar","wolf","elk","A","K","Q","J","10","9"];
    for (const sym of paySyms) {
      let length = 0;
      let ways = 1;
      let totalMult = 1;
      for (let c = 0; c < reels; c++) {
        let matches = 0;
        let reelMult = 1;
        for (let rIdx = 0; rIdx < rows; rIdx++) {
          const tile = symbols[rIdx][c];
          if (tile === sym || tile === "wild") {
            matches++;
            const wm = wildMultAt[`${rIdx},${c}`];
            if (wm) reelMult = Math.max(reelMult, wm);
          }
        }
        if (c === 0) {
          let baseMatches = 0;
          for (let rIdx = 0; rIdx < rows; rIdx++) if (symbols[rIdx][c] === sym) baseMatches++;
          if (baseMatches === 0) break;
        }
        if (matches === 0) break;
        length++;
        ways *= matches;
        totalMult *= reelMult;
      }
      if (length >= 2) {
        const pay = PAYTABLE[sym][length];
        if (pay && ways > 0) {
          const amount = Math.floor(betXP * pay * ways * totalMult);
          if (amount > 0) {
            totalXP += amount;
            wins.push({ type: "ways", symbol: sym, count: length, amountXP: amount, meta: { ways, totalMult } });
          }
        }
      }
    }

    const scatters = REEL_INDEXES.reduce((acc, c) => {
      for (let rIdx = 0; rIdx < rows; rIdx++) if (symbols[rIdx][c] === "bonus") return acc + 1;
      return acc;
    }, 0);
    if (scatters >= 3) {
      wins.push({ type: "ways", symbol: "bonus", count: scatters, amountXP: Math.floor(betXP * 2 * (scatters - 2)), meta: { scatters } });
      totalXP += Math.floor(betXP * 2 * (scatters - 2));
    }

    return Promise.resolve({ symbols, wins, winXP: totalXP, state: { wildMultAt } });
  }

  return { name: "buffaloWays", spin };
}
