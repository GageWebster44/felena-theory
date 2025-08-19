// src/lib/casino/engines/types.ts

export type RNG = () => number; // 0..1

export type EngineName =
| "classicLines"
| "ways243"
| "tumbleScatterPays"
| "holdAndSpin"
| "hyperWays"
| "jackpotLadder";

export type SpinArgs = {
bet: number; // base bet in XP
};

export type EventKind =
| "spin" // reels landed (base grid)
| "payout" // immediate pay
| "cascade" // grid collapsed (tumble)
| "feature" // feature started/ended
| "hold" // hold-&-spin step
| "jackpot"; // jackpot step

export type Event = {
kind: EventKind;
data?: any; // keep simple for now; you can shape per engine
win?: number; // win contributed by this step
};

export type Outcome = {
totalWin: number;
events: Event[];
};

export type Engine = {
name: EngineName;
spin(args: SpinArgs, rng: RNG): Outcome;
};

// Common params each engine may accept
export type EngineParams = {
reels?: number;
rows?: number;
// classic / ways
paytable?: Array<{ symbol: string; count: number; pays: number }>;
wildSymbol?: string;
scatterSymbol?: string;
scatterPays?: Array<{ count: number; pays: number }>;
// tumble
cascades?: boolean;
multiplier?: boolean;
// hold-&-spin
respins?: number;
triggerCount?: number;
cash?: { symbol: string; min: number; max: number; chance: number };
multipliers?: Array<{ symbol: string; min: number; max: number; chance: number }>;
// hyper-ways
minPerReel?: number;
maxPerReel?: number;
// jackpot ladder
jackpots?: Array<{ label: string; pays: number; chance: number }>;
};