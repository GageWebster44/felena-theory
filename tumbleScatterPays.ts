// src/lib/casino/engines/tumbleScatterPays.ts
import type { Engine, EngineParams, Outcome, RNG } from "./types";
import { pick, range, chance } from "./rng";

/**
* Tumble + Scatter Pays (Sweet‑Bonanza style)
* - Grid has no fixed paylines; symbols pay anywhere once count threshold is met
* - Each cascade ("tumble") re-fills the entire grid
* - Random multipliers ("bombs") can apply per cascade and compound across the round
*/
export function tumbleScatterPaysEngine(params: EngineParams): Engine {
const reels = params.reels ?? 6; // many scatter games use 6x5
const rows = params.rows ?? 5;
const symbols = deriveSymbols(params); // pool of symbols used to build the grid
const maxCascades = params.maxCascades ?? 4; // number of re-fills after a paying hit

// Default scatter paytable (counts are screen‑anywhere)
// e.g., pay when 8+ of the symbol appear anywhere
const paytable =
params.paytable ??
[
{ symbol: symbols[0], count: 8, pays: 2.0 }, // top fruit/gem
{ symbol: symbols[1], count: 8, pays: 1.6 },
{ symbol: symbols[2], count: 8, pays: 1.2 },
{ symbol: symbols[3], count: 8, pays: 0.8 },
];

// Random “bomb” multipliers that can drop each cascade and compound
const multipliers =
params.multipliers ??
[{ symbol: "💥", min: 2, max: 25, chance: 0.35 }];

return {
name: "tumbleScatterPays",
spin({ bet }, rng): Outcome {
const events: any[] = [];
let totalWin = 0;

// First fill (pre‑tumble spin visual)
let grid = buildGrid(reels, rows, symbols, rng);
events.push({ kind: "spin", data: { grid } });

// Tumble loop: evaluate → (maybe) award → (maybe) refill → repeat
let casc = 0;
// we allow one extra evaluation pass (cascades=0 is the initial screen)
while (casc <= maxCascades) {
const { winBase, counts } = evalScatter(grid, paytable, bet);

if (winBase <= 0) {
// no more wins → finish
break;
}

// Roll multipliers for this cascade and apply
const multi = rollMultipliers(multipliers, rng);
const winThis = winBase * multi;
totalWin += winThis;

events.push({
kind: "tumbleStep",
data: { cascade: casc, counts, baseWin: winBase, multiplier: multi, win: winThis, grid },
});

// Prepare next cascade
casc++;

// If we still have cascades to run, refill entire grid (Sweet‑Bonanza style)
if (casc <= maxCascades) {
grid = buildGrid(reels, rows, symbols, rng);
events.push({ kind: "tumbleRefill", data: { cascade: casc, grid } });
}
}

if (totalWin > 0) {
events.push({ kind: "payout", win: totalWin, data: { type: "tumbleScatterPays", cascades: casc } });
} else {
events.push({ kind: "payout", win: 0 });
}

return { totalWin, events };
},
};
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function deriveSymbols(params: EngineParams): string[] {
// If a custom paytable was passed, prefer those symbols first
const ptSyms = params.paytable?.map((p) => p.symbol) ?? [];
if (ptSyms.length >= 6) return uniq(ptSyms);

// Default symbol pack for fruit/candy style games
const base = ["🍇", "🍉", "🍌", "🍒", "🍏", "🍋", "💎", "⭐"];
return uniq([...ptSyms, ...base]).slice(0, 10);
}

function uniq<T>(arr: T[]): T[] {
return Array.from(new Set(arr));
}

/** Build a random reels×rows grid from a symbol pool */
function buildGrid(reels: number, rows: number, syms: string[], rng: RNG): string[][] {
const grid: string[][] = [];
for (let r = 0; r < reels; r++) {
const col: string[] = [];
for (let y = 0; y < rows; y++) {
col.push(pick(syms, rng));
}
grid.push(col);
}
return grid;
}

/** Evaluate scatter pays: counts symbols anywhere on screen, apply thresholds */
function evalScatter(
grid: string[][],
paytable: { symbol: string; count: number; pays: number }[],
bet: number
): { winBase: number; counts: Record<string, number> } {
const counts: Record<string, number> = {};
for (let c = 0; c < grid.length; c++) {
for (let r = 0; r < grid[c].length; r++) {
const sym = grid[c][r];
counts[sym] = (counts[sym] ?? 0) + 1;
}
}

let winBase = 0;
for (const e of paytable) {
const have = counts[e.symbol] ?? 0;
if (have >= e.count) {
winBase += bet * e.pays;
}
}
return { winBase, counts };
}

/** Roll and combine multipliers for a cascade (e.g., bombs) */
function rollMultipliers(
multis: { symbol: string; min: number; max: number; chance: number }[],
rng: RNG
): number {
let m = 1;
for (const spec of multis) {
if (chance(spec.chance, rng)) {
// integer multiplier in [min, max]
const rolled = range(Math.floor(spec.min), Math.floor(spec.max), rng);
m *= Math.max(2, rolled); // ensure at least ×2 if it hits
}
}
return m;
}