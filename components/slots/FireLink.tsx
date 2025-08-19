// src/components/slots/FireLink.tsx
import { useEffect, useRef, useState } from "react";
import { buildEngineForSlot } from "@/lib/casino/engines/factory";
import type { SlotConfig } from "@/lib/casino/registry";
import playSound, { preloadSounds } from "@/utils/playSound";
import css from "@/styles/slots/firelink.module.css";

type FeatureStep = {
  placements: Array<{ r: number; c: number; value: number }>;
  unlockedToRow: number | null;
  respinsLeft: number;
};
type FireLinkFeature = {
  kind: "fireLink";
  rows: number;
  cols: number;
  maxRows: number;
  board: (number | null)[][];
  steps: FeatureStep[];
  total: number;
};
type SpinResult = {
  symbols: string[][];
  wins: { type: string; amountXP: number }[];
  winXP: number;
  features?: FireLinkFeature[];
};

const SFX = {
  spin: "/sfx/slot_spin.mp3",
  lock: "/sfx/reactor_boost.mp3",
  tick: "/sfx/cascade_tick.mp3",
  unlock: "/sfx/settle_glow.mp3",
  end: "/sfx/explosion_short.mp3",
};

export default function FireLink({ slot, onPayout }: { slot: SlotConfig; onPayout?: (xp:number)=>void }) {
  const engineRef = useRef(buildEngineForSlot(slot));
  const [spinning, setSpinning] = useState(false);
  const [respins, setRespins] = useState(3);
  const [activeRows, setActiveRows] = useState(slot.params?.grid?.rows ?? 4);
  const [grid, setGrid] = useState<(number | null)[][]>(() =>
    Array.from({ length: (slot.params?.maxRows ?? 8) as number }, () => Array.from({ length: (slot.params?.grid?.cols ?? 5) as number }, () => null))
  );
  const [total, setTotal] = useState(0);

  useEffect(() => { engineRef.current = buildEngineForSlot(slot); }, [slot]);
  useEffect(() => { preloadSounds(Object.values(SFX)); }, []);

  async function doSpin() {
    if (spinning) return;
    setSpinning(true);
    setTotal(0);
    setRespins(slot.params?.respins ?? 3);
    setActiveRows(slot.params?.grid?.rows ?? 4);
    playSound(SFX.spin, { oneAtATimeKey: "spin" });

    const res = (await engineRef.current.spin({ betXP: 1, seed: Date.now() })) as SpinResult;

    // If no feature triggered, just finish
    if (!res.features || !res.features[0]) {
      setSpinning(false);
      onPayout?.(res.winXP || 0);
      return;
    }

    const feature = res.features[0];
    // reset board to empty
    setGrid(Array.from({ length: feature.maxRows }, () => Array.from({ length: feature.cols }, () => null)));

    // Animate steps
    let acc = 0;
    for (const step of feature.steps) {
      // Unlock rows if needed
      if (typeof step.unlockedToRow === "number") {
        setActiveRows(step.unlockedToRow + 1);
        playSound(SFX.unlock);
        await wait(220);
      }
      // Place new orbs
      for (const p of step.placements) {
        playSound(SFX.lock);
        setGrid((g) => {
          const n = g.map((row) => row.slice());
          n[p.r][p.c] = p.value;
          return n;
        });
        acc += 0; // don't count until end; or do a mini-count if desired
        await wait(160);
      }
      // Respins left
      setRespins(step.respinsLeft);
      playSound(SFX.tick);
      await wait(160);
    }

    // End of feature: count up
    let sum = 0;
    setTotal(0);
    playSound(SFX.end);
    await wait(200);
    for (let r = 0; r < feature.maxRows; r++) {
      for (let c = 0; c < feature.cols; c++) {
        const v = feature.board[r][c];
        if (v) {
          sum += v;
          setTotal(sum);
          await wait(40);
        }
      }
    }

    onPayout?.(sum);
    setSpinning(false);
  }

  return (
    <div className={css.shell}>
      <div className={css.header}>
        <div className={css.title}><span>FIRE</span> LINK</div>
        <div className={css.meta}>Hold & Spin • Row Unlock • Respin</div>
      </div>

      <div className={css.cabinet}>
        <div className={css.frameGlow} />
        <div className={css.screen}>
          <div className={css.crtOverlay} />
          <div className={css.board} style={{ gridTemplateRows: `repeat(${grid.length}, var(--cell))` }}>
            {grid.map((row, r) => (
              <div key={r} className={`${css.row} ${r < activeRows ? css.active : css.locked}`}>
                {row.map((cell, c) => (
                  <div key={`${r}-${c}`} className={`${css.cell} ${cell != null ? css.lockedOrb : ""}`}>
                    {cell != null && <div className={css.orb}><span className={css.credits}>{cell}</span></div>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={css.hud}>
            <div className={css.stat}><label>RESPINS</label><div className={css.statVal}>{respins}</div></div>
            <div className={css.stat}><label>TOTAL</label><div className={css.statVal}>{total} XP</div></div>
            <div className={css.controls}>
              <button className={css.spinBtn} onClick={doSpin} disabled={spinning}>
                {spinning ? "PLAYING…" : "PLAY"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}
