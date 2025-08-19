// src/lib/casino/engines/utils.ts

// ---------- RNG ----------
// Use an LCG so results are reproducible if you pass a seed.
// If you already have makeRng() in rng.ts, keep using that;
// these helpers are generic and can work with Math.random too.

export type Rng = () => number;

export function lcg(seed = Date.now() % 2147483647): Rng {
let s = seed;
return () => {
// 16807 Park–Miller
s = (s * 16807) % 2147483647;
return (s - 1) / 2147483646;
};
}

// ---------- Array / math helpers ----------
export const clamp = (v: number, lo: number, hi: number) =>
Math.max(lo, Math.min(hi, v));

export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export function choice<T>(arr: T[], rng: Rng = Math.random): T {
if (arr.length === 0) throw new Error("choice() on empty array");
const i = Math.floor(rng() * arr.length);
return arr[i];
}

export function sample<T>(arr: T[], k: number, rng: Rng = Math.random): T[] {
const copy = arr.slice();
const out: T[] = [];
for (let i = 0; i < Math.min(k, copy.length); i++) {
const idx = Math.floor(rng() * copy.length);
out.push(copy.splice(idx, 1)[0]);
}
return out;
}

export function weightedChoice<T>(
items: T[],
weights: number[],
rng: Rng = Math.random
): T {
if (items.length !== weights.length) {
throw new Error("weightedChoice: items/weights length mismatch");
}
const total = sum(weights);
if (total <= 0) return items[0];
let r = rng() * total;
for (let i = 0; i < items.length; i++) {
r -= weights[i];
if (r <= 0) return items[i];
}
return items[items.length - 1];
}

export const randInt = (min: number, max: number, rng: Rng = Math.random) =>
Math.floor(rng() * (max - min + 1)) + min;

export const chance = (p: number, rng: Rng = Math.random) => rng() < p;