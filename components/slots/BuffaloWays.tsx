// src/components/slots/BuffaloWays.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { buildEngineForSlot } from "@/lib/casino/engines/factory";
import type { SlotConfig } from "@/lib/casino/registry";
import playSound, { preloadSounds } from "@/utils/playSound";
import css from "@/styles/slots/buffalo.module.css";

type SpinResult = {
symbols: string[][];
wins: { type: "ways"; symbol: string; count: number; amountXP: number; meta?: any }[];
winXP: number;
state?: any;
};

const SFX = {
spin: "/sfx/slot_spin.mp3",
stop: "/sfx/reel_stop.mp3",
anticipate: "/sfx/anticipation.mp3",
winTick: "/sfx/win_tick.mp3",
bigWin: "/sfx/big_win.mp3",
};

export default function BuffaloWays({ slot, onPayout }: { slot: SlotConfig; onPayout?: (xp: number)=>void }) {
const [spinning, setSpinning] = useState(false);
const [winXP, setWinXP] = useState(0);
const [grid, setGrid] = useState<string[][]>(() => Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => "J")));
const engineRef = useRef(buildEngineForSlot(slot));
const [stopMask, setStopMask] = useState<boolean[]>([false,false,false,false,false]); // reel stop flags

useEffect(() => { engineRef.current = buildEngineForSlot(slot); }, [slot]);
useEffect(() => { preloadSounds(Object.values(SFX)); }, []);

const rows = (slot.params?.grid?.rows ?? 4) as number;
const reels = (slot.params?.grid?.cols ?? 5) as number;

async function doSpin() {
if (spinning) return;
setSpinning(true);
setStopMask([false,false,false,false,false]);
setWinXP(0);
playSound(SFX.spin, { oneAtATimeKey: "spin" });

// anticipation cue if 2 scatters appear on first 2 reels during fake spin – for now: timed
setTimeout(() => playSound(SFX.anticipate, { oneAtATimeKey: "ant" }), 700);

const result = (await engineRef.current.spin({ betXP: 1, seed: Date.now() })) as SpinResult;

// reveal reels sequentially for stop effect
for (let c = 0; c < reels; c++) {
await new Promise(res => setTimeout(res, 180));
playSound(SFX.stop);
setStopMask((m) => m.map((v,i)=> i===c ? true : v));
}

// set final grid (instantly after stops for visual bump)
setGrid(result.symbols);

// animate wins: simple ticker + highlight by symbol
if (result.wins?.length) {
let acc = 0;
for (const w of result.wins) {
acc += w.amountXP;
setWinXP(acc);
playSound(SFX.winTick);
await new Promise(res => setTimeout(res, 150));
}
if (acc >= 20) playSound(SFX.bigWin);
onPayout?.(acc);
} else {
onPayout?.(0);
}

// small delay before enabling next spin
await new Promise(res => setTimeout(res, 200));
setSpinning(false);
}

const strip = useMemo(() => Array.from({ length: rows }, (_, r) => r), [rows]); // just len helper

return (
<div className={css.shell}>
<div className={css.header}>
<div className={css.title}><span>BUFFALO</span> LEGACY</div>
<div className={css.meta}>4×5 Ways • Wild ×2/×3 • Anticipation</div>
</div>
<div className={css.cabinet}>
<div className={css.frameGlow} />
<div className={css.screen}>
<div className={css.crtOverlay} />
<div className={css.reels}>
{Array.from({ length: reels }).map((_, c) => (
<div key={c} className={`${css.reel} ${spinning && !stopMask[c] ? css.spin : css.stop}`}>
<div className={css.band}>
{/* during spin show a generic cycling band */}
{!stopMask[c] ? (
strip.concat(strip).map((_, i) => (
<div key={i} className={`${css.tile} ${css["sym-A"]}`} />
))
) : (
// stopped: render final symbols for that reel
grid.map((row, r) => (
<div key={r} className={`${css.tile} ${css["sym-"+(grid[r][c] || "J")]}`} />
))
)}
</div>
</div>
))}
</div>

<div className={css.hud}>
<div className={css.stat}><label>WIN</label><div className={css.statVal}>{winXP} XP</div></div>
<div className={css.stat}><label>WAYS</label><div className={css.statVal}>1024</div></div>
<div className={css.controls}>
<button className={css.spinBtn} onClick={doSpin} disabled={spinning}>
{spinning ? "SPINNING…" : "SPIN"}
</button>
</div>
</div>
</div>
</div>
</div>
);
}