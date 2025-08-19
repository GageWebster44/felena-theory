import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/slots/globalmeltdown.module.css";
import playSound, { preloadSounds } from "@/utils/playSound";

/**
* GlobalMeltdownCRT.fast (cinematic)
* - Flat CSS grid (no row wrappers) -> no single-column bug
* - Screen scales to viewport via --cols/--rows + CSS aspect-ratio
* - Per-cell classes for boosted/reactor states
* - requestAnimationFrame batching, minimal React churn
* - Canvas bursts + CRT overlays for filmic feel
*/

type SymbolDef = { key: string; glyph: string; name: string; baseXP: number; weight: number };

const SYMBOLS: SymbolDef[] = [
  { key: "biohazard",   glyph: "☣️", name: "Biohazard",    baseXP: 5,  weight: 16 },
  { key: "radioactive", glyph: "☢️", name: "Radioactive",  baseXP: 6,  weight: 14 },
  { key: "gasMask",     glyph: "😷", name: "Gas Mask",     baseXP: 7,  weight: 12 },
  { key: "explosion",   glyph: "💥", name: "Explosion",    baseXP: 10, weight: 9  },
  { key: "skull",       glyph: "💀", name: "Skull",        baseXP: 12, weight: 7  },
  { key: "diamond",     glyph: "💎", name: "Reactor Core", baseXP: 15, weight: 5  },
];

const ROWS = 6;
const COLS = 5;
const MIN_MATCH = 8;
const REACTOR_SPAWN_CHANCE = 0.05;

const SFX = {
  spin:    "/sfx/slot_spin.mp3",
  explode: "/sfx/explosion_short.mp3",
  cascade: "/sfx/cascade_tick.mp3",
  settle:  "/sfx/settle_glow.mp3",
  noWin:   "/sfx/no_win_click.mp3",
  wild:    "/sfx/wild_lock.mp3",
  reactor: "/sfx/reactor_boost.mp3",
};

type Cell = { symKey: string; glyph: string; reactor?: boolean } | null;

function weightedPicker<T extends { weight: number }>(arr: T[]) {
  const bag: T[] = [];
  for (const s of arr) for (let i = 0; i < s.weight; i++) bag.push(s);
  return () => bag[Math.floor(Math.random() * bag.length)];
}
const pickSymbol = weightedPicker(SYMBOLS);

function freshGrid(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => {
      const s = pickSymbol();
      return { symKey: s.key, glyph: s.glyph };
    })
  );
}

function countByKey(grid: Cell[][], boosted?: string) {
  const map: Record<string, number> = {};
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const cell = grid[r][c];
    if (!cell || cell.reactor) continue;
    map[cell.symKey] = (map[cell.symKey] ?? 0) + 1;
  }
  if (boosted && map[boosted]) map[boosted] *= 2;
  return map;
}

function winners(map: Record<string, number>) {
  return Object.entries(map)
    .filter(([, n]) => n >= MIN_MATCH)
    .map(([key, count]) => ({ key, count }));
}

function computeXP(win: { key: string; count: number }[], cascadeIndex: number, bonusBoost: number) {
  let xp = 0;
  for (const w of win) {
    const s = SYMBOLS.find((x) => x.key === w.key)!;
    const baseMult = Math.max(1, w.count - (MIN_MATCH - 1));
    xp += s.baseXP * baseMult * w.count;
  }
  const mult = 1 + cascadeIndex + bonusBoost;
  return Math.floor(xp * mult);
}

/** Memoized cell view – only re-renders if glyph prop changes */
const CellView = React.memo(function CellView({
  r, c, glyph, setRef,
}: {
  r: number; c: number; glyph: string;
  setRef: (r: number, c: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      key={`${r}-${c}`}
      ref={(el) => setRef(r, c, el)}
      className={styles.cell}
    >
      <span className={styles.glyph}>{glyph}</span>
    </div>
  );
});

export default function GlobalMeltdownCRTFast({
  mute = false,
  onPayout,
}: {
  mute?: boolean;
  onPayout?: (xp: number) => void;
}) {
  // HUD state only
  const [cascadeCount, setCascadeCount] = useState(0);
  const [lastCascadeXP, setLastCascadeXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [boostedKey, setBoostedKey] = useState<string | undefined>(undefined);

  // Model in refs (no rerenders while animating)
  const gridRef = useRef<Cell[][]>(freshGrid());
  const bonusBoostRef = useRef(0);
  const spinningRef = useRef(false);

  // per-cell DOM refs
  const cellRefs = useRef<HTMLDivElement[][]>(
    Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null as any))
  );
  const setCellRef = (r: number, c: number, el: HTMLDivElement | null) => (cellRefs.current[r][c] = el);

  // Canvas FX (optional)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preload SFX
  useEffect(() => { preloadSounds(Object.values(SFX)); }, []);

  // Helpers
  const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const raf = () => new Promise<void>((res) => requestAnimationFrame(() => res()));

  function play(src: string) {
    if (mute) return;
    playSound(src, { maxConcurrent: 6 });
  }

  // FX: bursts on canvas
  function burstFlash(cells: [number, number][]) {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const { width, height } = cvs.getBoundingClientRect();
    cvs.width = Math.ceil(width);
    cvs.height = Math.ceil(height);

    // compute cell centers
    const host = cvs.parentElement!;
    const gap = 8; // keep in sync with CSS gap
    const cellW = (host.clientWidth - gap * (COLS - 1)) / COLS;
    const cellH = (host.clientHeight - gap * (ROWS - 1)) / ROWS;

    let t = 0;
    const dur = 260;
    function tick() {
      t += 16.7;
      const p = Math.min(1, t / dur);
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      cells.forEach(([r, c]) => {
        const x = c * (cellW + gap) + cellW / 2;
        const y = r * (cellH + gap) + cellH / 2;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 40);
        grd.addColorStop(0, `rgba(0,255,170,${0.55 * (1 - p)})`);
        grd.addColorStop(1, `rgba(0,255,170,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, 40 + 30 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
      });
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Class helpers
  function toggle(r: number, c: number, cls: string, on: boolean) {
    const el = cellRefs.current[r][c];
    if (!el) return;
    if (on) el.classList.add(cls); else el.classList.remove(cls);
  }
  function kickDrop(r: number, c: number) {
    const el = cellRefs.current[r][c];
    if (!el) return;
    el.classList.remove(styles.drop);
    void el.offsetWidth; // restart keyframe
    el.classList.add(styles.drop);
  }
  function applyCellClasses(r: number, c: number) {
    const cell = gridRef.current[r][c];
    const isReactor = !!cell?.reactor;
    const isBoosted = cell && boostedKey && cell.symKey === boostedKey && !cell.reactor;
    toggle(r, c, styles.reactor, !!isReactor);
    toggle(r, c, styles.boosted, !!isBoosted);
  }

  // When glyphs change post-cascade, update DOM and classes
  function setGlyph(r: number, c: number, glyph: string) {
    const el = cellRefs.current[r][c];
    if (!el) return;
    const span = el.firstElementChild as HTMLElement;
    if (span) span.textContent = glyph;
    applyCellClasses(r, c);
  }

  // Refill gravity + new cells
  function gravityAndRefill(): [number, number][] {
    const newDrops: [number, number][] = [];
    for (let c = 0; c < COLS; c++) {
      const stack: Cell[] = [];
      for (let r = ROWS - 1; r >= 0; r--) {
        const cell = gridRef.current[r][c];
        if (cell) stack.push(cell);
      }
      for (let r = ROWS - 1; r >= 0; r--) {
        const next =
          stack.shift() ??
          (Math.random() < REACTOR_SPAWN_CHANCE
            ? { symKey: "reactor", glyph: "🔆", reactor: true }
            : (() => { const s = pickSymbol(); return { symKey: s.key, glyph: s.glyph }; })());
        const prevGlyph = gridRef.current[r][c]?.glyph;
        gridRef.current[r][c] = next;
        if (next && next.glyph !== prevGlyph) {
          setGlyph(r, c, next.glyph);
          newDrops.push([r, c]);
        } else {
          // ensure proper class state if unchanged glyph
          applyCellClasses(r, c);
        }
      }
    }
    return newDrops;
  }

  // Re-apply boosted styling whenever boostedKey changes
  useEffect(() => {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      applyCellClasses(r, c);
    }
  }, [boostedKey]);

  // Resolve cascades
  async function resolveCascades() {
    let total = 0;
    let i = 0;

    while (true) {
      const counts = countByKey(gridRef.current, boostedKey);
      const win = winners(counts);
      if (win.length === 0) {
        if (i === 0) play(SFX.noWin);
        break;
      }

      // mark explosion cells & reactors
      const explodeCoords: [number, number][] = [];
      let reactorsThis = 0;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = gridRef.current[r][c];
        if (!cell) continue;
        if (cell.reactor) { reactorsThis++; explodeCoords.push([r, c]); continue; }
        if (win.some((w) => w.key === cell.symKey)) explodeCoords.push([r, c]);
      }

      // Animate explosions
      explodeCoords.forEach(([r, c]) => toggle(r, c, styles.explode, true));
      burstFlash(explodeCoords);
      play(SFX.explode);
      if (reactorsThis) play(SFX.reactor);
      await raf();
      await wait(600);

      // remove exploded
      for (const [r, c] of explodeCoords) gridRef.current[r][c] = null;

      // XP with multiplier (reactors grant +1 for current & future cascades)
      const appliedMult = 1 + i + bonusBoostRef.current + (reactorsThis ? 1 : 0);
      if (reactorsThis) bonusBoostRef.current += 1;
      const xp = computeXP(win, i, bonusBoostRef.current);
      total += xp;
      setLastCascadeXP(xp);
      setCascadeCount(i + 1);
      setMultiplier(appliedMult);

      // Gravity + refill, kick drop on changed cells
      play(SFX.cascade);
      const drops = gravityAndRefill();
      await raf();
      drops.forEach(([r, c]) => kickDrop(r, c));
      await wait(260);

      // clear explosion classes
      explodeCoords.forEach(([r, c]) => toggle(r, c, styles.explode, false));
      i++;
    }

    if (total > 0) play(SFX.settle);
    setTotalXP((v) => v + total);
    onPayout?.(total);
  }

  async function spin() {
    if (spinningRef.current) return;
    spinningRef.current = true;

    // reset spin state
    setCascadeCount(0);
    setLastCascadeXP(0);
    setMultiplier(1);
    bonusBoostRef.current = 0;

    // choose nuclear wild (double counts for one symbol)
    const pick = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].key;
    setBoostedKey(pick);
    play(SFX.wild);

    // fresh grid
    gridRef.current = freshGrid();

    // update glyphs + classes and play drop for all cells
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const cell = gridRef.current[r][c]!;
      setGlyph(r, c, cell.glyph);
    }
    await raf();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) kickDrop(r, c);
    play(SFX.spin);
    await wait(520);

    await resolveCascades();

    spinningRef.current = false;
  }

  // initial render glyphs (not strictly needed)
  useMemo(() => gridRef.current.map(row => row.map(cell => cell?.glyph ?? "")), []);

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.title}><span>GLOBAL</span> MELTDOWN</div>
        <div className={styles.meta}>5×6 • Scatter Cascades • Nuclear Wild • Reactors • FAST</div>
      </div>

      <div className={styles.cabinet}>
        <div className={styles.frameGlow} />

        {/* Cabinet screen */}
        <div
          className={styles.screen}
          style={
            {
              // let CSS do the math responsively (keeps 5×6)
              ["--cols" as any]: COLS,
              ["--rows" as any]: ROWS,
            }
          }
        >
          <div className={styles.crtOverlay} />
          <canvas ref={canvasRef} className={styles.fxCanvas} />

          {/* Nuclear Wild banner … */}
          {boostedKey && (
            <div className={styles.wildBanner}>
              <span className={styles.wildIcon}>⚛️</span>
              <span className={styles.wildText}>
                NUCLEAR WILD:{" "}
                <strong className={styles.wildName}>
                  {SYMBOLS.find((s) => s.key === boostedKey)?.name}
                </strong>{" "}
                counts <b>x2</b> this spin
              </span>
            </div>
          )}

          {/* FLAT GRID that fills the screen */}
          <div className={styles.grid}>
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const r = Math.floor(i / COLS);
              const c = i % COLS;
              return (
                <CellView
                  key={`${r}-${c}`}
                  r={r}
                  c={c}
                  glyph={gridRef.current[r][c]?.glyph ?? ""}
                  setRef={setCellRef}
                />
              );
            })}
          </div>

          {/* HUD … */}
          <div className={styles.hud}>
            <div className={styles.stat}><label>Cascades</label><div className={styles.statVal}>{cascadeCount}</div></div>
            <div className={styles.stat}><label>Last Cascade</label><div className={styles.statVal}>{lastCascadeXP} XP</div></div>
            <div className={styles.stat}><label>Total</label><div className={styles.statVal}>{totalXP} XP</div></div>

            <div className={styles.multWrap}>
              <div className={styles.multLabel}>MULTIPLIER</div>
              <div className={styles.multBar}>
                <div
                  className={styles.multFill}
                  style={{ width: `${Math.min(100, (multiplier / 10) * 100)}%` }}
                />
                <div className={styles.multText}>x{multiplier}</div>
              </div>
            </div>
          </div>
        </div>

        <button className={styles.spinBtn} onClick={spin}>SPIN</button>
      </div>

      <div className={styles.paytable}>
        <div className={styles.payheader}>PAYTABLE (Scatter 8+)</div>
        {SYMBOLS.map((s) => (
          <div key={s.key} className={styles.payRow}>
            <span className={styles.payGlyph}>{s.glyph}</span>
            <span className={styles.payName}>{s.name}</span>
            <span className={styles.payBase}>Base {s.baseXP} XP</span>
            <span className={styles.payRule}>8+ anywhere</span>
          </div>
        ))}
      </div>
    </div>
  );
}
