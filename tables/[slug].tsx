// src/pages/casino/tables/[slug].tsx
import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import styles from "@/styles/index.module.css";
import { TABLE_LIST, type TableConfig } from "@/lib/casino/tables";

type Props = {
table?: TableConfig;
};

export default function TableGamePage({ table }: Props) {
// If a slug slips through without a matching config (shouldn't happen with notFound below)
if (!table) {
return (
<div className={styles.page}>
<main className={styles.wrap}>
<header className={styles.hero}>
<h1 className={styles.title}>Table Not Found</h1>
<p className={styles.sub}>This table is not registered. Please return to the Casino.</p>
<div className={styles.ctaRow}>
<Link className={styles.btn} href="/casino">← Back to Casino</Link>
</div>
</header>
</main>
</div>
);
}

// --- Demo stake panel state (stub) -----------------------------------------
const [denom, setDenom] = useState<number>(1); // 1 XP = $1 preview
const [betSize, setBetSize] = useState<number>(5); // default bet
const [lastResult, setLastResult] = useState<string>("—");

const minBet = table.minBet ?? 1;
const maxBet = table.maxBet ?? 500;

const houseEdgePct = useMemo(
() => (table.houseEdge != null ? (table.houseEdge * 100).toFixed(2) + "%" : "—"),
[table.houseEdge]
);

function clampBet(v: number) {
if (Number.isNaN(v)) return minBet;
return Math.min(Math.max(v, minBet), maxBet);
}

function placeBet() {
const bet = clampBet(betSize);
// This is a universal demo stub — your real engine should be server-driven per game rules.
// For now we simulate a generic outcome ticker:
const r = Math.random();
let note = "";
if (r < 0.46) note = `LOSE −${(bet * denom).toLocaleString()} XP`;
else if (r < 0.92) note = `WIN +${(bet * denom).toLocaleString()} XP (even)`;
else note = `BIG WIN +${(bet * 35 * denom).toLocaleString()} XP (example straight-up)`;
setLastResult(note);

// TODO: integrate with wallet:
// - read XP from your global state/localStorage
// - burn on place, credit on win
// - write ledger entry
}

return (
<div className={styles.page}>
<Head>
<title>{table.title} — Felena Theory</title>
<meta
name="description"
content={`${table.title}: ${table.blurb || "Table game"} • House edge ${houseEdgePct}.`}
/>
</Head>

<main className={styles.wrap}>
{/* Header */}
<header className={styles.hero}>
<h1 className={styles.title}>{table.title}</h1>
{table.blurb && <p className={styles.sub}>{table.blurb}</p>}
<div className={styles.ctaRow}>
<Link href="/casino" className={styles.btn}>← Casino</Link>
<Link href="/phonebooth" className={`${styles.btn} ${styles.btnGhost}`}>Manage Balance</Link>
</div>
</header>

{/* Specs + Rules */}
<section className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
<article className={styles.card}>
<h3>Table Specs</h3>
<dl style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 6, columnGap: 10 }}>
<dt className={styles.tag}>House Edge</dt>
<dd>{houseEdgePct}</dd>

<dt className={styles.tag}>Denomination</dt>
<dd>1 XP = $1 (preview)</dd>

<dt className={styles.tag}>Min Bet</dt>
<dd>{minBet} XP</dd>

<dt className={styles.tag}>Max Bet</dt>
<dd>{maxBet} XP</dd>
</dl>
<p className={styles.tag} style={{ marginTop: 8 }}>
Note: Final rules/settlement occur server-side in production.
</p>
</article>

<article className={styles.card}>
<h3>Rules</h3>
{table.rules && table.rules.length > 0 ? (
<ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
{table.rules.map((r, i) => (
<li key={i}>{r}</li>
))}
</ul>
) : (
<p className={styles.tag}>Standard rules apply for this table.</p>
)}
</article>
</section>

{/* Demo Interaction Panel */}
<section style={{ marginTop: 16 }}>
<article className={styles.card}>
<h3>Demo Stake Panel</h3>
<p className={styles.tag} style={{ margin: 0 }}>
This is a universal demo shell. Replace with your specific game UI/logic for {table.title}.
</p>

<div className="stakeRow">
<div>
<label className={styles.tag}>Denomination</label>
<select
value={denom}
onChange={(e) => setDenom(Number(e.target.value))}
className="control"
aria-label="Denomination"
>
<option value={1}>1 XP</option>
<option value={2}>2 XP</option>
<option value={5}>5 XP</option>
<option value={10}>10 XP</option>
</select>
</div>

<div>
<label className={styles.tag}>Bet Size (XP)</label>
<input
className="control"
type="number"
min={minBet}
max={maxBet}
step={1}
value={betSize}
onChange={(e) => setBetSize(clampBet(Number(e.target.value)))}
/>
</div>

<div className={styles.ctaRow} style={{ margin: 0 }}>
<button className={styles.btn} onClick={placeBet}>Place Bet</button>
<button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setLastResult("—")}>
Clear
</button>
</div>
</div>

<div className="lcd">
<span>Last Result:</span>
<strong>{lastResult}</strong>
</div>
</article>
</section>

{/* Footer */}
<footer className={styles.footer}>
<span>House rules and settlement are applied consistently across tables.</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/casino" className={styles.cardCta}>← Casino Control Panel</Link>
<Link href="/phonebooth" className={styles.cardCta}>PhoneBooth</Link>
</div>
</footer>
</main>

{/* Page-local styles for the stake panel */}
<style jsx>{`
.stakeRow {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
gap: 12px;
margin-top: 10px;
}
.control {
width: 100%;
padding: 10px 12px;
border-radius: 10px;
border: 1px solid rgba(0,255,136,.25);
background: rgba(0,20,8,.35);
color: #eaffe9;
box-shadow: inset 0 0 14px rgba(0,255,136,.08);
}
.lcd {
margin-top: 12px;
display: flex;
align-items: center;
justify-content: space-between;
padding: 10px 12px;
border-radius: 10px;
border: 1px solid rgba(0,255,136,.25);
background: radial-gradient(circle at 30% 30%, rgba(0,255,136,.12), rgba(0,0,0,.65) 70%);
box-shadow: inset 0 0 16px rgba(0,255,136,.15);
font-weight: 800;
color: #a9ffd1;
}
`}</style>
</div>
);
}

/* ----------------- SSG ----------------- */

export const getStaticPaths: GetStaticPaths = async () => {
const paths = TABLE_LIST.map((t) => ({ params: { slug: t.slug } }));
return { paths, fallback: false }; // all tables are known at build time
};

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
const slug = String(ctx.params?.slug || "");
const table = TABLE_LIST.find((t) => t.slug === slug);
if (!table) return { notFound: true };
return { props: { table } };
};