// src/pages/sportsbook/index.tsx
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/**
* FELENA SPORTSBOOK (Demo)
* ----------------------------------------------
* • XP-native book: $1 ≈ 1 XP (display parity).
* • Straight bets (singles) & Parlays.
* • American odds (+150, -110, etc). Decimal math under the hood.
* • 3% burn on stake at placement (deflationary fee).
* • Settlement is simulated with odds-weighted randomness (demo only).
* • Local-only state; wire to your real backend when ready.
*/

type Team = { id: string; name: string };
type MarketType = "ML" | "SPREAD" | "TOTAL_O" | "TOTAL_U";
type Selection = {
eventId: string;
eventLabel: string; // e.g., "LA vs BOS (NBA)"
market: MarketType;
label: string; // "LA Lakers" or "BOS -3.5" or "Over 212.5"
american: number; // e.g., -110, +130
// For sim, weight is based on impliedProb (no-vig rough)
impliedProb: number;
};

type Event = {
id: string;
league: "NBA" | "NFL" | "EPL" | "UFC" | "TENNIS" | "CRICKET" | "MLB" | "NHL";
label: string;
when: string; // display only
selections: Selection[];
};

type BetTicket = {
id: string;
ts: number;
mode: "STRAIGHT" | "PARLAY";
legs: Selection[];
stake: number;
burned: number;
status: "open" | "won" | "lost" | "push";
payout?: number; // when settled
};

const XP_KEY = "op_xp";
const TIX_KEY = "sportsbook_tickets";

const FEE_RATE = 0.03; // 3% burn on stake

// ---------------------------- Helpers ----------------------------
function usd(n: number) {
return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function americanToDecimal(american: number) {
if (american === 0) return 1;
if (american > 0) return 1 + american / 100;
return 1 + 100 / Math.abs(american);
}

function americanToImpliedProb(american: number) {
if (american > 0) return 100 / (american + 100);
return Math.abs(american) / (Math.abs(american) + 100);
}

// crude RNG settle by probability
function winWithProb(p: number) {
return Math.random() < p;
}

function rid() {
if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
return Math.random().toString(36).slice(2);
}

// ---------------------------- Demo Eventboard ----------------------------
function buildBoard(): Event[] {
const makeML = (eventId: string, eventLabel: string, a: [string, number], b: [string, number]): Selection[] => {
const [teamA, oddsA] = a;
const [teamB, oddsB] = b;
return [
{
eventId,
eventLabel,
market: "ML",
label: teamA,
american: oddsA,
impliedProb: americanToImpliedProb(oddsA),
},
{
eventId,
eventLabel,
market: "ML",
label: teamB,
american: oddsB,
impliedProb: americanToImpliedProb(oddsB),
},
];
};

const makeSpread = (eventId: string, eventLabel: string, a: [string, number], b: [string, number]): Selection[] => [
{ eventId, eventLabel, market: "SPREAD", label: a[0], american: a[1], impliedProb: americanToImpliedProb(a[1]) },
{ eventId, eventLabel, market: "SPREAD", label: b[0], american: b[1], impliedProb: americanToImpliedProb(b[1]) },
];

const makeTotals = (
eventId: string,
eventLabel: string,
total: number,
overOdds: number,
underOdds: number
): Selection[] => [
{ eventId, eventLabel, market: "TOTAL_O", label: `Over ${total}`, american: overOdds, impliedProb: americanToImpliedProb(overOdds) },
{ eventId, eventLabel, market: "TOTAL_U", label: `Under ${total}`, american: underOdds, impliedProb: americanToImpliedProb(underOdds) },
];

const ev: Event[] = [];

// NBA
ev.push({
id: "e_nba_1",
league: "NBA",
label: "LA @ BOS",
when: "Tonight 7:30 PM",
selections: [
...makeML("e_nba_1", "NBA • LA @ BOS", ["LA Moneyline", +135], ["BOS Moneyline", -155]),
...makeSpread("e_nba_1", "NBA • LA @ BOS", ["LA +3.5 (-110)", -110], ["BOS -3.5 (-110)", -110]),
...makeTotals("e_nba_1", "NBA • LA @ BOS", 225.5, -110, -110),
],
});

// NFL
ev.push({
id: "e_nfl_1",
league: "NFL",
label: "NYJ @ MIA",
when: "Sun 1:00 PM",
selections: [
...makeML("e_nfl_1", "NFL • NYJ @ MIA", ["NYJ Moneyline", +170], ["MIA Moneyline", -200]),
...makeSpread("e_nfl_1", "NFL • NYJ @ MIA", ["NYJ +4.5 (-105)", -105], ["MIA -4.5 (-115)", -115]),
...makeTotals("e_nfl_1", "NFL • NYJ @ MIA", 44.5, -105, -115),
],
});

// EPL
ev.push({
id: "e_epl_1",
league: "EPL",
label: "Arsenal vs Chelsea",
when: "Sat 10:00 AM",
selections: [
...makeML("e_epl_1", "EPL • Arsenal vs Chelsea", ["Arsenal", -110], ["Chelsea", +240]),
// simple totals only
...makeTotals("e_epl_1", "EPL • Arsenal vs Chelsea", 2.5, -120, +100),
],
});

// UFC
ev.push({
id: "e_ufc_1",
league: "UFC",
label: "Ramos vs Park",
when: "Sat 9:00 PM",
selections: [
...makeML("e_ufc_1", "UFC • Ramos vs Park", ["Ramos", -140], ["Park", +120]),
],
});

// Tennis
ev.push({
id: "e_ten_1",
league: "TENNIS",
label: "Alba vs Ito",
when: "Fri 2:00 PM",
selections: [
...makeML("e_ten_1", "Tennis • Alba vs Ito", ["Alba", -125], ["Ito", +105]),
],
});

// Cricket
ev.push({
id: "e_cri_1",
league: "CRICKET",
label: "Mumbai vs Delhi",
when: "Sun 6:00 AM",
selections: [
...makeML("e_cri_1", "Cricket • Mumbai vs Delhi", ["Mumbai", -115], ["Delhi", -105]),
],
});

// MLB
ev.push({
id: "e_mlb_1",
league: "MLB",
label: "Yankees @ Dodgers",
when: "Tonight 9:10 PM",
selections: [
...makeML("e_mlb_1", "MLB • Yankees @ Dodgers", ["Yankees", +125], ["Dodgers", -145]),
...makeTotals("e_mlb_1", "MLB • Yankees @ Dodgers", 8.5, -110, -110),
],
});

// NHL
ev.push({
id: "e_nhl_1",
league: "NHL",
label: "Leafs @ Rangers",
when: "Thu 7:00 PM",
selections: [
...makeML("e_nhl_1", "NHL • Leafs @ Rangers", ["Leafs", -105], ["Rangers", -115]),
...makeTotals("e_nhl_1", "NHL • Leafs @ Rangers", 6.0, -110, -110),
],
});

return ev;
}

// ---------------------------- Page ----------------------------
export default function SportsbookPage() {
// Wallet
const [xp, setXp] = useState<number>(0);

// Slip
const [mode, setMode] = useState<"STRAIGHT" | "PARLAY">("PARLAY");
const [stake, setStake] = useState<string>("50");
const [legs, setLegs] = useState<Selection[]>([]);

// Tickets
const [tickets, setTickets] = useState<BetTicket[]>([]);

const board = useMemo(buildBoard, []);
const leagues = useMemo(() => Array.from(new Set(board.map(e => e.league))), [board]);

useEffect(() => {
if (typeof window === "undefined") return;
setXp(Number(localStorage.getItem(XP_KEY) || 1000));
setTickets(safeJSON<BetTicket[]>(localStorage.getItem(TIX_KEY), []));
}, []);
useEffect(() => { if (typeof window !== "undefined") localStorage.setItem(XP_KEY, String(xp)); }, [xp]);
useEffect(() => { if (typeof window !== "undefined") localStorage.setItem(TIX_KEY, JSON.stringify(tickets)); }, [tickets]);

// Remove duplicate legs from same event/market/label
function addLeg(s: Selection) {
setLegs((prev) => {
const dupe = prev.find(l => l.eventId === s.eventId && l.market === s.market && l.label === s.label);
if (dupe) return prev;
return [...prev, s];
});
}
function removeLeg(idx: number) {
setLegs((prev) => prev.filter((_, i) => i !== idx));
}
function clearSlip() {
setLegs([]);
setStake("50");
}

// Quote
const q = useMemo(() => {
const sk = Math.max(0, Math.floor(Number(stake) || 0));
if (legs.length === 0 || sk <= 0) return { potential: 0, fee: 0, valid: false };
const fee = Math.floor(sk * FEE_RATE);
if (mode === "STRAIGHT") {
// potential = sum over legs of stake-per-leg * (decimal - 1)
const per = Math.floor(sk / legs.length);
const potNet = legs.reduce((acc, leg) => {
const dec = americanToDecimal(leg.american);
return acc + Math.floor(per * (dec - 1));
}, 0);
return { potential: potNet, fee, valid: per > 0 };
} else {
const dec = legs.reduce((acc, leg) => acc * americanToDecimal(leg.american), 1);
const potNet = Math.floor(sk * (dec - 1));
return { potential: potNet, fee, valid: true };
}
}, [legs, stake, mode]);

function placeBet() {
const sk = Math.max(0, Math.floor(Number(stake) || 0));
if (!q.valid || sk <= 0) return alert("Enter a valid stake.");
if (sk > xp) return alert("Insufficient XP.");
if (legs.length === 0) return alert("Add at least one selection.");
// burn fee immediately
const burned = Math.floor(sk * FEE_RATE);
setXp(v => v - sk); // full stake debited up-front
const t: BetTicket = {
id: rid(),
ts: Date.now(),
mode,
legs: legs.slice(),
stake: sk,
burned,
status: "open",
};
setTickets((ts) => [t, ...ts]);
clearSlip();
alert(`Bet placed. Burned ${burned} XP. Good luck.`);
}

function simulateSettle(t: BetTicket) {
if (t.status !== "open") return;

// Simulate each leg pass/fail
const legResults = t.legs.map((l) => winWithProb(l.impliedProb));

let result: BetTicket["status"];
let payout = 0;

if (t.mode === "STRAIGHT") {
// Singles: each leg is an independent bet with stake-per-leg
const per = Math.floor(t.stake / t.legs.length);
const returns = t.legs.reduce((acc, leg, i) => {
if (!legResults[i]) return acc; // lost leg → no return on that portion
const dec = americanToDecimal(leg.american);
return acc + Math.floor(per * dec);
}, 0);
// For simplicity, pushes ignored; returns already include stake for won legs.
payout = returns; // includes winning-leg stakes
result = payout > 0 ? "won" : "lost";
} else {
// Parlay: all legs must win
if (legResults.every(Boolean)) {
const dec = t.legs.reduce((acc, leg) => acc * americanToDecimal(leg.american), 1);
payout = Math.floor(t.stake * dec); // includes stake
result = "won";
} else {
payout = 0;
result = "lost";
}
}

// Net change to wallet:
// We already deducted full stake when placing. Now credit payout (if any).
setTickets((arr) =>
arr.map((x) => (x.id === t.id ? { ...x, status: result, payout } : x))
);
if (payout > 0) {
setXp((v) => v + payout);
}
}

return (
<div className={styles.page}>
<Head>
<title>Sportsbook — Felena Theory</title>
<meta
name="description"
content="Stake XP on American & international markets. Straights & parlays with a small burn on each stake. Demo-only, odds-weighted simulation."
/>
</Head>

<main className={styles.wrap}>
<header className={styles.hero}>
<h1 className={styles.title}>Sportsbook</h1>
<p className={styles.sub}>
Straights and Parlays across NBA, NFL, soccer, fights, and more. Every stake burns 3% of XP by design.
</p>
<p className={styles.tag}>
Balance: <strong>{usd(xp)} XP</strong> • Burn Fee: <strong>{(FEE_RATE * 100).toFixed(0)}%</strong>
</p>
<div className={styles.ctaRow}>
<Link className={styles.btn} href="/phonebooth">Deposit / Withdraw</Link>
<Link className={`${styles.btn} ${styles.btnGhost}`} href="/">← Home</Link>
</div>
</header>

{/* Control row */}
<section className={styles.grid} style={{ gridTemplateColumns: "2fr 1fr" }}>
{/* Left: Eventboard */}
<article className={styles.card}>
<h3>Markets</h3>
<p className={styles.tag}>Tap a price to add to your bet slip.</p>

{leagues.map((lg) => (
<div key={lg} style={{ marginTop: 10 }}>
<h4 style={{ margin: "0 0 6px" }}>{lg}</h4>
<div className="evGrid">
{board.filter((e) => e.league === lg).map((e) => (
<div key={e.id} className="evRow">
<div className="evMeta">
<div style={{ fontWeight: 800 }}>{e.label}</div>
<div className={styles.tag}>{e.when}</div>
</div>
<div className="evBtns">
{e.selections.map((s, i) => (
<button key={i} className="priceBtn" onClick={() => addLeg(s)} title={`${s.eventLabel} • ${s.label}`}>
<span className="lbl">{s.label}</span>
<span className="odds">{s.american > 0 ? `+${s.american}` : s.american}</span>
</button>
))}
</div>
</div>
))}
</div>
</div>
))}

<style jsx>{`
.evGrid{ display: grid; gap: 10px; }
.evRow{
display: grid;
grid-template-columns: 1fr 2fr;
gap: 10px;
padding: 10px;
border: 1px solid rgba(0,255,136,.2);
border-radius: 12px;
background: linear-gradient(180deg, rgba(0,20,8,.25), rgba(0,0,0,.5));
}
@media (max-width: 900px){ .evRow{ grid-template-columns: 1fr; } }
.evMeta{ display:flex; flex-direction:column; gap:4px; }
.evBtns{ display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
.priceBtn{
display:flex; align-items:center; justify-content:space-between; gap:8px;
padding:10px 12px; border-radius:10px;
border:1px solid rgba(0,255,136,.35);
background: linear-gradient(180deg, rgba(0,255,136,.10), rgba(0,0,0,.35));
box-shadow: inset 0 0 12px rgba(0,255,136,.12), 0 0 10px rgba(0,255,136,.18);
font-weight:800; color:#d9ffe0;
cursor:pointer;
}
.lbl{ font-size: 13px; }
.odds{ font-size: 14px; color:#a9ffd1; text-shadow: 0 0 8px rgba(0,255,136,.35); }
`}</style>
</article>

{/* Right: Betslip */}
<article className={styles.card}>
<h3>Bet Slip</h3>
{legs.length === 0 ? (
<p className={styles.tag}>No selections yet. Tap a price to add.</p>
) : (
<>
<div className="legs">
{legs.map((l, i) => (
<div key={i} className="leg">
<div style={{ fontWeight: 800 }}>{l.label}</div>
<div className={styles.tag}>{l.eventLabel} • {l.market}</div>
<div className="right">
<span className="odds">{l.american > 0 ? `+${l.american}` : l.american}</span>
<button className="x" onClick={() => removeLeg(i)} aria-label="Remove">✕</button>
</div>
</div>
))}
</div>

<div className="row">
<label className={styles.tag}>Mode</label>
<div className="seg">
<button
className={`segBtn ${mode === "STRAIGHT" ? "on" : ""}`}
onClick={() => setMode("STRAIGHT")}
>Straight</button>
<button
className={`segBtn ${mode === "PARLAY" ? "on" : ""}`}
onClick={() => setMode("PARLAY")}
>Parlay</button>
</div>
</div>

<div className="row">
<label className={styles.tag}>Stake</label>
<input
value={stake}
onChange={(e) => setStake(e.target.value)}
className="inp"
inputMode="numeric"
placeholder="XP"
/>
</div>

<div className="row">
<div className={styles.tag}>Burn Fee</div>
<div style={{ fontWeight: 800 }}>{usd(q.fee)} XP</div>
</div>

<div className="row">
<div className={styles.tag}>Potential Net Win</div>
<div style={{ fontWeight: 800 }}>{usd(q.potential)} XP</div>
</div>

<div className={styles.ctaRow} style={{ marginTop: 10 }}>
<button className={styles.cardCta} onClick={placeBet}>Place Bet</button>
<button className={styles.cardCta} onClick={clearSlip}>Clear</button>
</div>
</>
)}

<style jsx>{`
.legs{ display:grid; gap:10px; margin: 8px 0; }
.leg{
display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:center;
padding:8px 10px; border-radius:10px; border:1px solid rgba(0,255,136,.22);
background: linear-gradient(180deg, rgba(0,20,8,.25), rgba(0,0,0,.45));
}
.right{ display:flex; align-items:center; gap:8px; }
.odds{ font-weight: 900; color:#a9ffd1; }
.x{
border:1px solid rgba(0,255,136,.35); border-radius:8px; padding:4px 8px;
background: linear-gradient(180deg, rgba(0,255,136,.10), rgba(0,0,0,.35));
color:#eaffe9;
}
.row{
display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:8px;
}
.seg{ display:flex; gap:8px; }
.segBtn{
border:1px solid rgba(0,255,136,.35); border-radius:10px; padding:6px 10px;
background: linear-gradient(180deg, rgba(0,255,136,.10), rgba(0,0,0,.35));
color:#eaffe9; font-weight:900;
}
.segBtn.on{ box-shadow: 0 0 14px rgba(0,255,136,.28), inset 0 0 12px rgba(0,255,136,.16); }
.inp{
width:140px; padding:8px 10px; border-radius:10px;
border:1px solid rgba(0,255,136,.25); background:rgba(0,20,8,.35); color:#eaffe9;
box-shadow: inset 0 0 14px rgba(0,255,136,.08);
text-align:right; font-weight:800;
}
`}</style>
</article>
</section>

{/* Tickets / Settlement */}
<section style={{ marginTop: 16 }}>
<article className={styles.card} style={{ overflow: "hidden" }}>
<h3>My Tickets (Demo)</h3>
{tickets.length === 0 ? (
<p className={styles.tag}>No tickets yet.</p>
) : (
<div className="tix">
<div className="head row">
<span>Placed</span>
<span>Type</span>
<span>Legs</span>
<span>Stake</span>
<span>Burned</span>
<span>Status</span>
<span>Payout</span>
<span>Action</span>
</div>
{tickets.map((t) => (
<div key={t.id} className="row">
<span>{new Date(t.ts).toLocaleString()}</span>
<span>{t.mode}</span>
<span>
{t.legs.map((l, i) => (
<div key={i} className="legline">
{l.label} <em>({l.american > 0 ? `+${l.american}` : l.american})</em>
</div>
))}
</span>
<span>{usd(t.stake)}</span>
<span>{usd(t.burned)}</span>
<span style={{ fontWeight: 800 }}>{t.status.toUpperCase()}</span>
<span>{t.payout ? usd(t.payout) : "—"}</span>
<span>
{t.status === "open" ? (
<button className="pill" onClick={() => simulateSettle(t)}>Simulate Result</button>
) : (
<button className="pill" onClick={() => removeTicket(t.id)}>Remove</button>
)}
</span>
</div>
))}
</div>
)}

<style jsx>{`
.tix{ display:grid; gap:8px; }
.row{
display:grid;
grid-template-columns: 1.2fr .6fr 1.8fr .6fr .6fr .6fr .6fr .7fr;
gap:8px; padding:8px 10px; border-radius:10px;
border:1px solid rgba(0,255,136,.18);
background: linear-gradient(180deg, rgba(0,20,8,.2), rgba(0,0,0,.35));
}
.head{ font-weight: 900; color:#a9ffd1; }
.legline{ display:block; }
@media (max-width: 1000px){
.row{ grid-template-columns: 1fr .5fr 1.5fr .6fr .6fr .6fr .6fr; }
.row span:last-child{ display:none; }
}
.pill{
border:1px solid rgba(0,255,136,.45);
border-radius:10px; padding:6px 10px;
background:linear-gradient(180deg, rgba(0,255,136,.12), rgba(0,0,0,.32));
color:#eaffe9; font-weight:900;
}
`}</style>
</article>
</section>

<footer className={styles.footer}>
<span>All wagering here is a simulated demo. In production, outcomes and compliance are handled server-side.</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link className={styles.cardCta} href="/terms">Terms & Disclosures</Link>
</div>
</footer>
</main>
</div>
);

// -------------- inner helpers --------------
function removeTicket(id: string) {
setTickets((arr) => arr.filter((t) => t.id !== id));
}
}

// ---------------------------- utils ----------------------------
function safeJSON<T>(raw: string | null, fallback: T): T {
try {
return raw ? (JSON.parse(raw) as T) : fallback;
} catch {
return fallback;
}
}