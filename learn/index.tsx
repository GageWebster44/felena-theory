// src/pages/learn/index.tsx
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/**
 * Learn-to-Earn (Trades, Essential Jobs & Simulators)
 * - Levels 1→10 scale from quick basics to deeper mastery.
 * - Rewards use a +15% curve. $1 ≈ 1 XP.
 * - Minors: 60% locked savings until 18, 40% to guardian. Adults: 100% spendable.
 * - Daily cap: 5 levels/day (Override or Skip with XP).
 */

type Track = {
  id: string;
  title: string;
  audience: "Kids" | "Adults" | "Both";
  desc: string;
  baseXP: number;
};

const TRACKS: Track[] = [
  // Core trades
  { id: "t_electric",  title: "Electric",  audience: "Both",   desc: "Flip the grid: trace circuits, bend conduit, light entire rooms like a pro.", baseXP: 85 },
  { id: "t_concrete",  title: "Concrete",  audience: "Both",   desc: "From bags to beams—form, pour, and finish rock-solid builds that endure.", baseXP: 80 },
  { id: "t_carpentry", title: "Carpentry", audience: "Both",   desc: "Measure twice, cut once—frames, trims, and furniture with clean joins.", baseXP: 75 },
  { id: "t_cosmo",     title: "Cosmetology", audience: "Both", desc: "Color theory to runway shine—transform looks and nail client care.", baseXP: 70 },
  { id: "t_welding",   title: "Welding",   audience: "Both",   desc: "Strike the arc—MIG, TIG, and stick for clean beads and strong steel.", baseXP: 85 },
  { id: "t_plumbing",  title: "Plumbing",  audience: "Both",   desc: "Stop leaks, set fixtures, map the maze—pressure-tested perfection.", baseXP: 85 },
  { id: "t_hvac",      title: "HVAC",      audience: "Both",   desc: "Chill or heat on command—diagnose airflow, charge systems, balance comfort.", baseXP: 90 },
  { id: "t_culinary",  title: "Culinary",  audience: "Both",   desc: "From knife skills to service rush—plate flavors that hit every time.", baseXP: 70 },
  { id: "t_auto",      title: "Auto Tech", audience: "Both",   desc: "Scan, wrench, win—brakes, engines, and diagnostics that bring cars back.", baseXP: 80 },
  { id: "t_farming",   title: "Farming",   audience: "Both",   desc: "Soil to market—plant, irrigate, harvest, and run a resilient farm.", baseXP: 75 },

  // Professional / service
  { id: "t_law",       title: "Law Assistant", audience: "Adults", desc: "Turn chaos into cases—intake, research, filings, deadlines met.", baseXP: 90 },
  { id: "t_software",  title: "Software Dev",  audience: "Both",   desc: "Ship code—loops to full-stack apps with clean APIs and version control.", baseXP: 85 },
  { id: "t_music",     title: "Music Engineering", audience: "Both", desc: "Capture magic—gain staging, mixing, and mastering that hits.", baseXP: 80 },
  { id: "t_dispatch",  title: "Dispatcher",     audience: "Adults", desc: "Command the map—assign routes, beat clocks, keep ops flowing.", baseXP: 75 },
  { id: "t_detective", title: "Detective",      audience: "Adults", desc: "Read the room—track leads, crack patterns, close the case.", baseXP: 90 },
  { id: "t_nursing",   title: "Nursing (CNA Path)", audience: "Adults", desc: "Vitals, care plans, chart mastery—calm under pressure, always.", baseXP: 95 },
  { id: "t_paramedic", title: "Paramedic",      audience: "Adults", desc: "First on scene—assess fast, act faster, deliver lives to safety.", baseXP: 95 },

  // Community & life
  { id: "t_lifeguard", title: "Lifeguard",      audience: "Both", desc: "Own the water—scan, sprint, rescue, and lead with CPR confidence.", baseXP: 70 },
  { id: "t_barber",    title: "Barber",         audience: "Both", desc: "Crisp lines, flawless fades—chair presence that builds a book.", baseXP: 70 },
  { id: "t_clothing",  title: "Clothing Design", audience: "Both", desc: "Sketch to stitch—patterns, fit, and style that turns heads.", baseXP: 75 },
  { id: "t_life",      title: "Basic Life Skills", audience: "Kids", desc: "Bank it, budget it, cook it—real-world wins from day one.", baseXP: 55 },

  // Specialized & aspirational
  { id: "t_pilot",     title: "Pilot",            audience: "Adults", desc: "Throttle up—checklists to crosswinds to smooth landings.", baseXP: 100 },
  { id: "t_racecar",   title: "Race Car Driver",  audience: "Both",   desc: "Hit the apex—pace, tire wear, and fearless overtakes.", baseXP: 95 },
  { id: "t_fisher",    title: "Commercial Fisherman", audience: "Adults", desc: "Rough seas, precise nets—haul smart and sell strong.", baseXP: 85 },
  { id: "t_cdl",       title: "CDL Simulator",    audience: "Both",   desc: "Shift up—backing yards, long-haul stamina, on-time drops.", baseXP: 80 },
];

// ---- De-dup guard (by id OR title) ----
function dedupTracks(list: Track[]): Track[] {
  const byId = new Map<string, Track>();
  const byTitle = new Set<string>();
  const out: Track[] = [];
  for (const t of list) {
    const titleKey = t.title.trim().toLowerCase();
    if (byId.has(t.id) || byTitle.has(titleKey)) {
      if (typeof window !== "undefined") {
        console.warn("[LEARN] Duplicate track skipped:", t);
      }
      continue;
    }
    byId.set(t.id, t);
    byTitle.add(titleKey);
    out.push(t);
  }
  return out;
}
const UNIQUE_TRACKS = dedupTracks(TRACKS);

const levelXP = (base: number, level: number) =>
  Math.round(base * (1 + (level - 1) * 0.15));

const K = {
  minor: "learn_isMinor",
  guardian: "learn_guardian",
  spendable: "learn_spendable",
  locked: "learn_locked",
  progress: "learn_progress",
  ledger: "learn_ledger",
  capDate: "learn_cap_date",
  capUsed: "learn_cap_used",
};

type LedgerItem = {
  id: string;
  ts: number;
  type: "earn" | "override" | "skip";
  note: string;
  trackId?: string;
  earned?: number;
  locked?: number;
  guardian?: number;
  spendableDelta: number;
};

export default function LearnPage() {
  const [isMinor, setIsMinor] = useState(false);
  const [guardian, setGuardian] = useState("");
  const [spendable, setSpendable] = useState(0);
  const [locked, setLocked] = useState(0);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [capDate, setCapDate] = useState(today());
  const [capUsed, setCapUsed] = useState(0);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const DAILY_CAP = 5;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMinor(localStorage.getItem(K.minor) === "1");
    setGuardian(localStorage.getItem(K.guardian) || "");
    setSpendable(Number(localStorage.getItem(K.spendable) || 0));
    setLocked(Number(localStorage.getItem(K.locked) || 0));
    setProgress(safeJSON(localStorage.getItem(K.progress), {}));
    setLedger(safeJSON(localStorage.getItem(K.ledger), []));
    setCapDate(localStorage.getItem(K.capDate) || today());
    setCapUsed(Number(localStorage.getItem(K.capUsed) || 0));
  }, []);

  useEffect(() => {
    const t = today();
    if (capDate !== t) { setCapDate(t); setCapUsed(0); }
  }, [capDate]);

  useEffect(() => localStorage.setItem(K.minor, isMinor ? "1" : "0"), [isMinor]);
  useEffect(() => localStorage.setItem(K.guardian, guardian), [guardian]);
  useEffect(() => localStorage.setItem(K.spendable, String(spendable)), [spendable]);
  useEffect(() => localStorage.setItem(K.locked, String(locked)), [locked]);
  useEffect(() => localStorage.setItem(K.progress, JSON.stringify(progress)), [progress]);
  useEffect(() => localStorage.setItem(K.ledger, JSON.stringify(ledger)), [ledger]);
  useEffect(() => { localStorage.setItem(K.capDate, capDate); localStorage.setItem(K.capUsed, String(capUsed)); }, [capDate, capUsed]);

  // Use unique list for UI
  const kids   = useMemo(() => UNIQUE_TRACKS.filter(t => t.audience !== "Adults"), []);
  const adults = useMemo(() => UNIQUE_TRACKS.filter(t => t.audience !== "Kids"), []);

  function pushLedger(item: LedgerItem) {
    setLedger(l => [{ ...item, id: rid(), ts: Date.now() }, ...l].slice(0, 300));
  }

  function canTrain() {
    if (capUsed < DAILY_CAP) return true;
    alert(`Daily cap (${DAILY_CAP}) reached. Override with 10 XP or train tomorrow.`);
    return false;
  }
  function consumeAttempt() { setCapUsed(n => n + 1); }

  function completeLevel(t: Track) {
    if (!canTrain()) return;
    const lvl = progress[t.id] || 0;
    if (lvl >= 10) return alert("Max level reached.");
    const next = lvl + 1;
    const xp = levelXP(t.baseXP, next);

    if (isMinor) {
      const toLocked = Math.round(xp * 0.6);
      const toGuardian = xp - toLocked;
      setLocked(v => v + toLocked);
      pushLedger({ type: "earn", note: `Level ${next} • Minor 60/40`, trackId: t.id, earned: xp, locked: toLocked, guardian: toGuardian, spendableDelta: 0 });
    } else {
      setSpendable(v => v + xp);
      pushLedger({ type: "earn", note: `Level ${next} complete`, trackId: t.id, earned: xp, spendableDelta: xp });
    }

    setProgress(p => ({ ...p, [t.id]: next }));
    consumeAttempt();
  }

  function overrideCap() {
    if (spendable < 10) return alert("Need 10 XP.");
    setSpendable(v => v - 10);
    setCapUsed(n => Math.max(0, n - 1));
    pushLedger({ type: "override", note: "Override daily cap", spendableDelta: -10 });
  }

  function skipLevel(t: Track) {
    const lvl = progress[t.id] || 0;
    if (lvl >= 10) return alert("Maxed.");
    const next = lvl + 1;
    const cost = 50 * next;
    if (spendable < cost) return alert(`Need ${cost} XP.`);
    if (!confirm(`Spend ${cost} XP to skip to level ${next}?`)) return;
    setSpendable(v => v - cost);
    setProgress(p => ({ ...p, [t.id]: next }));
    pushLedger({ type: "skip", note: `Skipped to level ${next}`, trackId: t.id, spendableDelta: -cost });
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>Learn-to-Earn — Jobs & Trades</title>
        <meta name="description" content="Dynamic leveling across essential jobs, trades, and simulators. Earn XP, safeguard minors, override caps, skip levels." />
      </Head>

      <main className={styles.wrap}>
        <header className={styles.hero}>
          <h1 className={styles.title}>Learn-to-Earn</h1>
          <p className={styles.sub}>
            Pick a path. Start simple. Level up fast. Real-world skills meet game-speed progress and XP rewards.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.btn} href="/phonebooth">Redeem / Manage XP</Link>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={overrideCap}>Override Cap (10 XP)</button>
          </div>
        </header>

        {/* Single, clean flow — no category labels */}
        <TrackGrid tracks={kids}  progress={progress} onTrain={completeLevel} onSkip={skipLevel} />
        <div style={{ height: 12 }} />
        <TrackGrid tracks={adults} progress={progress} onTrain={completeLevel} onSkip={skipLevel} />
      </main>
    </div>
  );
}

function TrackGrid({
  tracks,
  progress,
  onTrain,
  onSkip,
}: {
  tracks: Track[];
  progress: Record<string, number>;
  onTrain: (t: Track) => void;
  onSkip: (t: Track) => void;
}) {
  return (
    <section className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
      {tracks.map((t) => {
        const lvl = progress[t.id] || 0;
        const next = Math.min(10, lvl + 1);
        const reward = lvl >= 10 ? 0 : levelXP(t.baseXP, next);
        const skipCost = 50 * next;

        return (
          <article key={t.id} className={styles.card}>
            <h3>{t.title}</h3>
            <p>{t.desc}</p>

            <div className="meter" aria-label="Progress">
              <span style={{ width: `${(lvl / 10) * 100}%` }} />
            </div>
            <p className={styles.tag}>Level {lvl}/10 • Next reward: {reward} XP</p>

            <div className={styles.ctaRow}>
              <button className={styles.cardCta} onClick={() => onTrain(t)} disabled={lvl >= 10}>
                {lvl >= 10 ? "Maxed" : `Train Level ${next}`}
              </button>
              <button className={styles.cardCta} onClick={() => onSkip(t)} disabled={lvl >= 10} title="No XP for skipped levels">
                Skip ({skipCost} XP)
              </button>
            </div>

            <style jsx>{`
              .meter {
                position: relative; height: 10px; border-radius: 999px;
                background: rgba(0,255,136,.08); border: 1px solid rgba(0,255,136,.25);
                box-shadow: inset 0 0 10px rgba(0,255,136,.08);
                margin: 10px 0 6px;
              }
              .meter span {
                display: block; height: 100%; border-radius: 999px;
                background: linear-gradient(90deg, rgba(0,255,136,.45), rgba(0,255,136,.15));
                box-shadow: 0 0 12px rgba(0,255,136,.25);
                transition: width .25s ease;
              }
            `}</style>
          </article>
        );
      })}
    </section>
  );
}

// Utils
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function safeJSON<T>(raw: string | null, fallback: T): T {
  try { return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function rid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}