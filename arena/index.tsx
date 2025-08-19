// src/pages/arena/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/**
* FELENA ARENA — PVP BATTLEGROUNDS
*
* • Players stake XP to enter quick head-to-head games.
* • A small % of every pot is BURNED (removed from supply), the rest is awarded to the winner.
* • Win → earn XP + rating. Lose → lose stake. Draws refund (minus burn).
* • Everything here is demo / localStorage only — wire to your backend later.
*/

type Result = "win" | "lose" | "draw";

const XP_KEY = "op_xp";
const ALIAS_KEY = "op_alias";
const ELO_KEY = "arena_elo";
const WINS_KEY = "arena_wins";
const LOSSES_KEY = "arena_losses";
const BURN_RATE = 0.06; // 6% of total pot burns on every finished match
const K_FACTOR = 24; // rating movement strength

// Utility
function clamp(n: number, lo: number, hi: number) {
return Math.max(lo, Math.min(hi, n));
}
function randChoice<T>(arr: T[]) {
return arr[Math.floor(Math.random() * arr.length)];
}
function probFromElo(my: number, opp: number) {
return 1 / (1 + Math.pow(10, (opp - my) / 400));
}
function adjustElo(my: number, opp: number, result: Result) {
const p = probFromElo(my, opp);
const s = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
return Math.round(my + K_FACTOR * (s - p));
}

// ————————————————————————————————————————————————————————
// Demo opponents (used by several modes as “queue fill”)
// ————————————————————————————————————————————————————————
const OPP = [
{ id: "op1", alias: "ShadowWolf", rating: 1180 },
{ id: "op2", alias: "NeonRider", rating: 1210 },
{ id: "op3", alias: "ByteSamurai", rating: 1240 },
{ id: "op4", alias: "ZeroCool", rating: 1150 },
];

// ————————————————————————————————————————————————————————
// Trivia pool (short + punchy; replace with your catalog later)
// ————————————————————————————————————————————————————————
type Q = { q: string; a: string[]; i: number };
const TRIVIA: Q[] = [
{ q: "What planet is known as the Red Planet?", a: ["Mars", "Venus", "Mercury", "Pluto"], i: 0 },
{ q: "Binary of decimal 2?", a: ["11", "10", "01", "00"], i: 1 },
{ q: "HTTP status for Not Found?", a: ["500", "301", "404", "418"], i: 2 },
{ q: "pi ≈ ?", a: ["2.12", "3.14", "1.61", "2.72"], i: 1 },
{ q: "Largest ocean?", a: ["Atlantic", "Pacific", "Indian", "Arctic"], i: 1 },
];

// ————————————————————————————————————————————————————————
// Page
// ————————————————————————————————————————————————————————
export default function ArenaPage() {
// Profile
const [alias, setAlias] = useState("Operator");
const [xp, setXp] = useState(0);
const [rating, setRating] = useState(1200);
const [wins, setWins] = useState(0);
const [losses, setLosses] = useState(0);

// UI
const [mode, setMode] = useState<ModeKey | "">("");
const [status, setStatus] = useState("Pick a battleground. Stake XP. Burn & earn.");

// Load / persist
useEffect(() => {
if (typeof window === "undefined") return;
setAlias(localStorage.getItem(ALIAS_KEY) || "Operator");
setXp(Number(localStorage.getItem(XP_KEY) || 500)); // seed a demo balance if empty
setRating(Number(localStorage.getItem(ELO_KEY) || 1200));
setWins(Number(localStorage.getItem(WINS_KEY) || 0));
setLosses(Number(localStorage.getItem(LOSSES_KEY) || 0));
}, []);
useEffect(() => { if (typeof window !== "undefined") localStorage.setItem(XP_KEY, String(xp)); }, [xp]);
useEffect(() => { if (typeof window !== "undefined") localStorage.setItem(ELO_KEY, String(rating)); }, [rating]);
useEffect(() => { if (typeof window !== "undefined") localStorage.setItem(WINS_KEY, String(wins)); }, [wins]);
useEffect(() => { if (typeof window !== "undefined") localStorage.setItem(LOSSES_KEY, String(losses)); }, [losses]);

// Shared settle logic for all games
function settleMatch(opts: {
stakeMe: number;
stakeOpp?: number; // defaults to same as me
opp: { alias: string; rating: number };
result: Result;
note: string;
}) {
const stakeOpp = opts.stakeOpp ?? opts.stakeMe;
const totalPot = opts.stakeMe + stakeOpp;
const burned = Math.floor(totalPot * BURN_RATE);

let deltaXP = 0;
if (opts.result === "win") deltaXP = totalPot - burned - opts.stakeMe; // net profit: total pot minus burn minus our own stake already counted
if (opts.result === "lose") deltaXP = -opts.stakeMe; // lose our stake
if (opts.result === "draw") deltaXP = -Math.ceil(burned / 2); // each shares burn on refund

// wallet
setXp((v) => clamp(v + deltaXP, 0, 10_000_000));

// rating
const nextElo = adjustElo(rating, opts.opp.rating, opts.result);
setRating(nextElo);

// w/l
if (opts.result === "win") setWins((w) => w + 1);
if (opts.result === "lose") setLosses((l) => l + 1);

// status
const head = opts.result === "win" ? "Victory" : opts.result === "lose" ? "Defeat" : "Draw";
const msg =
`${head} vs ${opts.opp.alias}. ` +
`${opts.note} • Stake: ${opts.stakeMe} XP • Burned: ${burned} XP • ` +
`ΔXP: ${deltaXP >= 0 ? "+" : ""}${deltaXP} • Rating: ${rating} → ${nextElo}`;
setStatus(msg);
}

// Get a stake via prompt (simple demo)
function promptStake(defaultStake = 50) {
const raw = prompt(`Stake XP (balance: ${xp}):`, String(defaultStake));
if (!raw) return 0;
const val = Math.floor(Number(raw) || 0);
if (val <= 0) { alert("Stake must be > 0."); return 0; }
if (val > xp) { alert("Insufficient XP."); return 0; }
return val;
}

return (
<div className={styles.page}>
<Head>
<title>Felena Arena — Burn & Earn PvP</title>
<meta
name="description"
content="Stake XP in quick PvP battlegrounds. A slice burns, the winner takes the rest. Trivia, RPS, coinflip, click-race, and more."
/>
</Head>

<main className={styles.wrap}>
{/* Hero */}
<header className={styles.hero}>
<h1 className={styles.title}>Felena Arena</h1>
<p className={styles.sub}>
Constant burn, constant motion: stake XP against rivals across bite-size games.
The burn shrinks supply; winners recycle the rest.
</p>
<p className={styles.tag}>
{alias} • Balance: <strong>{xp.toLocaleString()} XP</strong> • Rating: <strong>{rating}</strong> • W/L: {wins}/{losses}
</p>
<div className={styles.ctaRow}>
<Link href="/phonebooth" className={styles.btn}>Manage Balance</Link>
<Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>← Home</Link>
</div>
</header>

{/* Modes grid */}
<section
className={styles.grid}
style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
>
{MODES.map((m) => (
<article key={m.key} className={styles.card}>
<h3>{m.title}</h3>
<p>{m.blurb}</p>
<div className={styles.ctaRow}>
<button
className={styles.cardCta}
onClick={() => setMode(m.key)}
>
Queue →
</button>
</div>
</article>
))}
</section>

{/* Active mode panel */}
{mode && (
<section style={{ marginTop: 16 }}>
<article className={styles.card}>
<ModeRunner
key={mode}
mode={mode}
rating={rating}
onExit={() => setMode("")}
onPromptStake={promptStake}
onSettle={settleMatch}
/>
</article>
</section>
)}

{/* Status log */}
<section style={{ marginTop: 16 }}>
<article className={styles.card}>
<h3>Battle Log</h3>
<p>{status}</p>
</article>
</section>

{/* Footer */}
<footer className={styles.footer}>
<span>Every match burns a slice of the pot. Play responsibly.</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/terms" className={styles.cardCta}>Terms & Disclosures</Link>
</div>
</footer>
</main>
</div>
);
}

// ————————————————————————————————————————————————————————
// Modes registry
// ————————————————————————————————————————————————————————
type ModeKey =
| "coinflip"
| "rps"
| "trivia"
| "click"
| "guess"
| "tictactoe"
| "hiLo"
| "target"
| "reaction"
| "typeRace";

const MODES: { key: ModeKey; title: string; blurb: string }[] = [
{ key: "coinflip", title: "Coin Flip", blurb: "Pure 50/50. Call it right and scoop the pot. Burn still applies on results." },
{ key: "rps", title: "Rock • Paper • Scissors", blurb: "Mind games at light speed. Best-of-1 for the pot." },
{ key: "trivia", title: "Speed Trivia", blurb: "3 questions. Most correct wins. Tie → draw refund minus burn." },
{ key: "click", title: "Click Race", blurb: "Who taps to 30 first? Ready. Set. Spam." },
{ key: "guess", title: "Number Guess", blurb: "Closest to the secret number wins. Price-is-right vibes." },
{ key: "tictactoe", title: "Tic-Tac-Toe", blurb: "Classic grid duel. First 3-in-a-row takes it. Draws happen." },
{ key: "hiLo", title: "High or Low", blurb: "Higher card wins. Aces high. Single draw shootout." },
{ key: "target", title: "Moving Target", blurb: "Click the drifting target within 10 seconds. Closest click time wins." },
{ key: "reaction", title: "Reaction Test", blurb: "Wait for green, then click. Fastest reaction wins." },
{ key: "typeRace", title: "Type Race", blurb: "Type a short phrase with the fewest mistakes, fastest time wins." },
];

// ————————————————————————————————————————————————————————
// Mode runner (switchboard)
// ————————————————————————————————————————————————————————
function ModeRunner(props: {
mode: ModeKey;
rating: number;
onExit: () => void;
onPromptStake: (d?: number) => number;
onSettle: (opts: {
stakeMe: number;
stakeOpp?: number;
opp: { alias: string; rating: number };
result: Result;
note: string;
}) => void;
}) {
const { mode, rating, onExit, onPromptStake, onSettle } = props;
const opp = useMemo(() => randChoice(OPP), [mode]);

switch (mode) {
case "coinflip":
return <CoinFlip opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "rps":
return <RPS opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "trivia":
return <Trivia opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "click":
return <ClickRace opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "guess":
return <GuessNumber opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "tictactoe":
return <TicTacToe opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "hiLo":
return <HighLow opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "target":
return <MovingTarget opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "reaction":
return <ReactionTest opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
case "typeRace":
return <TypeRace opp={opp} rating={rating} onExit={onExit} onPromptStake={onPromptStake} onSettle={onSettle} />;
}
}

// ————————————————————————————————————————————————————————
// Mode components
// (Each asks for stake, simulates opponent, and calls onSettle)
// ————————————————————————————————————————————————————————
function HeaderBar({ title, onExit }: { title: string; onExit: () => void }) {
return (
<div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 8 }}>
<h3 style={{ margin: 0 }}>{title}</h3>
<button className="exitBtn" onClick={onExit}>Exit</button>
<style jsx>{`
.exitBtn{
border:1px solid rgba(0,255,136,.45);
border-radius:10px;padding:6px 10px;
background:linear-gradient(180deg, rgba(0,255,136,.12), rgba(0,0,0,.32));
color:#eaffe9;font-weight:900;
}
`}</style>
</div>
);
}

function CoinFlip(props: CommonProps) {
const { opp, rating, onExit, onPromptStake, onSettle } = props;
function play(side: "Heads" | "Tails") {
const stake = onPromptStake(50);
if (!stake) return;
const theirSide = Math.random() < 0.5 ? "Heads" : "Tails";
const result: Result = side === theirSide ? "win" : "lose";
onSettle({ stakeMe: stake, opp, result, note: `Coin landed: ${theirSide}` });
}
return (
<>
<HeaderBar title={`Coin Flip vs ${opp.alias} (ELO ${opp.rating})`} onExit={onExit} />
<p>Choose wisely. 50/50 with burn on the pot.</p>
<div className="row">
<button className="pill" onClick={() => play("Heads")}>Heads</button>
<button className="pill" onClick={() => play("Tails")}>Tails</button>
</div>
<StyleRow />
</>
);
}

function RPS(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const picks = ["Rock", "Paper", "Scissors"] as const;
function play(me: typeof picks[number]) {
const stake = onPromptStake(50);
if (!stake) return;
const ai = randChoice([...picks]);
let result: Result = "draw";
if (me === "Rock" && ai === "Scissors") result = "win";
else if (me === "Paper" && ai === "Rock") result = "win";
else if (me === "Scissors" && ai === "Paper") result = "win";
else if (me === ai) result = "draw";
else result = "lose";
onSettle({ stakeMe: stake, opp, result, note: `You: ${me} • Opp: ${ai}` });
}
return (
<>
<HeaderBar title={`R•P•S vs ${opp.alias}`} onExit={onExit} />
<div className="row">
<button className="pill" onClick={() => play("Rock")}>Rock</button>
<button className="pill" onClick={() => play("Paper")}>Paper</button>
<button className="pill" onClick={() => play("Scissors")}>Scissors</button>
</div>
<StyleRow />
</>
);
}

function Trivia(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const [qs] = useState(() => [...TRIVIA].sort(() => 0.5 - Math.random()).slice(0, 3));
const [i, setI] = useState(0);
const [me, setMe] = useState(0);
const [them, setThem] = useState(0);
const stakeRef = useRef(0);

useEffect(() => {
if (!stakeRef.current) stakeRef.current = onPromptStake(75);
}, [onPromptStake]);

function answer(idx: number) {
const q = qs[i];
if (idx === q.i) setMe((m) => m + 1);
if (Math.random() < 0.6) setThem((t) => t + 1); // opponent avg skill
const next = i + 1;
if (next >= qs.length) finish();
else setI(next);
}

function finish() {
if (!stakeRef.current) { onExit(); return; }
let result: Result = "draw";
if (me > them) result = "win";
else if (me < them) result = "lose";
onSettle({
stakeMe: stakeRef.current,
opp,
result,
note: `Score ${me}–${them}`,
});
}

const q = qs[i];
return (
<>
<HeaderBar title={`Trivia vs ${opp.alias}`} onExit={onExit} />
<p>Answer fast & right. 3 questions decide it.</p>
<div className="q">
<strong>Q{i + 1}:</strong> {q.q}
</div>
<div className="row">
{q.a.map((opt, idx) => (
<button key={idx} className="pill" onClick={() => answer(idx)}>{opt}</button>
))}
</div>
<p className={styles.tag}>You {me} • Opp {them}</p>
<StyleRow />
<style jsx>{`
.q{ margin: 8px 0 6px; }
`}</style>
</>
);
}

function ClickRace(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const [me, setMe] = useState(0);
const [them, setThem] = useState(0);
const [running, setRunning] = useState(false);
const target = 30;
const stakeRef = useRef(0);

function start() {
const st = onPromptStake(40);
if (!st) return;
stakeRef.current = st;
setMe(0); setThem(0); setRunning(true);
}
useEffect(() => {
if (!running) return;
const id = setInterval(() => setThem((t) => Math.min(target, t + Math.ceil(Math.random() * 3))), 160);
return () => clearInterval(id);
}, [running]);

useEffect(() => {
if (!running) return;
if (me >= target || them >= target) {
setRunning(false);
const result: Result = me > them ? "win" : me < them ? "lose" : "draw";
onSettle({ stakeMe: stakeRef.current, opp, result, note: `Race ${me}–${them} (to ${target})` });
}
}, [me, them, running, opp, onSettle]);

return (
<>
<HeaderBar title={`Click Race vs ${opp.alias}`} onExit={onExit} />
<p>Tap to push your meter to {target}. Opponent sprints too.</p>
{!running ? (
<button className="pill" onClick={start}>Stake & Start</button>
) : (
<button className="big" onClick={() => setMe((v) => Math.min(target, v + 1))}>TAP!</button>
)}
<Meters me={me} them={them} max={target} />
<StyleRow />
<style jsx>{`
.big{ border:1px solid rgba(0,255,136,.45); border-radius:14px; padding:16px 18px; font-weight:900; }
`}</style>
</>
);
}

function GuessNumber(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const secret = useMemo(() => 1 + Math.floor(Math.random() * 100), []);
const [guess, setGuess] = useState("");
function play() {
const stake = onPromptStake(30);
if (!stake) return;
const me = Math.max(1, Math.min(100, Math.floor(Number(guess) || 0)));
if (!me) return alert("Enter a number 1–100.");
const them = 1 + Math.floor(Math.random() * 100);
const dm = Math.abs(secret - me);
const dt = Math.abs(secret - them);
const result: Result = dm < dt ? "win" : dm > dt ? "lose" : "draw";
onSettle({ stakeMe: stake, opp, result, note: `Secret ${secret} • You ${me} • Opp ${them}` });
}
return (
<>
<HeaderBar title={`Number Guess vs ${opp.alias}`} onExit={onExit} />
<p>Closest to the secret 1–100 takes it.</p>
<div className="row">
<input
inputMode="numeric"
placeholder="Your guess"
value={guess}
onChange={(e) => setGuess(e.target.value)}
className="inp"
/>
<button className="pill" onClick={play}>Submit</button>
</div>
<StyleRow />
<style jsx>{`
.inp{
flex:1; min-width: 120px;
padding:8px 10px; border-radius:10px;
border:1px solid rgba(0,255,136,.25);
background:rgba(0,20,8,.35); color:#eaffe9;
box-shadow: inset 0 0 14px rgba(0,255,136,.08);
}
`}</style>
</>
);
}

function TicTacToe(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const [board, setBoard] = useState<string[]>(Array(9).fill(""));
const [turn, setTurn] = useState<"me" | "them">("me");
const stakeRef = useRef(0);

useEffect(() => {
if (!stakeRef.current) stakeRef.current = onPromptStake(60);
}, [onPromptStake]);

useEffect(() => {
if (turn === "them") {
const id = setTimeout(() => {
const empties = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
const move = randChoice(empties);
const next = board.slice();
next[move] = "O";
setBoard(next);
setTurn("me");
}, 450);
return () => clearTimeout(id);
}
}, [turn, board]);

useEffect(() => {
const winner = checkT3(board);
if (winner || !board.includes("")) {
const result: Result = winner === "X" ? "win" : winner === "O" ? "lose" : "draw";
if (stakeRef.current) onSettle({ stakeMe: stakeRef.current, opp, result, note: winner ? `Winner ${winner}` : "Draw" });
}
}, [board, opp, onSettle]);

function clickCell(i: number) {
if (turn !== "me" || board[i]) return;
const next = board.slice();
next[i] = "X";
setBoard(next);
setTurn("them");
}

return (
<>
<HeaderBar title={`Tic-Tac-Toe vs ${opp.alias}`} onExit={onExit} />
<div className="grid">
{board.map((v, i) => (
<button key={i} className="cell" onClick={() => clickCell(i)}>{v || "·"}</button>
))}
</div>
<StyleRow />
<style jsx>{`
.grid{ display:grid; grid-template-columns: repeat(3, 60px); gap:8px; margin: 6px 0; }
.cell{
width:60px;height:60px;border-radius:10px;
border:1px solid rgba(0,255,136,.35);
background:linear-gradient(180deg, rgba(0,255,136,.10), rgba(0,0,0,.35));
font-weight:900;font-size:20px;color:#a9ffd1;
}
`}</style>
</>
);
}

function HighLow(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
function draw() {
const stake = onPromptStake(40);
if (!stake) return;
const me = 2 + Math.floor(Math.random() * 13); // 2..14 (Ace high)
const them = 2 + Math.floor(Math.random() * 13);
const names = (n: number) => (n === 14 ? "A" : n === 13 ? "K" : n === 12 ? "Q" : n === 11 ? "J" : String(n));
const result: Result = me > them ? "win" : me < them ? "lose" : "draw";
onSettle({ stakeMe: stake, opp, result, note: `You ${names(me)} vs Opp ${names(them)}` });
}
return (
<>
<HeaderBar title={`High / Low vs ${opp.alias}`} onExit={onExit} />
<button className="pill" onClick={draw}>Draw Cards</button>
<StyleRow />
</>
);
}

function MovingTarget(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const [x, setX] = useState(10);
const [clicked, setClicked] = useState<number | null>(null);
const start = useRef<number>(0);
const stakeRef = useRef(0);

useEffect(() => {
const st = onPromptStake(35);
if (!st) { onExit(); return; }
stakeRef.current = st;
start.current = performance.now();
const id = setInterval(() => setX((v) => (v + 4) % 100), 60);
const timeout = setTimeout(() => {
if (clicked === null) finish(10_000); // missed
}, 10_000);
return () => { clearInterval(id); clearTimeout(timeout); };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

function finish(ms: number) {
if (!stakeRef.current) return onExit();
const me = ms;
const them = 200 + Math.random() * 1500; // opp reaction
const result: Result = me < them ? "win" : me > them ? "lose" : "draw";
onSettle({ stakeMe: stakeRef.current, opp, result, note: `Times — You ${Math.round(me)}ms, Opp ${Math.round(them)}ms` });
}

return (
<>
<HeaderBar title={`Moving Target vs ${opp.alias}`} onExit={onExit} />
<div className="bar">
<button
className="dot"
style={{ left: `calc(${x}% - 12px)` }}
onClick={() => {
if (clicked !== null) return;
const ms = performance.now() - start.current;
setClicked(ms);
finish(ms);
}}
/>
</div>
<p className={styles.tag}>Click the dot within 10s. Faster beats opponent.</p>
<StyleRow />
<style jsx>{`
.bar{ position:relative; height:44px; border:1px solid rgba(0,255,136,.25); border-radius:12px;
background:linear-gradient(180deg, rgba(0,20,8,.3), rgba(0,0,0,.55)); }
.dot{ position:absolute; top:6px; width:24px; height:24px; border-radius:999px;
border:1px solid rgba(0,255,136,.45);
background:radial-gradient(circle at 40% 40%, rgba(0,255,136,.35), rgba(0,0,0,.8) 70%);
box-shadow: 0 0 14px rgba(0,255,136,.35), inset 0 0 14px rgba(0,255,136,.18); }
`}</style>
</>
);
}

function ReactionTest(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const [phase, setPhase] = useState<"wait" | "green" | "done">("wait");
const [msg, setMsg] = useState("Wait for green…");
const start = useRef(0);
const stakeRef = useRef(0);

useEffect(() => {
const st = onPromptStake(25);
if (!st) { onExit(); return; }
stakeRef.current = st;
const delay = 1000 + Math.random() * 3000;
const id = setTimeout(() => {
setPhase("green");
setMsg("CLICK!");
start.current = performance.now();
}, delay);
return () => clearTimeout(id);
}, [onExit, onPromptStake]);

function click() {
if (phase === "done") return;
if (phase === "wait") {
setPhase("done");
onSettle({ stakeMe: stakeRef.current, opp, result: "lose", note: "False start" });
return;
}
if (phase === "green") {
setPhase("done");
const ms = performance.now() - start.current;
const them = 180 + Math.random() * 180;
const res: Result = ms < them ? "win" : ms > them ? "lose" : "draw";
onSettle({ stakeMe: stakeRef.current, opp, result: res, note: `You ${Math.round(ms)}ms vs Opp ${Math.round(them)}ms` });
}
}

return (
<>
<HeaderBar title={`Reaction Test vs ${opp.alias}`} onExit={onExit} />
<button className="board" onClick={click}>{msg}</button>
<StyleRow />
<style jsx>{`
.board{
width:100%; padding:24px 10px; border-radius:12px;
border:1px solid rgba(0,255,136,.35);
background:linear-gradient(180deg, rgba(0,255,136,.10), rgba(0,0,0,.35));
font-weight:900; font-size:18px; color:#a9ffd1;
}
`}</style>
</>
);
}

function TypeRace(props: CommonProps) {
const { opp, onExit, onPromptStake, onSettle } = props;
const phrase = useMemo(() => randChoice([
"felena runs on proof",
"burn and earn forever",
"operators move in silence",
"neon grids never sleep",
]), []);
const [val, setVal] = useState("");
const start = useRef(0);
const stakeRef = useRef(0);

function startRun() {
const st = onPromptStake(45);
if (!st) return;
stakeRef.current = st;
setVal("");
start.current = performance.now();
}

function finish() {
if (!stakeRef.current) return;
const ms = performance.now() - start.current;
const errors = diffChars(val, phrase);
const score = ms + errors * 200; // mistakes penalize
const oppScore = (2200 + Math.random() * 1500);
const result: Result = score < oppScore ? "win" : score > oppScore ? "lose" : "draw";
onSettle({
stakeMe: stakeRef.current,
opp,
result,
note: `Your score ${Math.round(score)} vs Opp ${Math.round(oppScore)} (lower better)`,
});
}

return (
<>
<HeaderBar title={`Type Race vs ${opp.alias}`} onExit={onExit} />
<p className={styles.tag}>Type this exactly, fast: “{phrase}”</p>
<div className="row">
<button className="pill" onClick={startRun}>Stake & Start</button>
<button className="pill" onClick={finish}>Finish</button>
</div>
<textarea
rows={3}
placeholder="Start when ready..."
value={val}
onChange={(e) => setVal(e.target.value)}
className="ta"
/>
<StyleRow />
<style jsx>{`
.ta{
width:100%; margin-top:8px;
padding:10px 12px; border-radius:10px;
border:1px solid rgba(0,255,136,.25);
background:rgba(0,20,8,.35); color:#eaffe9;
box-shadow: inset 0 0 14px rgba(0,255,136,.08);
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace;
}
`}</style>
</>
);
}

// ————————————————————————————————————————————————————————
// Shared bits
// ————————————————————————————————————————————————————————
type CommonProps = {
opp: { alias: string; rating: number };
rating: number;
onExit: () => void;
onPromptStake: (d?: number) => number;
onSettle: (opts: {
stakeMe: number;
stakeOpp?: number;
opp: { alias: string; rating: number };
result: Result;
note: string;
}) => void;
};

function StyleRow() {
return (
<style jsx>{`
.row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:8px; }
.pill{
border:1px solid rgba(0,255,136,.45);
border-radius:10px; padding:8px 12px;
background:linear-gradient(180deg, rgba(0,255,136,.12), rgba(0,0,0,.32));
color:#eaffe9; font-weight:900;
}
`}</style>
);
}

function Meters({ me, them, max }: { me: number; them: number; max: number }) {
return (
<div style={{ display: "grid", gap: 8 }}>
<Bar label="You" val={me} max={max} />
<Bar label="Opp" val={them} max={max} />
</div>
);
}
function Bar({ label, val, max }: { label: string; val: number; max: number }) {
return (
<div>
<p className={styles.tag} style={{ margin: "6px 0 4px" }}>{label}: {val}/{max}</p>
<div className="meter"><span style={{ width: `${(val / max) * 100}%` }} /></div>
<style jsx>{`
.meter{ position:relative; height:10px; border-radius:999px;
background: rgba(0,255,136,.08); border:1px solid rgba(0,255,136,.25);
box-shadow: inset 0 0 10px rgba(0,255,136,.08); }
.meter span{ display:block; height:100%; border-radius:999px;
background: linear-gradient(90deg, rgba(0,255,136,.45), rgba(0,255,136,.15));
box-shadow: 0 0 12px rgba(0,255,136,.25); transition: width .2s ease; }
`}</style>
</div>
);
}

// TicTacToe winner check
function checkT3(b: string[]) {
const lines = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6],
];
for (const [a,b1,c] of lines) {
if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
}
if (!b.includes("")) return ""; // draw sentinel
return null;
}

// crude diff: count mismatched characters
function diffChars(a: string, b: string) {
const len = Math.max(a.length, b.length);
let miss = 0;
for (let i = 0; i < len; i++) if ((a[i] || "") !== (b[i] || "")) miss++;
return miss;
}