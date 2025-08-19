// src/components/slots/RoosterRevenge.tsx
import { useEffect, useRef, useState } from "react";
import { buildEngineForSlot } from "@/lib/casino/engines/factory";
import type { SlotConfig } from "@/lib/casino/registry";
import playSound, { preloadSounds } from "@/utils/playSound";
import css from "@/styles/slots/rooster.module.css";

type BoardCell = { kind: "cash" | "jackpot" | "collector"; value?: number; jp?: "Mini"|"Minor"|"Major"|"Grand" };
type Step = { placements: Array<{ r:number; c:number; cell: BoardCell }>; respinsLeft: number; };
type Feature = { kind: "holdAndSpinPlus"; rows:number; cols:number; board:(BoardCell|null)[][]; steps:Step[]; total:number; jackpots: Record<string,number> };
type SpinResult = { symbols:string[][]; wins:{type:string; amountXP:number}[]; winXP:number; features?:Feature[] };

const SFX = {
  spin: "/sfx/slot_spin.mp3",
  lock: "/sfx/reactor_boost.mp3",
  tick: "/sfx/cascade_tick.mp3",
  end: "/sfx/explosion_short.mp3",
};

export default function RoosterRevenge({ slot, onPayout }: { slot: SlotConfig; onPayout?: (xp:number)=>void }) {
  const engineRef = useRef(buildEngineForSlot(slot));
  const [spinning, setSpinning] = useState(false);
  const [respins, setRespins] = useState(slot.params?.respins ?? 3);
  const [grid, setGrid] = useState<(BoardCell|null)[][]>(() => Array.from({ length: slot.params?.grid?.rows ?? 3 }, () => Array.from({ length: slot.params?.grid?.cols ?? 5 }, () => null)));
  const [total, setTotal] = useState(0);

  useEffect(() => { engineRef.current = buildEngineForSlot(slot); }, [slot]);
  useEffect(() => { preloadSounds(Object.values(SFX)); }, []);

  async function doSpin() {
    if (spinning) return;
    setSpinning(true);
    setTotal(0);
    setRespins(slot.params?.respins ?? 3);
    playSound(SFX.spin, { oneAtATimeKey: "spin" });

    const res = (await engineRef.current.spin({ betXP: 1, seed: Date.now() })) as SpinResult;
    if (!res.features || !res.features[0]) {
      setSpinning(false);
      onPayout?.(0);
      return;
    }
    const f = res.features[0];

    // reset board
    setGrid(Array.from({ length: f.rows }, () => Array.from({ length: f.cols }, () => null)));

    // Animate placements per step
    for (const step of f.steps) {
      for (const p of step.placements) {
        playSound(SFX.lock);
        setGrid((g) => {
          const n = g.map(row => row.slice());
          n[p.r][p.c] = p.cell;
          return n;
        });
        await wait(140);
      }
      setRespins(step.respinsLeft);
      playSound(SFX.tick);
      await wait(140);
    }

    // Count up total at end
    playSound(SFX.end);
    let acc = 0;
    for (let r = 0; r < f.rows; r++) for (let c = 0; c < f.cols; c++) {
      const cell = f.board[r][c];
      if (!cell) continue;
      if (cell.kind === "cash") acc += cell.value || 0;
      if (cell.kind === "jackpot" && cell.jp) {
        const pays = { Mini: 10, Minor: 25, Major: 100, Grand: 500 } as any; // mirror engine defaults
        acc += pays[cell.jp] || 0;
      }
      setTotal(acc);
      await wait(40);
    }

    onPayout?.(acc);
    setSpinning(false);
  }

  return (
    <div className={css.shell}>
      <div className={css.header}>
        <div className={css.title}><span>ROOSTER</span> REVENGE</div>
        <div className={css.meta}>Hold & Spin • Jackpots • Collector</div>
      </div>
      <div className={css.cabinet}>
        <div className={css.frameGlow} />
        <div className={css.screen}>
          <div className={css.crtOverlay} />
          <div className={css.board}>
            {grid.map((row, r) => (
              <div key={r} className={css.row}>
                {row.map((cell, c) => (
                  <div key={`${r}-${c}`} className={`${css.cell} ${cell ? css.filled : ""}`}>
                    {!cell ? null : cell.kind === "cash" ? (
                      <div className={css.cash}><span className={css.val}>{cell.value}</span></div>
                    ) : cell.kind === "collector" ? (
                      <div className={css.collector}>⛓️‍💥</div>
                    ) : (
                      <div className={`${css.jp} ${css["jp"+(cell.jp || "Mini")]}`}>{cell.jp}</div>
                    )}
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
