// src/components/slots/StarshipStackers.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { buildEngineForSlot } from "@/lib/casino/engines/factory";
import type { SlotConfig } from "@/lib/casino/registry";
import playSound, { preloadSounds } from "@/utils/playSound";
import css from "@/styles/slots/starship.module.css";

type SpinResult = {
  symbols: string[][];
  wins: { type:"ways"; symbol:string; count:number; amountXP:number; meta?:{ways:number} }[];
  winXP: number;
  features?: Array<{ type:"freeSpins"; spins:number }>;
  state?: { expandedCols:number[]; scatters:number };
};

const SFX = {
  spin: "/sfx/slot_spin.mp3",
  stop: "/sfx/reel_stop.mp3",
  expand: "/sfx/wild_lock.mp3",
  win: "/sfx/win_tick.mp3",
  big: "/sfx/settle_glow.mp3",
  fs: "/sfx/explosion_short.mp3",
};

export default function StarshipStackers({ slot, onPayout }: { slot: SlotConfig; onPayout?: (xp:number)=>void }) {
  const engineRef = useRef(buildEngineForSlot(slot));
  const [spinning, setSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: slot.params?.grid?.rows ?? 3 }, () => Array.from({ length: slot.params?.grid?.cols ?? 5 }, () => "J"))
  );
  const [winXP, setWinXP] = useState(0);
  const [msg, setMsg] = useState<string>("");
  const [stopMask, setStopMask] = useState<boolean[]>([false,false,false,false,false]);
  const [expandedCols, setExpandedCols] = useState<number[]>([]);

  useEffect(()=>{ engineRef.current = buildEngineForSlot(slot); }, [slot]);
  useEffect(()=>{ preloadSounds(Object.values(SFX)); }, []);

  const rows = (slot.params?.grid?.rows ?? 3) as number;
  const reels = (slot.params?.grid?.cols ?? 5) as number;
  const strip = useMemo(()=> Array.from({ length: rows }, (_,i)=>i), [rows]);

  async function doSpin(freeMode = false) {
    if (spinning) return;
    setSpinning(true);
    setWinXP(0);
    setMsg(freeMode ? "FREE SPIN" : "");
    setStopMask([false,false,false,false,false]);
    setExpandedCols([]);
    playSound(SFX.spin, { oneAtATimeKey: "spin" });

    const res = (await engineRef.current.spin({ betXP: 1, seed: Date.now(), params: { freeMode } })) as SpinResult;

    // Reveal reels with stop sound, and animate expansion if needed
    for (let c = 0; c < reels; c++) {
      await wait(180);
      playSound(SFX.stop);
      setStopMask(m => m.map((v,i)=> i===c ? true : v));
    }

    setGrid(res.symbols);
    setExpandedCols(res.state?.expandedCols || []);

    if (res.state?.expandedCols?.length) {
      playSound(SFX.expand);
      await wait(220);
    }

    // win tick up
    let acc = 0;
    for (const w of res.wins) {
      acc += w.amountXP;
      setWinXP(acc);
      playSound(SFX.win);
      await wait(140);
    }
    if (acc >= 20) playSound(SFX.big);

    // Free spins flow
    const fs = res.features?.find(f => f.type === "freeSpins");
    if (!freeMode && fs?.spins) {
      playSound(SFX.fs);
      setMsg(`FREE SPINS ×${fs.spins}`);
      await wait(600);

      let totalFS = 0;
      for (let i = 0; i < fs.spins; i++) {
        setMsg(`FREE SPIN ${i+1}/${fs.spins}`);
        const r2 = (await engineRef.current.spin({ betXP: 1, seed: Date.now(), params: { freeMode: true } })) as SpinResult;
        // Quick auto reveal for FS: no slow stops to keep pace
        setGrid(r2.symbols);
        setExpandedCols(r2.state?.expandedCols || []);
        let inc = 0;
        for (const w of r2.wins) inc += w.amountXP;
        totalFS += inc;
        setWinXP(acc + totalFS);
        await wait(260);
      }
      acc += totalFS;
    }

    onPayout?.(acc);
    setSpinning(false);
    setMsg("");
  }

  return (
    <div className={css.shell}>
      <div className={css.header}>
        <div className={css.title}><span>STARSHIP</span> STACKERS</div>
        <div className={css.meta}>243 Ways • Stacked Wild Reels • Free Spins</div>
      </div>

      <div className={css.cabinet}>
        <div className={css.frameGlow}/>
        <div className={css.screen}>
          <div className={css.crtOverlay}/>

          {/* Message banner */}
          {msg && <div className={css.banner}>{msg}</div>}

          {/* Reels */}
          <div className={css.reels}>
            {Array.from({ length: reels }).map((_, c) => (
              <div key={c} className={`${css.reel} ${spinning && !stopMask[c] ? css.spin : css.stop} ${expandedCols.includes(c) ? css.expanded : ""}`}>
                <div className={css.band}>
                  {!stopMask[c] ? (
                    strip.concat(strip).map((_, i) => (
                      <div key={i} className={`${css.tile} ${css["sym-A"]}`} />
                    ))
                  ) : (
                    grid.map((row, r) => (
                      <div key={r} className={`${css.tile} ${css["sym-"+(grid[r][c] || "J")]}`} />
                    ))
                  )}
                </div>
                {/* expanded wild overlay */}
                {expandedCols.includes(c) && <div className={css.wildReelOverlay}><div className={css.wildLabel}>WILD</div></div>}
              </div>
            ))}
          </div>

          {/* HUD */}
          <div className={css.hud}>
            <div className={css.stat}><label>WIN</label><div className={css.statVal}>{winXP} XP</div></div>
            <div className={css.controls}>
              <button className={css.spinBtn} onClick={()=>doSpin(false)} disabled={spinning}>
                {spinning ? "SPINNING…" : "SPIN"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function wait(ms:number){ return new Promise<void>(res=>setTimeout(res,ms)); }
