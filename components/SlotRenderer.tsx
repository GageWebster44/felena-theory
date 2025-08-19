// src/components/SlotRenderer.tsx
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildEngineForSlot } from "@/lib/casino/engines/factory";
import { getSlotBySlug, type SlotConfig } from "@/lib/casino/registry";
import styles from "@/styles/slots/slots.module.css";

// Lazy import Global Meltdown renderer if present in your repo.
// If the file doesn't exist, the dynamic import will fail quietly
// and we'll fall back to the generic grid renderer.
const GlobalMeltdownCRTFast = dynamic(
  () => import("@/components/GlobalMeltdownCRT"),
  { ssr: false, loading: () => null }
);

type SpinResult = { symbols: number[][] | string[][]; winXP: number };

export default function SlotRenderer({
  slug,
  defaultBet = 1,
}: {
  slug: string;
  defaultBet?: number;
}) {
  const slot = getSlotBySlug(slug) as SlotConfig | undefined;

  // ─────────────────────────────────────────────────────────────
  // Special case: Global Meltdown cinematic renderer (if available)
  // ─────────────────────────────────────────────────────────────
  if (slot?.slug === "global-meltdown") {
    return (
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{slot.title}</h3>
        <p className={styles.tag}>
          5×6 • Scatter Cascades • Nuclear Wild • Reactors • CRT FAST
        </p>
        <GlobalMeltdownCRTFast
          onPayout={(xp: number) => {
            // hook your orchestrator here, e.g.:
            // xpEngineOrchestrator.award('global_meltdown', xp)
          }}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Unknown slot
  // ─────────────────────────────────────────────────────────────
  if (!slot) {
    return <div className={styles.card}>Unknown slot: {slug}</div>;
  }

  // ─────────────────────────────────────────────────────────────
  // Generic factory‑powered renderer for all other slots
  // ─────────────────────────────────────────────────────────────
  const [bet, setBet] = useState<number>(defaultBet);
  const [seed, setSeed] = useState<number | null>(null);
  const [last, setLast] = useState<SpinResult | null>(null);
  const [xp, setXp] = useState<number>(500); // demo bankroll

  const engineRef = useRef(buildEngineForSlot(slot));
  useEffect(() => {
    engineRef.current = buildEngineForSlot(slot);
  }, [slot]);

  useEffect(() => setSeed(Date.now()), []);

  async function doSpin() {
    if (seed == null) return;
    if (bet > xp) return alert("Insufficient XP.");
    const res = (await engineRef.current.spin({
      betXP: bet,
      seed: seed + xp, // nudge seed so each spin is unique
    })) as SpinResult;

    setXp((v) => v - bet + (res.winXP ?? 0));
    setLast(res);
  }

  // Grid sizing from slot params (works for ways/tumble/lines)
  const rows = (slot.params?.grid?.rows ?? slot.params?.rows ?? 3) as number;
  const reels = (slot.params?.grid?.cols ?? slot.params?.reels ?? 5) as number;

  const grid = useMemo(
    () =>
      (last?.symbols as any) ??
      Array.from({ length: rows }, () =>
        Array.from({ length: reels }, () => "?")
      ),
    [last, rows, reels]
  );

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{slot.title}</h3>
      <p className={styles.tag}>
        {rows}×{reels} • {slot.payways ?? "—"} ways
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${rows}, 48px)`,
          gap: 8,
          margin: "10px 0",
        }}
      >
        {grid.map((row, r) => (
          <div
            key={r}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${reels}, 1fr)`,
              gap: 8,
            }}
          >
            {row.map((sym: any, c: number) => (
              <div
                key={c}
                className={styles.cell}
              >
                {String(sym)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <label className={styles.tag}>Bet</label>
        <input
          type="number"
          value={bet}
          min={1}
          onChange={(e) => setBet(Math.max(1, Number(e.target.value) || 1))}
          className={styles.numberInput}
        />
        <button className={styles.cardCta} onClick={doSpin}>
          Spin
        </button>
        <span className={styles.tag}>Bankroll: {xp} XP</span>
        {last && (
          <span className={styles.tag}>Last win: {last.winXP ?? 0} XP</span>
        )}
      </div>
    </div>
  );
}
