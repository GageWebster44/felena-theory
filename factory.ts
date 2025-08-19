// src/lib/casino/engines/factory.ts
import type { Engine } from "./types";

import { classicLinesEngine } from "./classicLines";
import { ways243Engine } from "./ways243";
import { holdAndSpinEngine } from "./holdAndSpin";
import { hyperWaysEngine } from "./hyperWays";
import { jackpotLadderEngine } from "./jackpotLadder";
import { tumbleScatterPaysEngine } from "./tumbleScatterPays";

// If you want slot-aware builds, import the registry type (no runtime dep).
// This keeps factory independent of the registry at runtime.
export type SlotLike = {
title?: string;
theme?: string;
payways?: number;
engine?: string;
params?: Record<string, any>;
};

type Params = Record<string, any>;

/* -----------------------------------------------------------
* Theme → default symbol packs (used when a slot doesn't pass symbols)
* Add/adjust as your art set grows.
* --------------------------------------------------------- */
const THEME_SYMBOLS: Record<string, string[]> = {
horror: ["🕯️", "🕸️", "🎃", "🧪", "☠️", "🪦", "👻"],
jukebox: ["🎵", "🎶", "🎛️", "🎚️", "🎙️", "🎧", "💿"],
neon: ["⭐", "💎", "7️⃣", "🍒", "🔔", "🍋", "BAR"],
space: ["🚀", "🛰️", "🪐", "🌟", "🌌", "👾", "💫"],
farm: ["🐔", "🌽", "🐮", "🥚", "🐷", "🚜", "🐑"],
cantina: ["🌮", "🎺", "🌶️", "🍹", "🪇", "🎉", "🪅"],
cyber: ["🧪", "🔧", "🧰", "🧬", "🪫", "🧷", "⚙️"],
easy: ["🍀", "🍏", "🍭", "🧁", "🍬", "🍪", "⭐"],
savannah: ["🦁", "🦓", "🦒", "🐘", "🌿", "🪵", "🥩"],
dungeon: ["🗝️", "🧭", "🧱", "🗡️", "🛡️", "💎", "🧪"],
hacker: ["🖥️", "🧩", "🧠", "🪪", "🧿", "🪫", "🧬"],
superhero: ["🎭", "🦸‍♂️", "🦸‍♀️", "🛡️", "⚡", "🪨", "🧪"],
volcano: ["🌋", "🔥", "💰", "🪨", "⛏️", "⚒️", "💎"],
arctic: ["🧊", "❄️", "🐧", "🧥", "🐻‍❄️", "🧊", "🌨️"],
cats: ["🐾", "🐱", "🐈‍⬛", "🧶", "🐟", "🥛", "⭐"],
ocean: ["🐚", "🦀", "🦑", "🐠", "🌊", "⚓", "💎"],
racer: ["🏁", "🛞", "⛽", "🧰", "💨", "🧪", "🔧"],
mines: ["⛏️", "🪨", "💎", "🛠️", "🕳️", "🧪", "🪙"],
vampire: ["🧛‍♂️", "🩸", "🧛‍♀️", "🕯️", "🦇", "⚰️", "🕸️"],
galaxy: ["🌌", "🪐", "✨", "💫", "🛰️", "🚀", "⭐"],
time: ["⏳", "⌚", "🧪", "🕰️", "⚙️", "🧲", "🔁"],
classic: ["💎", "7️⃣", "🍒", "🔔", "🍋", "⭐", "BAR"],
// 🔰 nuclear — for Global Meltdown
nuclear: ["☣️", "☢️", "😷", "💥", "💀", "💎"],
};

const FALLBACK_SYMBOLS = THEME_SYMBOLS.neon;

/* Also allow param.symbolSet of keys → map to glyphs */
const SYMBOL_LOOKUP: Record<string, string> = {
biohazard: "☣️",
radioactive: "☢️",
gasMask: "😷",
explosion: "💥",
skull: "💀",
diamond: "💎",
reactor: "🔆", // reserved bonus reactor if UI/engine needs to display it
};

function resolveSymbols(params: Params, theme: string | undefined): string[] {
// Highest priority: explicit glyph array
if (Array.isArray(params.symbols) && params.symbols.length) return params.symbols;

// Next: named keys → glyphs
if (Array.isArray(params.symbolSet) && params.symbolSet.length) {
const mapped = params.symbolSet
.map((k: string) => SYMBOL_LOOKUP[k] || k)
.filter(Boolean);
if (mapped.length) return mapped;
}

// Then: theme pack
if (theme && THEME_SYMBOLS[theme]) return THEME_SYMBOLS[theme];

// Fallback
return FALLBACK_SYMBOLS;
}

/* -----------------------------------------------------------
* Engine builders (one builder per engine id)
* Add new engines here and they become available to every slot.
* --------------------------------------------------------- */

function buildClassicLines(params: Params): Engine {
// sensible defaults; can be overridden per slot via params
return classicLinesEngine({
reels: params.reels ?? 5,
rows: params.rows ?? 3,
paytable:
params.paytable ??
[
{ symbol: "💎", count: 3, pays: 1.0 },
{ symbol: "7️⃣", count: 3, pays: 0.8 },
{ symbol: "🍒", count: 3, pays: 0.6 },
],
...params,
});
}

function buildWays243(params: Params): Engine {
return ways243Engine({
reels: params.reels ?? 5,
rows: params.rows ?? 3,
paytable:
params.paytable ??
[
{ symbol: "A", count: 3, pays: 0.8 },
{ symbol: "K", count: 3, pays: 0.7 },
{ symbol: "Q", count: 3, pays: 0.6 },
],
...params,
});
}

function buildHoldAndSpin(params: Params): Engine {
return holdAndSpinEngine({
reels: params.reels ?? 5,
rows: params.rows ?? 3,
cash: params.cash ?? { symbol: "💰", min: 1, max: 50, chance: 0.08 },
triggerCount: params.triggerCount ?? 6,
respins: params.respins ?? 3,
...params,
});
}

function buildHyperWays(params: Params): Engine {
return hyperWaysEngine({
reels: params.reels ?? 5,
minPerReel: params.minPerReel ?? 2,
maxPerReel: params.maxPerReel ?? 7,
...params,
});
}

function buildJackpotLadder(params: Params): Engine {
return jackpotLadderEngine({
jackpots:
params.jackpots ??
[
{ label: "Mini", pays: 10, chance: 0.30 },
{ label: "Minor", pays: 25, chance: 0.15 },
{ label: "Major", pays: 100, chance: 0.04 },
{ label: "Grand", pays: 500, chance: 0.01 },
],
...params,
});
}

function buildTumbleScatterPays(params: Params): Engine {
// Support both (rows,reels) and grid { rows, cols }
const gridRows = params.grid?.rows ?? params.rows ?? 5; // default 5
const gridCols = params.grid?.cols ?? params.reels ?? 6; // default 6 (Sweet Bonanza feel)

const cfg = {
// Normalized names expected by tumble engine (if your engine uses different keys, adjust here)
reels: gridCols,
rows: gridRows,

// Symbols
symbols: params._resolvedSymbols ?? params.symbols ?? ["🍇", "🍉", "🍬", "🍭", "💎", "⭐", "🍊", "🍎"],

// Scatter pays table (engine may compute payouts differently; this is a baseline)
paytable:
params.paytable ??
[
{ symbol: (params._resolvedSymbols?.[0] ?? "🍇"), count: params.scatterMin ?? 8, pays: 2.0 },
{ symbol: (params._resolvedSymbols?.[1] ?? "🍉"), count: params.scatterMin ?? 8, pays: 1.6 },
{ symbol: (params._resolvedSymbols?.[2] ?? "🍬"), count: params.scatterMin ?? 8, pays: 1.2 },
{ symbol: (params._resolvedSymbols?.[3] ?? "🍭"), count: params.scatterMin ?? 8, pays: 1.0 },
],

// Multipliers / specials (pass-through; engine may choose to use them)
multipliers: params.multipliers ?? [{ symbol: "💎", min: 2, max: 25, chance: 0.30 }],

// Extended knobs for nuclear variant (engine can read these)
scatterMin: params.scatterMin ?? 8,
cascades: params.cascades ?? true,
multiplier: params.multiplier ?? true,
nuclearWild: params.nuclearWild ?? false,
reactorSpawnChance: params.reactorSpawnChance ?? 0, // reactors only if you implement in engine
multiplierPills: params.multiplierPills ?? [2, 3, 5, 10],
maxMultiplier: params.maxMultiplier ?? 10,
};

const core = tumbleScatterPaysEngine(cfg);
return { name: "tumbleScatterPays", spin: core.spin };
}

/* -----------------------------------------------------------
* Map of all available engines
* --------------------------------------------------------- */
export type EngineName =
| "classicLines"
| "ways243"
| "holdAndSpin"
| "hyperWays"
| "jackpotLadder"
| "tumbleScatterPays";

const BUILDERS: Record<EngineName, (p: Params) => Engine> = {
classicLines: buildClassicLines,
ways243: buildWays243,
holdAndSpin: buildHoldAndSpin,
hyperWays: buildHyperWays,
jackpotLadder: buildJackpotLadder,
tumbleScatterPays: buildTumbleScatterPays,
};

/* -----------------------------------------------------------
* Public API
* --------------------------------------------------------- */

/** Build by engine name. Unknown names fall back to classicLines. */
export function buildEngine(name: string = "classicLines", params: Params = {}): Engine {
const key = (name as EngineName) in BUILDERS ? (name as EngineName) : "classicLines";
return BUILDERS[key](params);
}

/**
* Convenience: build from a slot config (theme-aware defaults).
* - Picks symbol pack from theme when caller didn’t pass one
* - Applies reasonable defaults per engine
* - Normalizes grid for tumble engines (grid.rows/grid.cols → rows/reels)
*/
export function buildEngineForSlot(slot: SlotLike): Engine {
const engineName = (slot.engine ?? "classicLines") as EngineName;

// Theme-aware symbols, overridable by params.symbols or params.symbolSet
const themeSymbols = THEME_SYMBOLS[slot.theme ?? ""] ?? FALLBACK_SYMBOLS;
const resolvedSymbols = resolveSymbols(slot.params ?? {}, slot.theme);

// Merge slot params with theme-aware defaults
const merged: Params = {
// Shared fallbacks
reels: 5,
rows: 3,

// Theme / explicit symbols used by engines that look for them
symbols: resolvedSymbols,
_resolvedSymbols: resolvedSymbols, // internal helper for tumble defaults above

// Per-slot overrides (take precedence)
...(slot.params ?? {}),
};

// Normalize grid aliases if slot provided grid shape
if (merged.grid && (merged.grid.rows || merged.grid.cols)) {
if (typeof merged.grid.rows === "number") merged.rows = merged.grid.rows;
if (typeof merged.grid.cols === "number") merged.reels = merged.grid.cols;
}

// If the slot didn’t pass symbols at all and theme exists, ensure symbols default from theme
if (!slot.params?.symbols && !slot.params?.symbolSet) {
merged.symbols = themeSymbols;
merged._resolvedSymbols = themeSymbols;
}

return buildEngine(engineName, merged);
}

/** Export the theme symbol helper in case games want it for UI. */
export function getThemeSymbols(theme?: string): string[] {
return THEME_SYMBOLS[theme ?? ""] ?? FALLBACK_SYMBOLS;
}