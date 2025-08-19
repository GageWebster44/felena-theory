// src/lib/casino/engines/holdAndSpinPlus.ts
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

type BoardCell = {
  kind: "cash" | "jackpot" | "collector";
  value?: number;           // for cash
  jp?: "Mini" | "Minor" | "Major" | "Grand";
};

type Step = {
  placements: Array<{ r: number; c: number; cell: BoardCell }>;
  respinsLeft: number;
};

export type HoldAndSpinFeature = {
  kind: "holdAndSpinPlus";
  rows: number;
  cols: number;
  board: (BoardCell | null)[][];  // final board
  steps: Step[];
  total: number;                  // total XP
  jackpots: Record<string, number>; // counts per tier
};

export type SpinResult = {
  symbols: string[][]; // optional base
  wins: Array<{ type: string; amountXP: number }>;
  winXP: number;
  features?: Array<HoldAndSpinFeature>;
  state?: any;
};

const DEFAULTS = {
  grid: { rows: 3, cols: 5 },
  respins: 3,
  baseCashChance: 0.15,     // chance a base tile is a cash symbol
  triggerCount: 6,          // need >= N cash to trigger
  cashMin: 1, cashMax: 20,  // cash values * betXP
  collectorChance: 0.02,    // rare collector that sums all visible
  jackpots: [
    { label: "Mini",  pays: 10, chance: 0.020 },
    { label: "Minor", pays: 25, chance: 0.010 },
    { label: "Major", pays: 100, chance: 0.003 },
    { label: "Grand", pays: 500, chance: 0.0007 },
  ],
  stepFillChance: 0.60,     // during feature, chance to place new tiles
  stepNewMin: 1, stepNewMax: 3,
};

export function holdAndSpinPlusEngine(params: any = {}): Engine {
  const P = { ...DEFAULTS, ...params };
  const rows = P.grid?.rows ?? 3;
  const cols = P.grid?.cols ?? 5;

  function pickJackpot(r: () => number) : BoardCell | null {
    let x = r();
    for (const jp of P.jackpots as Array<{label:string;pays:number;chance:number}>) {
      if (x < jp.chance) return { kind: "jackpot", jp: jp.label as any };
      x -= jp.chance;
    }
    return null;
  }

  function spin(args: SpinArgs): Promise<SpinResult> {
    const { betXP, seed } = args;
    const R = rng(seed);

    // Base grid: simple placeholder; we care about cash count to trigger
    const base: string[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (R() < P.baseCashChance ? "cash" : "sym"))
    );

    let baseCash = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (base[r][c] === "cash") baseCash++;

    if (baseCash < P.triggerCount) {
      return Promise.resolve({ symbols: base, wins: [], winXP: 0, features: [] });
    }

    // Feature starts
    let respinsLeft = P.respins;
    const board: (BoardCell | null)[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => null as BoardCell | null)
    );

    // Place initial cash tokens randomly using baseCash as a guide
    let seeded = Math.max(P.triggerCount, Math.min(baseCash, rows * cols));
    for (let i = 0; i < seeded; i++) {
      for (let t = 0; t < 200; t++) {
        const rr = Math.floor(R() * rows);
        const cc = Math.floor(R() * cols);
        if (board[rr][cc] == null) {
          // Pick cash or rare jackpot/collector
          const maybeJP = pickJackpot(R);
          if (maybeJP) {
            board[rr][cc] = maybeJP;
          } else if (R() < P.collectorChance) {
            board[rr][cc] = { kind: "collector" };
          } else {
            const v = Math.max(1, Math.floor(betXP * (P.cashMin + Math.floor(R() * (P.cashMax - P.cashMin + 1)))));
            board[rr][cc] = { kind: "cash", value: v };
          }
          break;
        }
      }
    }

    const steps: Step[] = [];
    const jpCounts: Record<string, number> = { Mini:0, Minor:0, Major:0, Grand:0 };

    // Respins loop
    while (respinsLeft > 0) {
      const placements: Step["placements"] = [];
      let anyNew = false;

      if (R() < P.stepFillChance) {
        const n = P.stepNewMin + Math.floor(R() * (P.stepNewMax - P.stepNewMin + 1));
        for (let k = 0; k < n; k++) {
          let placed = false;
          for (let t = 0; t < 200; t++) {
            const rr = Math.floor(R() * rows);
            const cc = Math.floor(R() * cols);
            if (board[rr][cc] == null) {
              let cell: BoardCell | null = pickJackpot(R);
              if (!cell) {
                if (R() < P.collectorChance) cell = { kind: "collector" };
                else {
                  const v = Math.max(1, Math.floor(betXP * (P.cashMin + Math.floor(R() * (P.cashMax - P.cashMin + 1)))));
                  cell = { kind: "cash", value: v };
                }
              }
              board[rr][cc] = cell;
              placements.push({ r: rr, c: cc, cell: cell! });
              anyNew = true;

              // collector: earn sum of all visible immediate
              if (cell.kind === "collector") {
                let sum = 0;
                for (let r = 0; r < rows; r++)
                  for (let c = 0; c < cols; c++) {
                    const cur = board[r][c];
                    if (cur?.kind === "cash") sum += cur.value || 0;
                    if (cur?.kind === "jackpot") {
                      const tier = (cur.jp || "Mini");
                      const found = (P.jackpots as any).find((j:any)=> j.label===tier);
                      if (found) sum += Math.floor(betXP * found.pays);
                    }
                  }
                // place a visible cash token representing the collect
                board[rr][cc] = { kind: "cash", value: sum };
                placements[placements.length-1].cell = board[rr][cc]!;
              }

              if (cell.kind === "jackpot" && cell.jp) jpCounts[cell.jp]++;
              placed = true;
              break;
            }
          }
          if (!placed) break;
        }
      }

      if (anyNew) respinsLeft = P.respins;
      else respinsLeft -= 1;

      steps.push({ placements, respinsLeft });

      // Stop if board full
      let empty = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (board[r][c] == null) empty++;
      if (empty === 0) break;
    }

    // Total
    let total = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      if (cell.kind === "cash") total += cell.value || 0;
      if (cell.kind === "jackpot" && cell.jp) {
        const f = (P.jackpots as any).find((j:any)=> j.label===cell.jp);
        if (f) total += Math.floor(betXP * f.pays);
      }
    }

    const feature: HoldAndSpinFeature = {
      kind: "holdAndSpinPlus",
      rows, cols,
      board,
      steps,
      total,
      jackpots: jpCounts,
    };

    return Promise.resolve({
      symbols: base,
      wins: [{ type: "feature", amountXP: total }],
      winXP: total,
      features: [feature],
    });
  }

  return { name: "holdAndSpinPlus", spin };
}
