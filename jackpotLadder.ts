// src/lib/casino/engines/jackpotLadder.ts
import type { Engine, EngineParams, Outcome, RNG } from "./types";
import { chance, pick } from "./rng";

/**
* Jackpot Ladder — lightweight feature that occasionally
* triggers a weighted jackpot selection (Mini → Grand).
*
* Tunables you can pass via registry `params`:
* - triggerChance?: number // base chance to enter the ladder (default 0.12)
* - jackpots?: { label: string; pays: number; chance: number }[]
* pays = multiplier on bet (e.g., 25 => 25×bet)
* chance = relative weight for selection (not necessarily summing to 1)
*
* Emits events so the UI can animate a mini “ladder” reveal.
*/
export function jackpotLadderEngine(params: EngineParams): Engine {
const triggerChance: number =
typeof (params as any).triggerChance === "number" ? (params as any).triggerChance : 0.12;

const jackpots: { label: string; pays: number; chance: number }[] =
(params as any).jackpots ?? [
{ label: "Mini", pays: 10, chance: 0.30 },
{ label: "Minor", pays: 25, chance: 0.15 },
{ label: "Major", pays: 100, chance: 0.04 },
{ label: "Grand", pays: 500, chance: 0.01 },
];

// Defensive: ensure at least one valid jackpot
const saneJackpots = jackpots.filter(j => j && j.pays > 0 && j.chance > 0);
const poolEmptyFallback = saneJackpots.length ? saneJackpots : [{ label: "Mini", pays: 10, chance: 1 }];

return {
name: "jackpotLadder",

spin({ bet = 1 }: { bet: number }, rng: RNG): Outcome {
const events: any[] = [{ kind: "spin", data: { grid: null } }];

// Gate: does the feature trigger this spin?
const triggered = chance(triggerChance, rng);
if (!triggered) {
events.push({ kind: "payout", win: 0 });
return { totalWin: 0, events };
}

// Build a simple weighted pool; weights are chance * 100 for readability.
// (For large sets you might switch to cumulative weights; this keeps it simple.)
const pool = poolEmptyFallback.flatMap(j => {
const weight = Math.max(1, Math.round(j.chance * 100));
return new Array(weight).fill(j);
});

events.push({ kind: "feature", data: { mode: "jackpot", state: "start" } });

const hit = pick(pool, rng);
const win = Math.max(0, Math.round(bet * hit.pays));

// Optional: emit a small “climb” animation path
// (UI can step through these before revealing the final hit)
const climb = shuffle(poolEmptyFallback.map(j => j.label), rng).slice(0, 3);
events.push({ kind: "jackpotClimb", data: { path: climb } });

events.push({ kind: "jackpot", data: { label: hit.label, pays: hit.pays }, win });
events.push({ kind: "feature", data: { mode: "jackpot", state: "end" } });
events.push({ kind: "payout", win, data: { type: "jackpot" } });

return { totalWin: win, events };
},
};
}

/* -------------------------- local helpers -------------------------- */

// Fisher–Yates shuffle (pure, seeded by provided RNG)
function shuffle<T>(arr: T[], rng: RNG): T[] {
const a = arr.slice();
for (let i = a.length - 1; i > 0; i--) {
const j = Math.floor(rng() * (i + 1));
[a[i], a[j]] = [a[j], a[i]];
}
return a;
}