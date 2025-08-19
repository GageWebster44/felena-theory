// src/lib/casino/engines/hyperWays.ts
import type { Engine, EngineParams, Outcome, RNG } from "./types";
import { range, pick } from "./rng";

export function hyperWaysEngine(params: EngineParams): Engine {
const reels = params.reels ?? 5;
const minPer = params.minPerReel ?? 2;
const maxPer = params.maxPerReel ?? 7;
const symbols = ["A","K","Q","J","10","9","💎","⭐"];

return {
name: "hyperWays",
spin({ bet }, rng): Outcome {
const grid: string[][] = [];
const reelSizes: number[] = [];
for (let r = 0; r < reels; r++) {
const rows = range(minPer, maxPer, rng);
reelSizes.push(rows);
grid.push(new Array(rows).fill(0).map(() => pick(symbols, rng)));
}
// demo pay: reward for longest contiguous symbol start
const target = "💎";
let matched = 0;
for (let r = 0; r < reels; r++) {
if (grid[r].some(v => v === target)) matched++; else break;
}
const win = matched >= 3 ? bet * matched * 0.6 : 0;

return {
totalWin: win,
events: [
{ kind: "spin", data: { grid, reelSizes } },
{ kind: "payout", win, data: { symbol: target } },
],
};
},
};
}