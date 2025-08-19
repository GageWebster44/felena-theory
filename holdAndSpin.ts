// src/lib/casino/engines/holdAndSpin.ts
import type { Engine, EngineParams, Outcome, RNG } from "./types";

/**
* Hold & Spin (FireLink/Link-style) — demo implementation
* -------------------------------------------------------
* - Base spin creates a normal cabinet grid (for visuals)
* - If enough "cash" symbols land (or a small random bump hits), trigger feature
* - Feature board is 5x3 (reels x rows) of locked values with respins
* - Each time at least one new value lands, respins reset; otherwise decrement
* - Payout is the sum of locked values * bet * payoutScale
*
* Params you can pass via registry:
* cash: { symbol: string; min: number; max: number; chance: number } // land chance per try
* respins: number // starting respins (default 3)
* triggerCount: number // min cash on base spin to trigger (default 6)
* payoutScale: number // multiplier on sum * bet (default 0.02)
* reels, rows: number // defaults 5x3
*/
export function holdAndSpinEngine(params: EngineParams): Engine {
const reels = params.reels ?? 5;
const rows = params.rows ?? 3;

const cash = params.cash ?? { symbol: "💰", min: 1, max: 50, chance: 0.08 };
const respinsBase = typeof params.respins === "number" ? params.respins : 3;
const triggerCount = typeof params.triggerCount === "number" ? params.triggerCount : 6;
const payoutScale = typeof (params as any).payoutScale === "number" ? (params as any).payoutScale : 0.02;

// base cabinet symbol pack (include the cash symbol)
const baseSymbols = params.symbols ?? ["A", "K", "Q", "J", "10", "9", cash.symbol];

return {
name: "holdAndSpin",

spin({ bet = 1 }: { bet: number }, rng: RNG): Outcome {
// 1) Base spin (purely visual for now)
const baseGrid = buildGrid(reels, rows, baseSymbols, rng);
const events: any[] = [{ kind: "spin", data: { grid: baseGrid } }];

// 2) Trigger check
const cashHits = baseGrid.flat().filter((s) => s === cash.symbol).length;
const bumped = chance(0.15, rng); // small bump so feature appears in demo
const triggered = cashHits >= triggerCount || bumped;

if (!triggered) {
return { totalWin: 0, events: [...events, { kind: "payout", win: 0 }] };
}

// 3) Feature start
events.push({ kind: "feature", data: { mode: "holdAndSpin", state: "start" } });

// Feature board of locked numbers (null = empty)
const board: (number | null)[][] = Array.from({ length: reels }, () =>
Array.from({ length: rows }, () => null)
);

// Seed initial locked values based on cashHits (or at least 3 if only bumped)
const initial = Math.max(3, cashHits);
let filled = 0;
for (let i = 0; i < initial && filled < reels * rows; i++) {
const [x, y] = findEmpty(board, rng);
board[x][y] = rangeInt(cash.min, cash.max, rng);
filled++;
}

let respins = respinsBase;
let step = 0;

// 4) Respins loop
while (respins > 0 && filled < reels * rows) {
let landed = 0;

// Try a handful of random placements each step (0..3)
const tries = rangeInt(0, 3, rng);
for (let t = 0; t < tries; t++) {
if (chance(cash.chance + 0.05, rng)) {
const [x, y] = findEmpty(board, rng);
if (board[x][y] == null) {
board[x][y] = rangeInt(cash.min, cash.max, rng);
landed++;
filled++;
if (filled >= reels * rows) break;
}
}
}

if (landed > 0) respins = respinsBase;
else respins--;

// push a snapshot so UI can animate
events.push({ kind: "hold", data: { board: cloneBoard(board), respins, step, landed } });
step++;
}

// 5) End + payout
const sum = board.flat().reduce((a, v) => a + (v ?? 0), 0);
const winXP = round2(sum * bet * payoutScale);

events.push({ kind: "feature", data: { mode: "holdAndSpin", state: "end" } });
events.push({ kind: "payout", win: winXP, data: { type: "holdAndSpin" } });

return { totalWin: winXP, events };
},
};
}

/* --------------------------- Local helpers --------------------------- */

function buildGrid(reels: number, rows: number, symbols: string[], rng: RNG): string[][] {
const grid: string[][] = new Array(reels);
for (let r = 0; r < reels; r++) {
const col: string[] = new Array(rows);
for (let y = 0; y < rows; y++) {
col[y] = symbols[Math.floor(rng() * symbols.length)];
}
grid[r] = col;
}
return grid;
}

function chance(p: number, rng: RNG): boolean {
return rng() < p;
}

function rangeInt(min: number, max: number, rng: RNG): number {
// inclusive range
const lo = Math.min(min, max);
const hi = Math.max(min, max);
return lo + Math.floor(rng() * (hi - lo + 1));
}

function cloneBoard<T>(g: T[][]): T[][] {
return g.map((col) => col.slice());
}

function round2(n: number): number {
return Math.round(n * 100) / 100;
}

/** Pick a random empty cell on the board; if full, return (0,0) */
function findEmpty(board: (number | null)[][], rng: RNG): [number, number] {
const coords: Array<[number, number]> = [];
for (let x = 0; x < board.length; x++) {
for (let y = 0; y < board[0].length; y++) {
if (board[x][y] == null) coords.push([x, y]);
}
}
if (!coords.length) return [0, 0];
return coords[Math.floor(rng() * coords.length)];
}