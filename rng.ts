// src/lib/casino/engines/rng.ts
import type { RNG } from "./types";

/**
* makeRng
* --------
* Seedable xorshift32 RNG for reproducible spins.
* Default seed mixes Date.now() with a golden-ratio constant.
*/
export function makeRng(seed: number = (Date.now() >>> 0) ^ 0x9e3779b9): RNG {
let s = seed >>> 0;
return () => {
// xorshift32
s ^= s << 13;
s ^= s >>> 17;
s ^= s << 5;
return ((s >>> 0) % 0x100000000) / 0x100000000; // normalized [0,1)
};
}

/* ------------------------------------------------------------------
* Helpers
* -----------------------------------------------------------------*/

/** Pick a random element from an array */
export const pick = <T>(arr: T[], rng: RNG): T =>
arr[Math.floor(rng() * arr.length)];

/** Return true with probability p (0..1) */
export function chance(p: number, rng: RNG): boolean {
return rng() < p;
}

/** Random integer between min and max (inclusive) */
export function range(min: number, max: number, rng: RNG): number {
return Math.floor(min + rng() * (max - min + 1));
}