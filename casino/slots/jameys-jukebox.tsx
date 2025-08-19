import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";

import styles from "@/styles/slots/jameys-jukebox.module.css"; // 🎵 custom 80s CSS
import NeonSlot from "@/components/slots/NeonSlot";
import { getSlotBySlug } from "@/lib/casino/registry";
import { buildEngine } from "@/lib/casino/engines/factory";
import { makeRng } from "@/lib/casino/engines/rng";

/** Tiny win‑jingle (page-level); spin/stop SFX are handled by NeonSlot */
function useWinJingle(enabled: boolean) {
const ctxRef = useRef<AudioContext | null>(null);
const ensure = () => {
if (!enabled) return null;
if (ctxRef.current) return ctxRef.current;
const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
const ctx = new AC();
ctxRef.current = ctx;
return ctx;
};
const play = async () => {
const ctx = ensure();
if (!ctx) return;
const g = ctx.createGain();
g.gain.value = 0.07;
g.connect(ctx.destination);
const tone = (f: number, t: number) => {
const o = ctx.createOscillator();
o.type = "sine"; o.frequency.value = f;
o.connect(g); o.start(); o.stop(ctx.currentTime + t);
};
// Little I–III–V arpeggio
tone(523.25, 0.09); // C5
setTimeout(() => tone(659.25, 0.09), 110); // E5
setTimeout(() => tone(783.99, 0.12), 220); // G5
};
return { play };
}

/** Responsive cell size (shared with your other pages) */
function useCellPx() {
const [cell, setCell] = useState(88);
useEffect(() => {
const calc = () => {
const w = window.innerWidth;
const c = Math.round(Math.min(124, Math.max(56, w / 13)));
setCell(c);
};
calc();
window.addEventListener("resize", calc);
return () => window.removeEventListener("resize", calc);
}, []);
return cell;
}

export default function JameysJukeboxPage() {
// Hard-target this slot; physical page ignores [slug].tsx
const cfg = getSlotBySlug("jameys-jukebox");

const [soundOn, setSoundOn] = useState(true);
const cellPx = useCellPx();
const { play: playWin } = useWinJingle(soundOn);

if (!cfg) {
// Safety guard if registry entry is missing
return (
<div className={styles.page}>
<main className={styles.wrap}>
<header className={styles.hero}>
<h1 className={styles.title}>Jamey’s Jukebox</h1>
<p className={styles.sub}>Slot not found in registry.</p>
<div className={styles.ctaRow}>
<Link href="/casino" className={styles.btn}>← Back to Casino</Link>
</div>
</header>
</main>
</div>
);
}

// Theme symbols come from your jukebox theme in the global THEMES map
const symbols = useMemo(() => ["🎵", "🎶", "🎛️", "🎚️", "🎙️", "🎧", "💿"], []);

// Build math engine with per-slot params (if any)
const engine = useMemo(() => {
return buildEngine((cfg as any).engine ?? "classicLines", {
reels: 5,
rows: 3,
...(cfg as any).params,
});
}, [cfg]);

const reels = 5;
const reelSpeedMs = 900; // slightly snappier for jukebox
const reelStaggerMs = 120; // tighter stagger for rhythmic feel

// Called when the visual spin completes
const onSpinResult = () => {
const rng = makeRng();
const outcome = engine.spin({ bet: 1 }, rng);
if (outcome.totalWin > 0) playWin();
if (process.env.NODE_ENV !== "production") {
// eslint-disable-next-line no-console
console.log(cfg.title, outcome);
}
};

return (
<div className={styles.page}>
<Head>
<title>Jamey’s Jukebox — Felena Theory</title>
<meta
name="description"
content={`Jamey’s Jukebox • ${cfg.payways.toLocaleString()} ways • ${cfg.volatility.toUpperCase()} volatility`}
/>
</Head>

<main className={styles.wrap}>
{/* Hero — bigger, custom copy for this slot */}
<header className={styles.hero}>
<h1 className={styles.title}>Jamey’s Jukebox</h1>
<p className={styles.sub}>
JUKEBOX • {cfg.payways.toLocaleString()} ways • {cfg.volatility.toUpperCase()} VOL
</p>
<div className={styles.ctaRow}>
<Link href="/casino" className={styles.btn}>← Casino</Link>
<Link href="/phonebooth" className={`${styles.btn} ${styles.btnGhost}`}>Manage Balance</Link>
<button
className={`${styles.btn} ${styles.btnGhost}`}
onClick={() => setSoundOn(v => !v)}
aria-pressed={soundOn}
title="Toggle sound"
>
Sound: {soundOn ? "On" : "Off"}
</button>
</div>
</header>

{/* Custom cabinet zone (full width + music notes overlay from CSS) */}
<section className={styles.cabinetZone}>
<article className={styles.cabinet}>
<div className="notes" />
<NeonSlot
variant="jukebox" // 🔥 lock Jukebox spin feel + SFX
sfx={soundOn} // user toggle
reels={reels}
rows={3}
symbols={symbols}
reelSpeedMs={reelSpeedMs}
reelStaggerMs={reelStaggerMs}
extraSpins={2}
cellPx={cellPx}
onResult={onSpinResult}
// no onReelStop: NeonSlot handles per-reel ticks internally
/>
</article>

<article className={styles.rules}>
<h3>How to Play</h3>
<p>
Press <strong>Spin</strong> to roll 5 reels. Wins pay left‑to‑right on{" "}
{cfg.payways.toLocaleString()} ways unless a feature states otherwise.
Multipliers & bonus behaviors vary by game.
</p>
<p className="soft">Demo settlement only — XP routes through your Keycard wallet.</p>
</article>
</section>

<footer className={styles.footer}>
<Link href="/casino" className={styles.btn}>← Back to Casino</Link>
</footer>
</main>
</div>
);
}