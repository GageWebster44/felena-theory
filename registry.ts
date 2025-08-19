export type Volatility = "low" | "med" | "high";

// name of the math engine to load
export type EngineType =
| "classicLines"
| "tumbleScatterPays"
| "holdAndSpin"
| "ways243"
| "hyperWays"
| "jackpotLadder"
| "custom";

export type SlotConfig = {
slug: string;
title: string;
theme: string;
payways: number;
volatility: Volatility;
engine?: EngineType; // which engine the slot uses
params?: Record<string, any>; // per-slot knobs (e.g., multipliers, respins, symbols, etc.)
};

// Full catalog
export const SLOTS: Record<string, SlotConfig> = {
prime: {
slug: "prime",
title: "Prime Slot",
theme: "classic",
payways: 9,
volatility: "med",
engine: "classicLines",
},
dimensiondoom: {
slug: "dimensiondoom",
title: "Dimension Doom",
theme: "sci-fi",
payways: 243,
volatility: "high",
engine: "ways243",
},
"felenas-cantina": {
slug: "felenas-cantina",
title: "Felena’s Cantina",
theme: "cantina",
payways: 243,
volatility: "med",
engine: "ways243",
},

// Spooky Slots — classic lines + a couple of knobs
"spooky-slots": {
slug: "spooky-slots",
title: "Spooky Slots",
theme: "horror",
payways: 25,
volatility: "med",
engine: "classicLines",
params: { wildChance: 0.08, bonusFreq: 0.02 },
},

"rooster-revenge": {
slug: "rooster-revenge",
title: "Rooster Revenge",
theme: "barnyard",
payways: 20,
volatility: "med",
engine: "holdAndSpin",
params: { respins: 3, triggerCount: 6 },
},
"time-machine-terror": {
slug: "time-machine-terror",
title: "Time Machine Terror",
theme: "time",
payways: 50,
volatility: "high",
engine: "tumbleScatterPays",
params: { cascades: true, multiplier: true },
},

/** 🔥 NEW: Global Meltdown — 5x6 tumble scatter pays (8+), nuclear-themed */
"global-meltdown": {
slug: "global-meltdown",
title: "Global Meltdown",
theme: "nuclear",
payways: 30, // scatter-pays style; lines aren't used but keep a display value
volatility: "high",
engine: "tumbleScatterPays",
params: {
grid: { rows: 6, cols: 5 },
scatterMin: 8, // 8+ anywhere triggers explosion
cascades: true, // tumble / cascade on wins
multiplier: true, // cascade multiplier meter
nuclearWild: true, // one symbol doubles count each spin
reactorSpawnChance: 0.05, // reactors spawn on refills; +1 multiplier when they explode
multiplierPills: [2, 3, 5, 10],
maxMultiplier: 10,
symbolSet: ["biohazard", "radioactive", "gasMask", "explosion", "skull", "diamond"],
},
},

"systems-overload": {
slug: "systems-overload",
title: "Systems Overload",
theme: "cyber",
payways: 4096,
volatility: "high",
engine: "hyperWays",
},
"music-mayhem": {
slug: "music-mayhem",
title: "Music Mayhem",
theme: "music",
payways: 25,
volatility: "med",
engine: "tumbleScatterPays",
},
"penny-lane-paradise": {
slug: "penny-lane-paradise",
title: "Penny Lane Paradise",
theme: "easy",
payways: 20,
volatility: "low",
engine: "classicLines",
},
"kings-of-nala": {
slug: "kings-of-nala",
title: "Kings of Nala",
theme: "savannah",
payways: 10,
volatility: "med",
engine: "jackpotLadder",
},
"barnyard-bonanza": {
slug: "barnyard-bonanza",
title: "Barnyard Bonanza",
theme: "farm",
payways: 25,
volatility: "med",
engine: "holdAndSpin",
},
"starship-stackers": {
slug: "starship-stackers",
title: "Starship Stackers",
theme: "space",
payways: 40,
volatility: "med",
engine: "ways243",
},
"dungeon-delver": {
slug: "dungeon-delver",
title: "Dungeon Delver",
theme: "dungeon",
payways: 20,
volatility: "high",
engine: "tumbleScatterPays",
},
"hacker-heist": {
slug: "hacker-heist",
title: "Hacker Heist",
theme: "hacker",
payways: 20,
volatility: "med",
engine: "classicLines",
},
"super-signal": {
slug: "super-signal",
title: "Super Signal",
theme: "superhero",
payways: 25,
volatility: "med",
engine: "ways243",
},
"neon-city-nights": {
slug: "neon-city-nights",
title: "Neon City Nights",
theme: "neon",
payways: 1024,
volatility: "high",
engine: "hyperWays",
},
"volcano-vault": {
slug: "volcano-vault",
title: "Volcano Vault",
theme: "volcano",
payways: 25,
volatility: "high",
engine: "holdAndSpin",
},
"arctic-aurora": {
slug: "arctic-aurora",
title: "Arctic Aurora",
theme: "arctic",
payways: 40,
volatility: "med",
engine: "classicLines",
},
"jameys-jukebox": {
slug: "jameys-jukebox",
title: "Jamey’s Jukebox",
theme: "jukebox",
payways: 25,
volatility: "med",
engine: "tumbleScatterPays",
},
"feline-fortune": {
slug: "feline-fortune",
title: "Feline Fortune",
theme: "cats",
payways: 243,
volatility: "med",
engine: "ways243",
},
"ocean-odyssey": {
slug: "ocean-odyssey",
title: "Ocean Odyssey",
theme: "ocean",
payways: 4 * 25,
volatility: "med",
engine: "classicLines",
},
"retro-racer": {
slug: "retro-racer",
title: "Retro Racer",
theme: "racer",
payways: 30,
volatility: "med",
engine: "jackpotLadder",
},
"treasure-tunnels": {
slug: "treasure-tunnels",
title: "Treasure Tunnels",
theme: "mines",
payways: 20,
volatility: "med",
engine: "tumbleScatterPays",
},
"vampire-vengeance": {
slug: "vampire-vengeance",
title: "Vampire Vengeance",
theme: "vampire",
payways: 25,
volatility: "high",
engine: "classicLines",
},
"galaxy-hyperways": {
slug: "galaxy-hyperways",
title: "Galaxy HyperWays",
theme: "galaxy",
payways: 15625,
volatility: "high",
engine: "hyperWays",
},
};

// Helpers
export const getSlotBySlug = (slug: string): SlotConfig | undefined => SLOTS[slug];
export const SLOT_LIST: SlotConfig[] = Object.values(SLOTS);