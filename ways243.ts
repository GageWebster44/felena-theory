// src/lib/casino/engines/ways243.ts
import type { Engine, EngineParams, Outcome } from "./types";
import { buildGrid, evalWays } from "./utils";

/**
* 243‑Ways engine (ways pays)
* - Matches on consecutive reels L→R, any row (no fixed paylines).
* - Supports wild substitution and customizable target symbols.
*
* EngineParams (optional):
* - reels?: number (default 5)
* - rows?: number (default 3)
* - paytable?: { symbol; count; pays }[] // used to seed a symbol set
* - targetSymbols?: string[] // which symbols to score; default = top 3
* - wild?: string // wild symbol (substitutes any target)
* - minReelsToPay?: number // minimum consecutive reels to pay (default 3)
*/
export function ways243Engine(params: EngineParams): Engine {
const reels = params.reels ?? 5;
const rows = params.rows ?? 3;
const minReelsToPay = Math.max(2, (params as any).minReelsToPay ?? 3);

// Build a sensible symbol pool
const symbols = deriveSymbols(params);

// Choose which symbols score (e.g., premiums)
const targets: string[] =
(params as any).targetSymbols?.length
? (params as any).targetSymbols
: symbols.slice(0, 3);

const wild: string | undefined = (params as any).wild;

return {
name: "ways243",
spin({ bet }, rng): Outcome {
const grid = buildGrid(reels, rows, symbols, rng);

let totalWin = 0;
const parts: Array<{ symbol: string; reels: number; win: number }> = [];

for (const sym of targets) {
const win = evalWays(grid, sym, bet, { minReelsToPay, wild });
if (win > 0) {
const reelsMatched = countConsecutiveReels(grid, sym, { wild });
parts.push({ symbol: sym, reels: reelsMatched, win });
totalWin += win;
}
}

return {
totalWin,
events: [
{ kind: "spin", data: { grid } },
{ kind: "payout", win: totalWin, data: { parts, model: `${rows}x${reels} 243‑ways` } },
],
};
},
};
}

/* ----------------------- helpers ----------------------- */

function deriveSymbols(params: EngineParams): string[] {
const ptSyms = params.paytable?.map((p) => p.symbol) ?? [];
if (ptSyms.length >= 6) return uniq(ptSyms);

// Fallback classic pack (trim to keep reels readable)
const base = ["A", "K", "Q", "J", "10", "9", "💎", "⭐"];
return uniq([...ptSyms, ...base]).slice(0, 10);
}

function uniq<T>(arr: T[]): T[] {
return Array.from(new Set(arr));
}

/** Count consecutive reels from the left that contain either target or wild */
function countConsecutiveReels(
grid: string[][],
target: string,
opts: { wild?: string } = {}
): number {
let count = 0;
for (let r = 0; r < grid.length; r++) {
const col = grid[r];
const hit = col.some((s) => s === target || (opts.wild && s === opts.wild));
if (!hit) break;
count++;
}
return count;
}