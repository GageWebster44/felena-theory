// src/pages/keycard/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/** Display rule everywhere in app */
const USD_PER_XP = 1;

/* ──────────────────────────────────────────────────────────────────────────────
Tiny pseudo-QR (not spec accurate — just a crisp in-app code look)
────────────────────────────────────────────────────────────────────────────── */
function hash32(str: string) {
let h = 2166136261 >>> 0;
for (let i = 0; i < str.length; i++) {
h ^= str.charCodeAt(i);
h = Math.imul(h, 16777619);
}
return h >>> 0;
}
function buildGridBits(data: string, size = 25) {
const bits: number[] = [];
let seed = hash32(data);
for (let i = 0; i < size * size; i++) {
seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
bits.push(seed & 1);
}
// three finder-ish corners for aesthetics
const punch = (cx: number, cy: number) => {
for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
const ix = cx + x, iy = cy + y;
if (ix < 0 || iy < 0 || ix >= size || iy >= size) continue;
const r = Math.max(Math.abs(x), Math.abs(y));
bits[iy * size + ix] = r === 2 || r === 0 ? 1 : 0;
}
};
punch(2, 2); punch(size - 3, 2); punch(2, size - 3);
return { bits, size };
}

/* ──────────────────────────────────────────────────────────────────────────────
QR-Uplink: make a 20-code drop (Keycard↔Keycard fuel)
────────────────────────────────────────────────────────────────────────────── */
function makeDrop(alias: string, salt = Date.now()) {
const out: string[] = [];
const base = `${alias}:${salt}`;
for (let i = 0; i < 20; i++) {
const h = hash32(`${base}:${i}`).toString(36).toUpperCase().padStart(8, "0");
// FEL-XXXX-XXXX look
out.push(`FEL-${h.slice(0, 4)}-${h.slice(4, 8)}`);
}
return out;
}

export default function KeycardPage() {
// Identity (persisted)
const [alias, setAlias] = useState<string>("Operator");
const [aliasPublic, setAliasPublic] = useState<boolean>(false); // reveal toggle
const [xp, setXp] = useState<number>(1250);
const [rank, setRank] = useState<number>(742);
const [missions, setMissions] = useState<number>(18);

// Load persisted
useEffect(() => {
if (typeof window === "undefined") return;
const a = localStorage.getItem("op_alias");
const p = localStorage.getItem("op_public");
const x = localStorage.getItem("op_xp");
const r = localStorage.getItem("op_rank");
const m = localStorage.getItem("op_missions");
if (a) setAlias(a);
if (p) setAliasPublic(p === "1");
if (x) setXp(Number(x));
if (r) setRank(Number(r));
if (m) setMissions(Number(m));
}, []);

// Persist on changes that users trigger
useEffect(() => {
if (typeof window === "undefined") return;
localStorage.setItem("op_alias", alias);
}, [alias]);
useEffect(() => {
if (typeof window === "undefined") return;
localStorage.setItem("op_public", aliasPublic ? "1" : "0");
}, [aliasPublic]);

// Tiering
const tier = useMemo(() => {
if (xp >= 5000) return "Titan";
if (xp >= 2500) return "Elite";
if (xp >= 1000) return "Pro";
if (xp >= 250) return "Associate";
return "Rookie";
}, [xp]);

// Operator extension (our P2P handle for PhoneBooth)
const operatorExt = useMemo(() => {
// keep in 700-799 for PhoneBooth router
return 700 + (hash32(alias.toLowerCase()) % 100);
}, [alias]);

// Referral link (invite)
const referralCode = useMemo(() => {
const h = hash32(alias.toLowerCase()).toString(16).slice(0, 6).toUpperCase();
return `FEL-${h}`;
}, [alias]);
const referralUrl = useMemo(() => {
if (typeof window !== "undefined") {
return `${window.location.origin}/join?ref=${encodeURIComponent(referralCode)}`;
}
return `/join?ref=${encodeURIComponent(referralCode)}`;
}, [referralCode]);

// Pseudo-QR on a 15s cadence (rotating session token)
const canvasRef = useRef<HTMLCanvasElement | null>(null);
const [qrVersion, setQrVersion] = useState(0);
useEffect(() => {
const id = setInterval(() => setQrVersion((v) => v + 1), 15000);
return () => clearInterval(id);
}, []);
useEffect(() => {
const c = canvasRef.current;
if (!c) return;
const ctx = c.getContext("2d");
if (!ctx) return;
const payload = `${referralUrl}#v=${qrVersion}`;
const { bits, size } = buildGridBits(payload, 25);
const pad = 12;
const dim = c.width;
ctx.clearRect(0, 0, dim, dim);
ctx.fillStyle = "rgba(0,0,0,0.85)";
ctx.fillRect(0, 0, dim, dim);
const cell = (dim - pad * 2) / size;
for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
if (bits[y * size + x] !== 1) continue;
ctx.fillStyle = "rgba(0,255,136,0.95)";
ctx.shadowColor = "rgba(0,255,136,0.35)";
ctx.shadowBlur = 6;
const rx = pad + x * cell;
const ry = pad + y * cell;
const r = Math.max(2, cell * 0.18);
ctx.beginPath();
ctx.moveTo(rx + r, ry);
ctx.arcTo(rx + cell, ry, rx + cell, ry + cell, r);
ctx.arcTo(rx + cell, ry + cell, rx, ry + cell, r);
ctx.arcTo(rx, ry + cell, rx, ry, r);
ctx.arcTo(rx, ry, rx + cell, ry, r);
ctx.closePath();
ctx.fill();
}
}, [referralUrl, qrVersion]);

// QR-Uplink drop
const [drop, setDrop] = useState<string[]>(() => makeDrop("Operator"));
useEffect(() => {
setDrop(makeDrop(alias));
}, [alias]);

// Helpers
function editAlias() {
const next = window.prompt("Set your codename (alias):", alias);
if (!next) return;
setAlias(next);
}
function copy(text: string, note = "Copied.") {
if (navigator?.clipboard) {
navigator.clipboard.writeText(text);
alert(note);
}
}

const maskedAlias = useMemo(() => {
if (aliasPublic) return alias;
// mask everything but first letter
const first = alias.slice(0, 1) || "A";
return `${first}${"•".repeat(Math.max(3, Math.min(8, alias.length - 1)))}`;
}, [alias, aliasPublic]);

return (
<div className={styles.page}>
<Head>
<title>Keycard — Felena Theory</title>
<meta
name="description"
content="Your futuristic digital debit card / player profile. Alias control, QR-Uplink sharing, badges, and Operator extension for P2P XP."
/>
</Head>

<main className={styles.wrap}>
{/* HERO */}
<section className={styles.hero}>
<h1 className={styles.title}>Keycard</h1>
<p className={styles.sub}>
Your gamified agent profile. Toggle anonymity, share via QR-Uplink, and move XP like a pro.
</p>
<div className={styles.ctaRow}>
<button className={styles.btn} onClick={editAlias}>Set Codename</button>
<button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setAliasPublic((v) => !v)}>
{aliasPublic ? "Hide Alias" : "Reveal Alias"}
</button>
<Link className={`${styles.btn} ${styles.btnGhost}`} href="/phonebooth">Deposit / Withdraw</Link>
</div>
</section>

{/* AGENT CONSOLE */}
<section
className={styles.grid}
style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}
>
{/* Card: Futuristic Keycard itself */}
<article className={styles.card} style={{ position: "relative", overflow: "hidden" }}>
<div className="cardGlow" aria-hidden="true" />
<header className="kHeader">
<div className="avatarRing" aria-hidden="true">
<span>{(alias[0] || "O").toUpperCase()}</span>
</div>
<div>
<h3 style={{ margin: 0 }}>{maskedAlias}</h3>
<p className={styles.tag} style={{ margin: 0 }}>
{aliasPublic ? "Alias public" : "Alias hidden"} • Tier {tier}
</p>
</div>
<button className="stealth" onClick={() => setAliasPublic((v) => !v)}>
{aliasPublic ? "Stealth ON" : "Stealth OFF"}
</button>
</header>

<div className="divider" />

<div className="stats">
<div className="stat">
<p className={styles.tag}>XP Balance</p>
<div className={`statNum ${!aliasPublic ? "blur" : ""}`}>
{xp.toLocaleString()} XP
</div>
<p className={styles.tag} style={{ marginTop: 4 }}>
${ (xp * USD_PER_XP).toLocaleString() } equivalent
</p>
</div>
<div className="stat">
<p className={styles.tag}>Global Rank</p>
<div className="statNum">#{rank}</div>
<p className={styles.tag} style={{ marginTop: 4 }}>{missions} missions complete</p>
</div>
<div className="stat">
<p className={styles.tag}>Operator Ext.</p>
<div className="statNum">#{operatorExt}</div>
<button
className={styles.cardCta}
onClick={() => copy(String(operatorExt), "Operator extension copied.")}
style={{ marginTop: 6 }}
>
Copy Ext
</button>
</div>
</div>

<div className="divider" />

{/* QR + Referral */}
<section>
<h3 style={{ margin: "0 0 6px" }}>QR-Uplink</h3>
<p className={styles.tag} style={{ margin: 0 }}>
Scan or share to fuel this Keycard. Rotates every ~15s.
</p>
<div className="qrRow">
<canvas ref={canvasRef} width={200} height={200} className="qrCanvas" aria-label="Keycard code" />
<div>
<p className={styles.tag} style={{ margin: 0 }}>Invite Link</p>
<code className="code">{referralUrl}</code>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
<button className={styles.cardCta} onClick={() => copy(referralUrl, "Invite link copied.")}>
Copy Link
</button>
<button
className={styles.cardCta}
onClick={() => setQrVersion((v) => v + 1)}
title="Force refresh"
>
Refresh Code
</button>
</div>
<p className={styles.tag} style={{ marginTop: 8 }}>
New Operators via your link create XP bounties after verification.
</p>
</div>
</div>
</section>
</article>

{/* Card: QR-Uplink Drop (20 codes) */}
<article className={styles.card}>
<h3>QR-Uplink Drop (20)</h3>
<p className={styles.tag} style={{ marginTop: -2 }}>
Share any single code. First verifiers route XP to this Keycard.
</p>
<ol className="dropList">
{drop.map((code) => (
<li key={code}>
<code className="code small">{code}</code>
</li>
))}
</ol>
<div className={styles.ctaRow}>
<button
className={styles.cardCta}
onClick={() => {
copy(drop.join("\n"), "All 20 codes copied.");
}}
>
Copy All
</button>
<button className={styles.cardCta} onClick={() => setDrop(makeDrop(alias))}>
Regenerate Drop
</button>
<Link className={styles.cardCta} href="/arena">
Use in Events →
</Link>
</div>
</article>

{/* Card: Badges */}
<article className={styles.card}>
<h3>Badges</h3>
<p className={styles.tag} style={{ marginTop: 2 }}>Milestones you’ve unlocked</p>
<div className="badges">
{[
{ name: "Foundry", tip: "First 1,000 XP" },
{ name: "Arena Rookie", tip: "Win your first duel" },
{ name: "Arcade High Roller", tip: "Stake 500+ XP in one session" },
{ name: "Teacher", tip: "Complete 3 Learn tracks" },
{ name: "Uplink", tip: "Launch a QR chain with 20 scans" },
{ name: "Philanthropist", tip: "Issue 5 directed gift cards" },
].map((b) => (
<div key={b.name} className="badge" title={b.tip}>
<span className="badgeGlow" aria-hidden="true" />
<span>{b.name}</span>
</div>
))}
</div>

<div className={styles.ctaRow}>
<Link href="/casino" className={styles.cardCta}>Casino →</Link>
<Link href="/arcade" className={styles.cardCta}>Arcade →</Link>
<Link href="/learn" className={styles.cardCta}>Learn Tracks →</Link>
<Link href="/phonebooth" className={styles.cardCta}>P2P via PhoneBooth →</Link>
</div>
</article>
</section>

{/* Footer */}
<footer className={styles.footer}>
<span>Guard your alias. You control when it’s public. Never share private credentials.</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/" className={styles.cardCta}>← Home</Link>
<Link href="/terms" className={styles.cardCta}>Terms & Disclosures</Link>
</div>
</footer>
</main>

{/* Local look/feel for Keycard */}
<style jsx>{`
.kHeader{
display:flex; align-items:center; gap:12px;
}
.stealth{
margin-left:auto; border:1px solid rgba(0,255,136,.35);
background: linear-gradient(180deg, rgba(0,255,136,.12), rgba(0,0,0,.35));
color:#eaffe9; padding:6px 10px; border-radius:10px; font-weight:800;
box-shadow: inset 0 0 12px rgba(0,255,136,.10);
}
.avatarRing{
width:46px;height:46px;border-radius:999px;
display:grid;place-items:center;
border:1px solid rgba(0,255,136,.45);
background:radial-gradient(circle at 30% 30%, rgba(0,255,136,.2), rgba(0,0,0,.7) 70%);
box-shadow: inset 0 0 18px rgba(0,255,136,.18), 0 0 16px rgba(0,255,136,.28);
color:#eaffe9;font-weight:800;text-shadow:0 0 10px rgba(0,255,136,.45);
}
.divider{
height:1px;margin:10px 0;
background:linear-gradient(90deg, rgba(0,255,136,0), rgba(0,255,136,.25), rgba(0,255,136,0));
}
.stats{
display:grid;gap:12px;grid-template-columns:repeat(3,minmax(0,1fr));
}
@media (max-width:760px){ .stats{ grid-template-columns:1fr; } }
.stat .statNum{
font-size:22px;font-weight:800;color:#a9ffd1;
text-shadow:0 0 10px rgba(0,255,136,.35);
}
.blur{ filter: blur(4px); }

.qrRow{ display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-top:6px; }
.qrCanvas{
border-radius:12px;border:1px solid rgba(0,255,136,.28);
box-shadow: 0 0 18px rgba(0,255,136,.22), inset 0 0 16px rgba(0,255,136,.12);
background:#000;
}
.code{
display:inline-block; padding:8px 10px; border-radius:10px;
border:1px solid rgba(0,255,136,.25);
background:rgba(0,20,8,.35); color:#eaffe9;
box-shadow: inset 0 0 14px rgba(0,255,136,.08);
max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.code.small{ font-size:12px; padding:6px 8px; }

.dropList{
display:grid; grid-template-columns:repeat(auto-fit, minmax(160px,1fr));
gap:8px; margin:10px 0 0; padding-left:18px;
}

.badges{
display:grid; gap:10px; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));
margin-top:10px;
}
.badge{
position:relative;padding:10px 12px;border-radius:10px;
border:1px solid rgba(0,255,136,.22);
background:linear-gradient(180deg, rgba(0,20,8,.35), rgba(0,0,0,.55));
box-shadow: inset 0 0 18px rgba(0,255,136,.08);
font-weight:700;color:#bdeed2;
}
.badgeGlow{
position:absolute; inset:-2px; border-radius:12px; pointer-events:none;
background:radial-gradient(200px 80px at 10% 0%, rgba(0,255,136,.08), transparent 60%);
}

.cardGlow{
position:absolute; inset:-2px; border-radius:16px;
pointer-events:none;
background:
radial-gradient(300px 140px at 10% 0%, rgba(0,255,136,.06), transparent 60%),
radial-gradient(300px 140px at 90% 100%, rgba(0,255,136,.06), transparent 60%);
}
`}</style>
</div>
);
}