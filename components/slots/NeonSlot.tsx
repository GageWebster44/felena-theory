import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ui from "@/styles/index.module.css"; // only used for the Spin button row styling

/**
* NeonSlot
* -----------
* Theme-aware visual spinner with optional internal SFX.
* - CSS translateY with easing + per-reel stagger
* - Deterministic PRNG (optional seed) for predictable demo spins
* - Responsive sizing via CSS vars: --reels, --cell
* - Per-theme animations + overlays + SFX (auto or explicit via `variant`)
* - NEW: For variant="jukebox", reads CSS vars --sfx-spin / --sfx-stop (and optional --sfx-win) to play MP3s.
*/

export type SpinResult = string[][]; // [reel][row]

export type NeonSlotProps = {
reels?: number; // columns (default 5)
rows?: number; // visible rows (default 3)
symbols: string[]; // symbol set (emoji/text/SVG strings)
reelSpeedMs?: number; // base spin duration per reel
reelStaggerMs?: number; // extra per-reel delay
extraSpins?: number; // how many full loops before stopping
seed?: number; // optional PRNG seed
disabled?: boolean;

/** Optional theme key to influence animation + SFX ("jukebox", "horror", …). */
variant?: string;

/** Size each cell; machine scales from this. Default 72px. */
cellPx?: number;

/** Fired once when all reels land (visual result only). */
onResult?: (result: SpinResult) => void;

/** Fired when each reel finishes landing (0-based). */
onReelStop?: (reelIndex: number) => void;

/** If true, play internal sounds (default true). Automatically muted if `onReelStop` provided to avoid duplicates. */
sfx?: boolean;
};

export default function NeonSlot({
reels = 5,
rows = 3,
symbols,
reelSpeedMs = 1100,
reelStaggerMs = 160,
extraSpins = 2,
seed,
disabled,
variant,
cellPx = 72,
onResult,
onReelStop,
sfx = true,
}: NeonSlotProps) {
// Build long reels to scroll through
const STRIP_LEN = Math.max(60, symbols.length * 6);
const strips = useMemo(
() => new Array(reels).fill(0).map(() => buildStrip(symbols, STRIP_LEN)),
[reels, symbols]
);

// Pick a variant if none provided (guess from emojis)
const guessedVariant = useMemo(() => variant ?? guessVariantFromSymbols(symbols), [variant, symbols]);
const containerClass = `neonSlot variant-${normalizeVariant(guessedVariant)}`;

const [spinning, setSpinning] = useState(false);
const [offsets, setOffsets] = useState<number[]>(() => new Array(reels).fill(0));
const [result, setResult] = useState<SpinResult>(() =>
new Array(reels).fill(0).map(() => new Array(rows).fill(""))
);
const timers = useRef<number[]>([]);

// compute CSS height values from the requested cell size
const cellH = cellPx; // px
const reelH = rows * cellH; // px

// Internal SFX kit (auto-variant, jukebox reads CSS vars)
const sfxKit = useSlotSfx(guessedVariant, sfx && !onReelStop); // mute internal per-reel ticks if parent handles them

// Spin -> choose stops, animate offsets, then finalize and report
const spin = useCallback(() => {
if (spinning || disabled) return;
setSpinning(true);

// seedable PRNG (xorshift32)
let s =
typeof seed === "number"
? seed >>> 0
: ((Date.now() >>> 0) ^ 0x9e3779b9) >>> 0;
const rand = () => {
s ^= s << 13;
s ^= s >>> 17;
s ^= s << 5;
return ((s >>> 0) % 10000) / 10000;
};

const newStops: number[] = [];
const newResults: SpinResult = [];

for (let r = 0; r < reels; r++) {
const stopIndex = Math.floor(rand() * (STRIP_LEN - rows));
newStops.push(stopIndex);

const windowSymbols: string[] = [];
for (let row = 0; row < rows; row++) {
windowSymbols.push(strips[r][(stopIndex + row) % STRIP_LEN]);
}
newResults.push(windowSymbols);
}

// fire spin-start SFX
sfxKit.start?.();

// animate: translateY to large negative plus our stop offset
const baseLoops = extraSpins * STRIP_LEN * cellH;
const newOffsets = new Array(reels).fill(0);

for (let r = 0; r < reels; r++) {
const target = baseLoops + newStops[r] * cellH;
newOffsets[r] = target;

const duration = reelSpeedMs + r * reelStaggerMs;
const t = window.setTimeout(() => {
// finalize: reset transform by modulo, so future spins start near 0 offset
setOffsets((prev) => {
const copy = [...prev];
copy[r] = target % (STRIP_LEN * cellH);
return copy;
});

// per-reel landing SFX
sfxKit.stop?.(r);

// external callback (if any)
onReelStop?.(r);

// on last reel finishing, end spin + deliver result
if (r === reels - 1) {
window.setTimeout(() => {
setSpinning(false);
setResult(newResults);
onResult?.(newResults);
}, 40);
}
}, duration + 40);

timers.current.push(t as unknown as number);
}

// set all offsets at once so CSS transitions are applied
setOffsets(newOffsets);
}, [
STRIP_LEN,
cellH,
reels,
rows,
strips,
spinning,
disabled,
extraSpins,
reelSpeedMs,
reelStaggerMs,
seed,
onResult,
onReelStop,
sfxKit,
]);

useEffect(() => () => timers.current.forEach(clearTimeout), []);

// expose CSS custom property for sizing
const reelsStyle: React.CSSProperties = {
height: reelH,
// @ts-expect-error CSS var
"--cell": `${cellPx}px`,
// @ts-expect-error CSS var
"--reels": reels,
};

return (
<div className={containerClass} data-variant={normalizeVariant(guessedVariant)}>
<div className="reels" style={reelsStyle}>
{new Array(reels).fill(0).map((_, r) => (
<div key={r} className="reel" style={{ height: reelH }}>
<div
className={`strip ${spinning ? "spinning" : ""}`}
style={{
transform: `translateY(-${offsets[r]}px)`,
transitionDuration: spinning
? `${reelSpeedMs + r * reelStaggerMs}ms`
: "0ms",
}}
>
{strips[r].map((sym, i) => (
<div key={i} className="cell">
{renderSymbol(sym)}
</div>
))}
</div>
{/* masks for top/bottom fade */}
<div className="mask top" />
<div className="mask bot" />
</div>
))}
</div>

<div className={ui.ctaRow} style={{ marginTop: 10 }}>
<button
className={ui.btn}
onClick={spin}
disabled={spinning || disabled}
aria-busy={spinning}
>
{spinning ? "Spinning…" : "Spin"}
</button>
</div>

{/* Debug readout (remove in prod) */}
<p className={ui.tag} style={{ marginTop: 6 }}>
Result: {result.map((col) => `[${col.join(" ")}]`).join(" ")}
</p>

{/* Theme-driven visuals & motion (baseline; slot-level CSS modules can override) */}
<style jsx>{`
.neonSlot {
border: 1px solid rgba(0, 255, 136, 0.28);
border-radius: 14px;
padding: 12px;
background: linear-gradient(180deg, rgba(0,20,8,.35), rgba(0,0,0,.6));
box-shadow: inset 0 0 22px rgba(0,255,136,.09);
position: relative;
}

.reels {
display: grid;
grid-template-columns: repeat(var(--reels, ${reels}), var(--cell));
gap: 10px;
overflow: hidden;
padding: 10px;
border-radius: 12px;
background: radial-gradient(120px 60px at 50% 50%, rgba(0,255,136,.06), rgba(0,0,0,0));
}

.reel {
position: relative;
overflow: hidden;
border: 1px solid rgba(0, 255, 136, 0.25);
border-radius: 10px;
box-shadow: inset 0 0 10px rgba(0, 255, 136, 0.08);
background: rgba(0,0,0,.35);
width: var(--cell);
}

.strip {
will-change: transform, filter;
transition-property: transform, filter;
transition-timing-function: cubic-bezier(0.08, 0.65, 0.08, 1);
}

.cell {
width: var(--cell);
height: var(--cell);
display: flex;
align-items: center;
justify-content: center;
font-size: calc(var(--cell) * 0.46);
font-weight: 900;
color: #eaffe9;
text-shadow: 0 0 10px rgba(0,255,136,.25);
border-bottom: 1px dashed rgba(0,255,136,.08);
box-sizing: border-box;
user-select: none;
}

.mask {
position: absolute;
left: 0; right: 0;
height: 18px;
pointer-events: none;
}
.mask.top { top: 0; background: linear-gradient(180deg, rgba(0,0,0,.78), rgba(0,0,0,0)); }
.mask.bot { bottom: 0; background: linear-gradient(0deg, rgba(0,0,0,.78), rgba(0,0,0,0)); }

/* Variant baseline hooks (slot modules can add more) */
.variant-jukebox .strip.spinning { filter: brightness(1.05) saturate(1.08); }
.variant-space .strip.spinning,
.variant-galaxy .strip.spinning { filter: blur(0.6px) brightness(1.05); }
.variant-volcano .strip.spinning { animation: vShake 420ms ease-in-out infinite; }
@keyframes vShake {
0%,100% { transform: translateY(var(--ty, 0)); }
25% { transform: translateY(calc(var(--ty, 0) + 0.8px)); }
75% { transform: translateY(calc(var(--ty, 0) - 0.8px)); }
}
`}</style>
</div>
);
}

/* ---------------- Helpers ---------------- */

function buildStrip(symbols: string[], len: number): string[] {
const out: string[] = [];
for (let i = 0; i < len; i++) out.push(symbols[i % symbols.length]);
return out;
}

function renderSymbol(sym: string) {
return <span className="symbol">{sym}</span>;
}

/** Normalize to a safe CSS suffix */
function normalizeVariant(v?: string) {
return (v || "default").toLowerCase().replace(/\s+/g, "-");
}

/** Quick heuristic to pick a variant from emojis if none provided */
function guessVariantFromSymbols(symbols: string[]): string {
const s = new Set(symbols);
const has = (arr: string[]) => arr.some((x) => s.has(x));

if (has(["🎵", "🎶", "🎧", "💿"])) return "jukebox";
if (has(["🕯️", "🎃", "☠️", "🪦"])) return "horror";
if (has(["🚀", "🛰️", "🪐", "🌌", "💫"])) return "space";
if (has(["🌋", "🔥", "💰"])) return "volcano";
if (has(["🐧", "❄️", "🧊"])) return "arctic";
if (has(["🐚", "🐠", "🌊", "⚓"])) return "ocean";
if (has(["🦁", "🦓", "🦒", "🐘"])) return "savannah";
if (has(["🌮", "🎺", "🌶️"])) return "cantina";
if (has(["🧪", "🔧", "🧬"])) return "cyber";
if (has(["🖥️", "🧩", "🧠"])) return "hacker";
if (has(["🗝️", "🛡️", "🗡️"])) return "dungeon";
if (has(["⛏️", "🪨", "💎"])) return "mines";
if (has(["🎭", "⚡"])) return "superhero";
if (has(["🐔", "🌽", "🚜"])) return "farm";
if (has(["🐱", "🐈‍⬛", "🧶"])) return "cats";
if (has(["🏁", "🛞", "⛽"])) return "racer";
if (has(["⏳", "🕰️"])) return "time";
if (has(["⭐", "7️⃣", "🍒"])) return "classic";
if (has(["🌌", "⭐", "✨"])) return "galaxy";
if (has(["🍀", "🍭", "🍬"])) return "easy";
return "neon";
}

/** Tiny WebAudio kit with per-variant tones + CSS-var audio for jukebox */
function useSlotSfx(variant: string, enabled: boolean) {
const ctxRef = useRef<AudioContext | null>(null);
const spinAudioRef = useRef<HTMLAudioElement | null>(null);
const stopAudioRef = useRef<HTMLAudioElement | null>(null);

// Read a CSS variable from :root and strip quotes
const readCssVar = (name: string) => {
const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
return v.replace(/^"|^'|"$|'$/g, "");
};

// Prepare WebAudio (oscillator fallback)
const ensureCtx = async () => {
if (!enabled) return null;
if (ctxRef.current) return ctxRef.current;
const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
try {
const ctx = new AC();
ctxRef.current = ctx;
return ctx;
} catch {
return null;
}
};

const tone = async (type: OscillatorType, freq = 440, ms = 90, gain = 0.05) => {
const ctx = await ensureCtx();
if (!ctx) return;
const osc = ctx.createOscillator();
const g = ctx.createGain();
osc.type = type;
osc.frequency.value = freq;
g.gain.value = gain;
osc.connect(g).connect(ctx.destination);
osc.start();
osc.stop(ctx.currentTime + ms / 1000);
};

// Preload CSS-var audio for jukebox
useEffect(() => {
if (!enabled) return;
if (normalizeVariant(variant) !== "jukebox") return;

const spinUrl = readCssVar("--sfx-spin");
const stopUrl = readCssVar("--sfx-stop");
spinAudioRef.current = spinUrl ? new Audio(spinUrl) : null;
stopAudioRef.current = stopUrl ? new Audio(stopUrl) : null;

// lower volume a bit (user-toggle lives upstream)
if (spinAudioRef.current) spinAudioRef.current.volume = 0.6;
if (stopAudioRef.current) stopAudioRef.current.volume = 0.6;

return () => {
if (spinAudioRef.current) { spinAudioRef.current.pause(); spinAudioRef.current.src = ""; }
if (stopAudioRef.current) { stopAudioRef.current.pause(); stopAudioRef.current.src = ""; }
spinAudioRef.current = null;
stopAudioRef.current = null;
};
}, [variant, enabled]);

const start = () => {
if (!enabled) return;
const v = normalizeVariant(variant);
if (v === "jukebox" && spinAudioRef.current) {
// restart from beginning for each spin
spinAudioRef.current.currentTime = 0;
void spinAudioRef.current.play().catch(() => {
// fallback if autoplay blocked
tone("triangle", 220, 60, 0.05);
setTimeout(() => tone("triangle", 330, 60, 0.05), 60);
setTimeout(() => tone("triangle", 440, 60, 0.05), 120);
});
return;
}
// non-jukebox fallback tones
switch (v) {
case "space":
case "galaxy":
tone("sine", 180, 140, 0.05); break;
case "volcano":
tone("sawtooth", 110, 120, 0.06); break;
case "hacker":
case "cyber":
tone("square", 440, 80, 0.05); break;
default:
tone("square", 360, 80, 0.05);
}
};

const stop = (i: number) => {
if (!enabled) return;
const v = normalizeVariant(variant);
if (v === "jukebox" && stopAudioRef.current) {
// play a short stop tick; cloneNode so multiple reels can overlap
const a = stopAudioRef.current.cloneNode(true) as HTMLAudioElement;
a.volume = 0.6;
a.currentTime = 0;
void a.play().catch(() => {
tone("triangle", 360 + i * 40, 55, 0.05);
});
return;
}
// non-jukebox fallback per-reel tones
const base = 360;
switch (v) {
case "space":
case "galaxy":
tone("sine", base - i * 20, 70, 0.04); break;
case "volcano":
tone("sawtooth", base + i * 60, 60, 0.06); break;
case "hacker":
case "cyber":
tone("square", base + i * 30, 55, 0.05); break;
case "ocean":
case "arctic":
tone("sine", base + i * 25, 60, 0.04); break;
default:
tone("square", base + i * 30, 55, 0.05);
}
};

return { start, stop };
}