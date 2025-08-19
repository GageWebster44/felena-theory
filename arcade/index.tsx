// src/pages/arcade/index.tsx
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/**
* ARCADE — Mobile-style action games (Donkey-Kong-ish flow)
*
* • Beat a level → earn XP into a "pot".
* • To advance you must CHOOSE: Cash Out (bank pot to wallet) or Continue (wager the whole pot).
* • Lose a level → you lose the pot and restart at Level 1.
* • Clear the final level → loop the game at higher difficulty & speed (pot keeps growing if you continue).
*
* Wallet uses the same storage as Keycard: localStorage "op_xp" (1 XP = $1).
*/

type Game = {
id: string;
title: string;
emoji: string;
desc: string;
baseReward: number; // XP at Level 1 (before multipliers)
baseWinProb: number; // Win chance at Level 1, Loop 0
};

const MAX_LEVEL = 5;

// 10 starter games across genres
const GAMES: Game[] = [
{ id: "g_runner", title: "Retro Runner", emoji: "🏃‍♂️", desc: "Dash, jump, slide — beat the scrolling city.", baseReward: 6, baseWinProb: 0.78 },
{ id: "g_kong", title: "Neo Kong", emoji: "🦍", desc: "Climb scaffolds, dodge barrels, rescue the signal.", baseReward: 7, baseWinProb: 0.75 },
{ id: "g_starship", title: "Starship Courier", emoji: "🚀", desc: "Warp lanes, asteroid belts, package on time.", baseReward: 7, baseWinProb: 0.76 },
{ id: "g_dungeon", title: "Dungeon Dash", emoji: "🗝️", desc: "Traps, keys, boss doors — sprint the labyrinth.", baseReward: 8, baseWinProb: 0.74 },
{ id: "g_heist", title: "Cyber Heist", emoji: "🧨", desc: "Lasers, cameras, data vault — in & out clean.", baseReward: 6, baseWinProb: 0.77 },
{ id: "g_farm", title: "Farm Frenzy", emoji: "🌽", desc: "Plant, harvest, dodge storms — market rush.", baseReward: 5, baseWinProb: 0.80 },
{ id: "g_crystal", title: "Crystal Logic", emoji: "💎", desc: "Slide tiles, clear cascades, chain the sparkle.", baseReward: 6, baseWinProb: 0.79 },
{ id: "g_ninja", title: "Ninja Climb", emoji: "🥷", desc: "Wall-jumps, shuriken, rooftop pacing.", baseReward: 7, baseWinProb: 0.76 },
{ id: "g_zombie", title: "Zombie Rush", emoji: "🧟", desc: "Barricade, reload, kite the horde to the evac.", baseReward: 7, baseWinProb: 0.75 },
{ id: "g_mech", title: "Mech Arena", emoji: "🤖", desc: "Boost, shield, railgun — survive the gauntlet.", baseReward: 8, baseWinProb: 0.73 },
];

type Phase = "idle" | "decision"; // idle = ready to play level; decision = choose cash out or continue (after a win)

type GameState = {
level: number; // 1..MAX_LEVEL
loop: number; // 0,1,2… (each loop increases difficulty and reward)
pot: number; // XP at risk if you continue
phase: Phase;
status: string;
};

type StateMap = Record<string, GameState>;

const XP_KEY = "op_xp";

export default function ArcadePage() {
// Wallet (shared with Keycard)
const [walletXP, setWalletXP] = useState<number>(0);
useEffect(() => {
if (typeof window === "undefined") return;
setWalletXP(Number(localStorage.getItem(XP_KEY) || 0));
}, []);
useEffect(() => {
if (typeof window === "undefined") return;
localStorage.setItem(XP_KEY, String(walletXP));
}, [walletXP]);

// Per-game state
const initialStates: StateMap = useMemo(
() =>
Object.fromEntries(
GAMES.map((g) => [
g.id,
{ level: 1, loop: 0, pot: 0, phase: "idle" as Phase, status: "Insert coin. Ready for Level 1." },
])
),
[]
);
const [states, setStates] = useState<StateMap>(initialStates);

function resetGame(id: string) {
setStates((s) => ({
...s,
[id]: { level: 1, loop: 0, pot: 0, phase: "idle", status: "Reset. Ready for Level 1." },
}));
}

// Core math
function chanceToWin(g: Game, st: GameState) {
// Each level trims ~10% win chance; each loop trims ~5%
const c = g.baseWinProb - 0.10 * (st.level - 1) - 0.05 * st.loop;
return Math.max(0.05, Math.min(0.95, c));
}
function rewardForWin(g: Game, st: GameState) {
// Reward scales with level and loop in a chunky, arcade-y way
const mult = 1 + 0.25 * (st.level - 1) + 0.40 * st.loop;
return Math.max(1, Math.round(g.baseReward * mult));
}

// Play current level (resolve win/loss)
function playLevel(g: Game) {
setStates((s) => {
const st = s[g.id];
if (!st || st.phase !== "idle") return s;

const winP = chanceToWin(g, st);
const win = Math.random() < winP;
if (win) {
const gain = rewardForWin(g, st);
const nextPot = st.pot + gain;
return {
...s,
[g.id]: {
...st,
pot: nextPot,
phase: "decision",
status: `Cleared Level ${st.level}! +${gain} XP → Pot ${nextPot} XP. Cash Out or Continue?`,
},
};
} else {
// Bust: lose pot and restart at L1 (same loop)
return {
...s,
[g.id]: {
...st,
pot: 0,
level: 1,
phase: "idle",
status: `Missed Level ${st.level}. Pot lost. Back to Level 1.`,
},
};
}
});
}

// Cash out the pot to wallet
function cashOut(g: Game) {
setStates((s) => {
const st = s[g.id];
if (!st || st.phase !== "decision") return s;
const bank = st.pot;
setWalletXP((x) => x + bank);
return {
...s,
[g.id]: {
...st,
pot: 0,
level: 1,
phase: "idle",
status: `Cashed out ${bank} XP to wallet. Ready for Level 1.`,
},
};
});
}

// Continue to next level (wager entire pot)
function continueRun(g: Game) {
setStates((s) => {
const st = s[g.id];
if (!st || st.phase !== "decision") return s;

// Loop handling if we finished MAX_LEVEL
if (st.level >= MAX_LEVEL) {
return {
...s,
[g.id]: {
...st,
level: 1,
loop: st.loop + 1,
phase: "idle",
status: `Loop +1! Difficulty up, rewards up. Pot at risk: ${st.pot} XP — play Level 1.`,
},
};
}

return {
...s,
[g.id]: {
...st,
level: st.level + 1,
phase: "idle",
status: `Advancing to Level ${st.level + 1}. Pot at risk: ${st.pot} XP.`,
},
};
});
}

// Helpers for UI
function meterColor(p: number) {
if (p >= 0.7) return "rgba(0,255,136,.45)";
if (p >= 0.5) return "rgba(255,255,0,.45)";
return "rgba(255,0,64,.55)";
}

return (
<div className={styles.page}>
<Head>
<title>Arcade — Felena Theory</title>
<meta
name="description"
content="Beat levels to earn XP. Cash out or wager the pot to push deeper. Clear the final level to loop at higher speed and difficulty."
/>
</Head>

<main className={styles.wrap}>
{/* Header */}
<section className={styles.hero}>
<h1 className={styles.title}>Arcade</h1>
<p className={styles.sub}>
Win levels to fill your pot. <strong>Cash Out</strong> to bank XP, or{" "}
<strong>Continue</strong> to wager it all on the next level. Clear Level {MAX_LEVEL} to{" "}
loop the game — tougher odds, bigger rewards.
</p>
<div className={styles.ctaRow}>
<span className={styles.tag}>Wallet: <strong>{walletXP.toLocaleString()} XP</strong></span>
<Link href="/phonebooth" className={styles.btn}>Manage in PhoneBooth</Link>
</div>
</section>

{/* Games Grid */}
<section
className={styles.grid}
style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
>
{GAMES.map((g) => {
const st = states[g.id];
const winP = st ? chanceToWin(g, st) : g.baseWinProb;
const expected = st ? rewardForWin(g, st) : g.baseReward;
const color = meterColor(winP);

return (
<article key={g.id} className={styles.card}>
<h3 style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
<span aria-hidden="true" style={{ fontSize: 22 }}>{g.emoji}</span> {g.title}
</h3>
<p style={{ minHeight: 44 }}>{g.desc}</p>

<div className="rows">
<div className="row">
<span className={styles.tag}>Level</span>
<strong>{st.level}/{MAX_LEVEL}</strong>
</div>
<div className="row">
<span className={styles.tag}>Loop</span>
<strong>×{st.loop}</strong>
</div>
<div className="row">
<span className={styles.tag}>Pot (at risk)</span>
<strong>{st.pot} XP</strong>
</div>
<div className="row">
<span className={styles.tag}>Win Chance</span>
<div className="meter" aria-label="Win chance">
<span style={{ width: `${Math.round(winP * 100)}%`, background: color }} />
</div>
<span className="pct">{Math.round(winP * 100)}%</span>
</div>
<div className="row">
<span className={styles.tag}>On Win</span>
<strong>+{expected} XP → Pot</strong>
</div>
</div>

<p className={styles.tag} style={{ marginTop: 8, minHeight: 20 }}>{st.status}</p>

{/* Controls */}
{st.phase === "idle" ? (
<div className={styles.ctaRow}>
<button className={styles.cardCta} onClick={() => playLevel(g)}>
{st.pot === 0 && st.level === 1 ? "Start • Play Level 1" : `Play Level ${st.level}`}
</button>
<button className={styles.cardCta} onClick={() => resetGame(g.id)}>
Reset
</button>
</div>
) : (
<div className={styles.ctaRow}>
<button className={styles.cardCta} onClick={() => cashOut(g)}>
Cash Out (+{st.pot} XP)
</button>
<button className={styles.cardCta} onClick={() => continueRun(g)}>
Continue (Wager {st.pot} XP)
</button>
</div>
)}

<style jsx>{`
.rows { display: grid; gap: 6px; margin-top: 6px; }
.row {
display: grid;
grid-template-columns: 1.3fr 1fr auto;
align-items: center;
gap: 8px;
}
.meter {
height: 8px;
border-radius: 999px;
background: rgba(0,255,136,.10);
border: 1px solid rgba(0,255,136,.25);
box-shadow: inset 0 0 10px rgba(0,255,136,.08);
overflow: hidden;
}
.meter span {
display: block; height: 100%;
background: rgba(0,255,136,.45);
box-shadow: 0 0 10px rgba(0,255,136,.25);
}
.pct { font-weight: 800; min-width: 42px; text-align: right; }
@media (max-width: 520px) {
.row { grid-template-columns: 1fr 1fr; }
.meter { grid-column: 1 / -1; }
.pct { display: none; }
}
`}</style>
</article>
);
})}
</section>

{/* Footer */}
<footer className={styles.footer}>
<span>Win smart. Bank often. Or push your luck and loop for glory.</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/" className={styles.cardCta}>← Home</Link>
<Link href="/terms" className={styles.cardCta}>Terms & Disclosures</Link>
</div>
</footer>
</main>
</div>
);
}