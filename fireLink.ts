// src/lib/casino/engines/fireLink.ts
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

type FeatureStep = {
  /** New orbs placed this step */
  placements: Array<{ r: number; c: number; value: number }>;
  /** Rows unlocked to this height (inclusive 0-index) after this step, or null if unchanged */
  unlockedToRow: number | null;
  /** Respins left after this step */
  respinsLeft: number;
};

export type FireLinkFeature = {
  kind: "fireLink";
  rows: number;      // starting visible rows
  cols: number;
  maxRows: number;
  board: (number | null)[][]; // final values; null empty; number = locked orb value
  steps: FeatureStep[];       // deterministic step sequence to animate
  total: number;              // total XP from feature
};

export type SpinResult = {
  symbols: string[][]; // base symbols (for UI if you want to show pre-trigger spin)
  wins: Array<{ type: string; amountXP: number }>;
  winXP: number;
  features?: Array<FireLinkFeature>;
  state?: any;
};

const DEFAULTS = {
  grid: { rows: 4, cols: 5 },
  maxRows: 8,
  respins: 3,
  unlockAt: [4, 8, 12],  // unlock additional rows when reaching these locked counts
  baseOrbChance: 0.18,   // chance any cell in base spin is an orb
  minOrb: 1,             // credit values multiplier on betXP
  maxOrb: 20,
  stepFillChance: 0.55,  // during feature: chance to place orbs on a given step
  stepNewOrbsMin: 1,
  stepNewOrbsMax: 3,
};

export function fireLinkEngine(params: any = {}): Engine {
  const P = { ...DEFAULTS, ...params };
  const rows = P.grid?.rows ?? 4;
  const cols = P.grid?.cols ?? 5;
  const maxRows = P.maxRows ?? Math.max(rows, 8);
  const unlockAt: number[] = Array.isArray(P.unlockAt) ? P.unlockAt.slice() : DEFAULTS.unlockAt;

  function spin(args: SpinArgs): Promise<SpinResult> {
    const { betXP, seed } = args;
    const R = rng(seed);

    // Build a simple base grid with "orb" or "sym" (not used by renderer here, but provided)
    const base: string[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (R() < P.baseOrbChance ? "orb" : "sym"))
    );

    // Count orbs to determine trigger; require >=4 like classic Fire Link to trigger
    let orbs = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (base[r][c] === "orb") orbs++;

    // If not enough to trigger, return base game with 0 XP (you can extend with line pays later)
    if (orbs < 4) {
      return Promise.resolve({
        symbols: base,
        wins: [],
        winXP: 0,
        features: [],
      });
    }

    // ----- Feature (Hold & Spin) -----
    // Starting board: active rows = rows; can unlock up to maxRows
    let activeRows = rows;
    const board: (number | null)[][] = Array.from({ length: maxRows }, () =>
      Array.from({ length: cols }, () => null as number | null)
    );

    // Seed initial locked orbs: place the base orbs randomly on active rows
    let lockedCount = 0;
    const placeInitial = Math.max(4, Math.min(orbs, rows * cols));
    for (let i = 0; i < placeInitial; i++) {
      let tries = 0;
      while (tries++ < 1000) {
        const rr = Math.floor(R() * activeRows);
        const cc = Math.floor(R() * cols);
        if (board[rr][cc] == null) {
          const v = Math.floor(betXP * (P.minOrb + Math.floor(R() * (P.maxOrb - P.minOrb + 1))));
          board[rr][cc] = Math.max(betXP, v); // at least bet
          lockedCount++;
          break;
        }
      }
    }

    // Unlock rows based on initial count
    function currentUnlockTarget(count: number): number {
      let unlockedTo = rows - 1;
      for (let i = 0; i < unlockAt.length; i++) {
        if (count >= unlockAt[i]) unlockedTo = Math.min(maxRows - 1, unlockedTo + 1);
      }
      return unlockedTo;
    }
    let unlockedToRow = currentUnlockTarget(lockedCount);
    activeRows = Math.max(activeRows, unlockedToRow + 1);

    // Now simulate respins
    let respinsLeft = P.respins;
    const steps: FeatureStep[] = [];

    while (respinsLeft > 0) {
      const placements: FeatureStep["placements"] = [];
      let anyNew = false;

      // Decide whether new orbs appear this step
      if (R() < P.stepFillChance) {
        const n = P.stepNewOrbsMin + Math.floor(R() * (P.stepNewOrbsMax - P.stepNewOrbsMin + 1));
        for (let k = 0; k < n; k++) {
          // find empty within active rows
          let placed = false;
          for (let t = 0; t < 200; t++) {
            const rr = Math.floor(R() * activeRows);
            const cc = Math.floor(R() * cols);
            if (board[rr][cc] == null) {
              const v = Math.floor(betXP * (P.minOrb + Math.floor(R() * (P.maxOrb - P.minOrb + 1))));
              board[rr][cc] = Math.max(betXP, v);
              placements.push({ r: rr, c: cc, value: board[rr][cc]! });
              lockedCount++;
              anyNew = true;
              placed = true;
              break;
            }
          }
          if (!placed) break; // board likely full in active area
        }
      }

      // Unlock more rows if thresholds crossed
      const newUnlockedTo = currentUnlockTarget(lockedCount);
      if (newUnlockedTo > unlockedToRow) {
        unlockedToRow = newUnlockedTo;
        activeRows = Math.max(activeRows, unlockedToRow + 1);
      }

      // Respins counter behavior
      if (anyNew) respinsLeft = P.respins;
      else respinsLeft -= 1;

      steps.push({ placements, unlockedToRow, respinsLeft });

      // Stop early if active area is full
      let empty = 0;
      for (let r = 0; r < activeRows; r++) for (let c = 0; c < cols; c++) if (board[r][c] == null) empty++;
      if (empty === 0) break;
    }

    // Sum total
    let total = 0;
    for (let r = 0; r < activeRows; r++) for (let c = 0; c < cols; c++) total += board[r][c] ?? 0;

    const feature: FireLinkFeature = {
      kind: "fireLink",
      rows,
      cols,
      maxRows,
      board,
      steps,
      total,
    };

    return Promise.resolve({
      symbols: base,
      wins: [{ type: "feature", amountXP: feature.total }],
      winXP: feature.total,
      features: [feature],
      state: { activeRows },
    });
  }

  return { name: "fireLink", spin };
}
