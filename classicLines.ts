// src/lib/casino/engines/classicLines.ts
import type { Engine, EngineParams, Outcome, RNG } from "./types";

/**
* Classic 9/20/25-line style math (demo-simple):
* - 5x3 grid
* - Left-to-right evaluation per row
* - Pays on 3+ matching from reel 0
* - Uses params.paytable if provided, otherwise a default one
*
* Grid shape: string[reel][row]
*/
export function classicLinesEngine(params: EngineParams): Engine {
const reels = params.reels ?? 5;
const rows = params.rows ?? 3;

// Symbols: if paytable provided, prefer those symbols, then fill with defaults
const symbols = deriveSymbols(params);

// Minimal paytable (count is the minimum consecutive from reel 0)
const paytable: PayItem[] = (params.paytable as PayItem[] | undefined) ?? [
{ symbol: symbols[0], count: 3, pays: 1.0 },
{ symbol: symbols[1], count: 3, pays: 0.8 },
{ symbol: symbols[2], count: 3, pays: 0.6 },
];

return {
name: "classicLines",
spin({ bet = 1 }: { bet: number }, rng: RNG): Outcome {
const grid = buildGrid(reels, rows, symbols, rng);
const lineWin = evalLinesL2R(grid, paytable, bet);

return {
totalWin: lineWin,
events: [
{ kind: "spin", data: { grid } },
lineWin
? { kind: "payout", win: lineWin, data: { type: "lines" } }
: { kind: "payout", win: 0 },
],
};
},
};
}

/* --------------------------- Helpers --------------------------- */

type PayItem = { symbol: string; count: number; pays: number };

/** Prefer paytable symbols if provided; top up with defaults to ~7 symbols */
function deriveSymbols(params: EngineParams): string[] {
const ptSyms = (params.paytable as PayItem[] | undefined)?.map((p) => p.symbol) ?? [];
const base = ["💎", "7️⃣", "🍒", "🔔", "🍋", "⭐", "BAR"];
const merged = [...ptSyms, ...base].slice(0, 7);
// remove dupes preserving order
const seen = new Set<string>();
return merged.filter((s) => (seen.has(s) ? false : (seen.add(s), true)));
}

/** Build a random grid [reel][row] using the provided RNG */
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

/**
* Evaluate left-to-right per row:
* - Count how many consecutive reels (from reel 0) match the first symbol.
* - If count >= any paytable threshold for that symbol, award the best match.
*/
function evalLinesL2R(grid: string[][], paytable: PayItem[], bet: number): number {
if (!grid.length || !grid[0]?.length) return 0;
const reels = grid.length;
const rows = grid[0].length;

let total = 0;

for (let row = 0; row < rows; row++) {
const first = grid[0][row];
let run = 1;
for (let r = 1; r < reels; r++) {
if (grid[r][row] === first) run++;
else break;
}

if (run >= 3) {
// choose the best paying bracket for this symbol with count <= run
const best = paytable
.filter((p) => p.symbol === first && run >= p.count)
.sort((a, b) => b.pays - a.pays)[0];

if (best) total += bet * best.pays;
}
}

// Round to nearest cent-equivalent if you want discrete XP
return Math.round(total * 100) / 100;
}