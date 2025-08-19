// src/pages/engine-grid/index.tsx
import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/**
* Engine model
*/
type Engine = {
slug: string;
name: string;
summary: string;
category:
| "Trend Following"
| "Mean Reversion"
| "Volatility"
| "Options Overlay"
| "Market Neutral"
| "Macro / Rates"
| "Event Driven"
| "Crypto"
| "AI / ML";
markets: string[]; // e.g. ["US Equities","Futures","FX"]
factors: string[]; // e.g. ["momentum","carry","value"]
horizon: "Intraday" | "Swing" | "Position";
risk: 1 | 2 | 3 | 4 | 5; // 1=low, 5=high
roiTarget: number; // yearly target % (illustrative)
minStakeXP: number; // XP = USD 1:1
};

/**
* Demo inventory — illustrative shells you can wire to Alpaca or any broker later.
* All numbers are placeholders for UI only.
*/
const ENGINES: Engine[] = [
{
slug: "helix-trend",
name: "Helix Trend",
summary: "Multi-asset momentum with dynamic position sizing.",
category: "Trend Following",
markets: ["US Equities", "Futures", "ETF"],
factors: ["momentum", "breakout", "risk-parity"],
horizon: "Position",
risk: 3,
roiTarget: 18,
minStakeXP: 250,
},
{
slug: "quark-meanrev",
name: "Quark MeanRev",
summary: "Mean-reversion on liquid large-caps with volatility filter.",
category: "Mean Reversion",
markets: ["US Equities"],
factors: ["zscore", "liquidity", "volatility"],
horizon: "Swing",
risk: 2,
roiTarget: 12,
minStakeXP: 150,
},
{
slug: "gamma-surge",
name: "Gamma Surge",
summary: "Options gamma scalping overlay on index ETFs.",
category: "Options Overlay",
markets: ["Options", "ETF"],
factors: ["gamma", "theta", "skew"],
horizon: "Intraday",
risk: 4,
roiTarget: 25,
minStakeXP: 400,
},
{
slug: "delta-harvest",
name: "Delta Harvest",
summary: "Systematic covered-calls + cash-secured puts wheel.",
category: "Options Overlay",
markets: ["Options", "US Equities"],
factors: ["income", "theta", "diversification"],
horizon: "Position",
risk: 2,
roiTarget: 10,
minStakeXP: 200,
},
{
slug: "ionic-vol-arb",
name: "Ionic Vol-Arb",
summary: "Long/short volatility regime switching with hedges.",
category: "Volatility",
markets: ["Options"],
factors: ["vol-regime", "term-structure"],
horizon: "Swing",
risk: 5,
roiTarget: 30,
minStakeXP: 500,
},
{
slug: "equilong-neutral",
name: "EquiLong Neutral",
summary: "Dollar-neutral long/short factor spread (value + quality).",
category: "Market Neutral",
markets: ["US Equities"],
factors: ["value", "quality", "beta-neutral"],
horizon: "Position",
risk: 2,
roiTarget: 11,
minStakeXP: 300,
},
{
slug: "carry-fx",
name: "Carry FX",
summary: "FX carry with drawdown throttle and macro filters.",
category: "Macro / Rates",
markets: ["FX"],
factors: ["carry", "rate-differential", "drawdown-control"],
horizon: "Position",
risk: 3,
roiTarget: 14,
minStakeXP: 250,
},
{
slug: "basis-futures",
name: "Basis Futures",
summary: "Calendar-spread basis trades on liquid futures curves.",
category: "Macro / Rates",
markets: ["Futures"],
factors: ["term-structure", "carry"],
horizon: "Swing",
risk: 3,
roiTarget: 16,
minStakeXP: 350,
},
{
slug: "earnings-pop",
name: "Earnings Pop",
summary: "Event-driven straddles and delta-adjusted follow-through.",
category: "Event Driven",
markets: ["Options", "US Equities"],
factors: ["earnings", "vol-crush"],
horizon: "Intraday",
risk: 5,
roiTarget: 35,
minStakeXP: 500,
},
{
slug: "merger-spread",
name: "Merger Spread",
summary: "Simple risk-arb: announced deals with probability model.",
category: "Event Driven",
markets: ["US Equities"],
factors: ["deal-probability", "downside-hedge"],
horizon: "Position",
risk: 2,
roiTarget: 9,
minStakeXP: 400,
},
{
slug: "grid-crypto",
name: "Grid Crypto",
summary: "Grid trading on majors with volatility bands.",
category: "Crypto",
markets: ["Crypto"],
factors: ["grid", "volatility-bands"],
horizon: "Intraday",
risk: 4,
roiTarget: 28,
minStakeXP: 200,
},
{
slug: "trend-crypto",
name: "Trend Crypto",
summary: "EMA crossovers with risk-on/off stablecoin shifts.",
category: "Crypto",
markets: ["Crypto"],
factors: ["momentum", "allocation"],
horizon: "Swing",
risk: 4,
roiTarget: 24,
minStakeXP: 150,
},
{
slug: "alpha-mix-ml",
name: "AlphaMix ML",
summary: "Gradient-boosted classifier on factor features.",
category: "AI / ML",
markets: ["US Equities"],
factors: ["ml", "ensemble", "probability"],
horizon: "Swing",
risk: 3,
roiTarget: 20,
minStakeXP: 450,
},
{
slug: "neuron-net",
name: "Neuron Net",
summary: "Neural momentum with regime embedding + stop bands.",
category: "AI / ML",
markets: ["ETF", "US Equities"],
factors: ["neural", "regime", "momentum"],
horizon: "Position",
risk: 4,
roiTarget: 22,
minStakeXP: 500,
},
{
slug: "micro-meanrev",
name: "Micro MeanRev",
summary: "Intraday microstructure reversion on top names.",
category: "Mean Reversion",
markets: ["US Equities"],
factors: ["microstructure", "spread", "reversion"],
horizon: "Intraday",
risk: 3,
roiTarget: 17,
minStakeXP: 300,
},
{
slug: "sector-rotator",
name: "Sector Rotator",
summary: "Monthly sector momentum with drawdown caps.",
category: "Trend Following",
markets: ["ETF"],
factors: ["momentum", "drawdown-cap"],
horizon: "Position",
risk: 2,
roiTarget: 12,
minStakeXP: 120,
},
{
slug: "bond-carry",
name: "Bond Carry",
summary: "Rates momentum & carry tilt across duration buckets.",
category: "Macro / Rates",
markets: ["ETF", "Futures"],
factors: ["carry", "momentum", "duration"],
horizon: "Position",
risk: 1,
roiTarget: 7,
minStakeXP: 100,
},
{
slug: "pairs-ls",
name: "Pairs L/S",
summary: "Cointegrated pairs with rolling beta hedge.",
category: "Market Neutral",
markets: ["US Equities"],
factors: ["cointegration", "beta-hedge"],
horizon: "Swing",
risk: 2,
roiTarget: 10,
minStakeXP: 180,
},
{
slug: "shock-guard",
name: "Shock Guard",
summary: "Tail-risk overlay using VIX options and flight-to-quality.",
category: "Volatility",
markets: ["Options", "ETF"],
factors: ["tail-hedge", "vol-spike"],
horizon: "Position",
risk: 2,
roiTarget: 8,
minStakeXP: 220,
},
{
slug: "stat-arb-lite",
name: "StatArb Lite",
summary: "Simple multi-factor long/short with capacity limits.",
category: "Market Neutral",
markets: ["US Equities"],
factors: ["value", "quality", "low-vol"],
horizon: "Swing",
risk: 3,
roiTarget: 15,
minStakeXP: 350,
},
];

/**
* Small pill helpers
*/
function Pill({ children }: { children: React.ReactNode }) {
return (
<span
style={{
display: "inline-block",
border: "1px solid rgba(0,255,136,.35)",
borderRadius: 999,
padding: "2px 8px",
fontSize: 12,
marginRight: 6,
marginBottom: 6,
color: "#d9ffe0",
boxShadow: "inset 0 0 10px rgba(0,255,136,.08)",
}}
>
{children}
</span>
);
}

/**
* Risk -> label mapping
*/
const RISK_LABEL = ["—", "Low", "Low–Med", "Medium", "Med–High", "High"] as const;

/**
* Page
*/
export default function EngineGridPage() {
// Controls
const [query, setQuery] = useState("");
const [category, setCategory] = useState<Engine["category"] | "All">("All");
const [maxRisk, setMaxRisk] = useState<number>(5);
const [minROI, setMinROI] = useState<number>(0);
const [horizon, setHorizon] = useState<Engine["horizon"] | "All">("All");

const categories: (Engine["category"] | "All")[] = useMemo(
() => ["All", ...Array.from(new Set(ENGINES.map((e) => e.category)))],
[]
);

const filtered = useMemo(() => {
return ENGINES.filter((e) => {
if (category !== "All" && e.category !== category) return false;
if (horizon !== "All" && e.horizon !== horizon) return false;
if (e.risk > maxRisk) return false;
if (e.roiTarget < minROI) return false;
if (query.trim()) {
const q = query.toLowerCase();
const hay =
`${e.name} ${e.summary} ${e.category} ${e.markets.join(" ")} ${e.factors.join(" ")}`.toLowerCase();
if (!hay.includes(q)) return false;
}
return true;
});
}, [category, horizon, maxRisk, minROI, query]);

return (
<div className={styles.page}>
<Head>
<title>Algorithm Engine Rentals — Felena Theory</title>
<meta
name="description"
content="Browse autonomous engines by factors, risk, and ROI targets. Stake XP and track performance."
/>
</Head>

<main className={styles.wrap}>
<header className={styles.hero}>
<h1 className={styles.title}>Algorithm Engine Rentals</h1>
<p className={styles.sub}>
Pick a strategy, stake XP (1 XP = $1), and route trades via a broker partner (e.g., Alpaca). UI below is
a shell for wiring to real signals and allocations.
</p>
</header>

{/* Controls Panel */}
<section
className={styles.card}
style={{ marginBottom: 14, textAlign: "left", position: "relative", overflow: "hidden" }}
>
<h3 style={{ marginTop: 0 }}>Filter Engines</h3>
<div
style={{
display: "grid",
gap: 10,
gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
alignItems: "end",
}}
>
<div>
<label className={styles.tag}>Search</label>
<input
value={query}
onChange={(e) => setQuery(e.target.value)}
placeholder="Momentum, options, crypto…"
style={inputStyle}
/>
</div>

<div>
<label className={styles.tag}>Category</label>
<select
value={category}
onChange={(e) => setCategory(e.target.value as any)}
style={inputStyle}
>
{categories.map((c) => (
<option key={c} value={c}>
{c}
</option>
))}
</select>
</div>

<div>
<label className={styles.tag}>Horizon</label>
<select
value={horizon}
onChange={(e) => setHorizon(e.target.value as any)}
style={inputStyle}
>
{["All", "Intraday", "Swing", "Position"].map((h) => (
<option key={h} value={h}>
{h}
</option>
))}
</select>
</div>

<div>
<label className={styles.tag}>Max Risk: {maxRisk} ({RISK_LABEL[maxRisk]})</label>
<input
type="range"
min={1}
max={5}
value={maxRisk}
onChange={(e) => setMaxRisk(Number(e.target.value))}
style={{ width: "100%" }}
/>
</div>

<div>
<label className={styles.tag}>Min ROI Target: {minROI}%</label>
<input
type="range"
min={0}
max={35}
step={1}
value={minROI}
onChange={(e) => setMinROI(Number(e.target.value))}
style={{ width: "100%" }}
/>
</div>
</div>
</section>

{/* Engine Grid */}
<section className={styles.grid}>
{filtered.map((e) => (
<article key={e.slug} className={styles.card} style={{ textAlign: "left" }}>
<header style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
<h3 style={{ marginTop: 0 }}>{e.name}</h3>
<span
title={`Risk ${e.risk} (${RISK_LABEL[e.risk]})`}
style={{
alignSelf: "start",
fontSize: 12,
border: "1px solid rgba(0,255,136,.35)",
borderRadius: 8,
padding: "2px 8px",
boxShadow: "inset 0 0 10px rgba(0,255,136,.08)",
}}
>
Risk {e.risk}
</span>
</header>

<p style={{ marginTop: 4 }}>{e.summary}</p>

<div style={{ marginTop: 8 }}>
{e.markets.map((m) => (
<Pill key={m}>{m}</Pill>
))}
</div>
<div style={{ marginTop: 6 }}>
{e.factors.map((f) => (
<Pill key={f}>{f}</Pill>
))}
</div>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0,1fr))",
gap: 8,
marginTop: 10,
}}
>
<InfoBox label="Horizon" value={e.horizon} />
<InfoBox label="ROI Target" value={`${e.roiTarget}%/yr`} />
<InfoBox label="Min Stake" value={`${e.minStakeXP.toLocaleString()} XP`} />
</div>

<div className={styles.ctaRow} style={{ justifyContent: "flex-start", marginTop: 12 }}>
<Link href={`/engine-grid/${e.slug}`} className={styles.cardCta}>
View Details →
</Link>
<button
className={styles.cardCta}
onClick={() => alert(`(Stub) Starting allocation to ${e.name}…`)}
>
Start with {e.minStakeXP} XP
</button>
<button
className={styles.cardCta}
onClick={() =>
alert(
`(Stub) Backtest ${e.name}\nCategory: ${e.category}\nROI target: ${e.roiTarget}%\nRisk: ${e.risk}`
)
}
>
Backtest →
</button>
</div>
</article>
))}
</section>

{/* Empty state */}
{filtered.length === 0 && (
<p className={styles.tag} style={{ textAlign: "center", marginTop: 16 }}>
No engines match your filters. Try widening the risk/ROI sliders or clearing search.
</p>
)}

{/* Footer */}
<footer className={styles.footer}>
<span>Route execution through a supported brokerage API (e.g., Alpaca). Simulated metrics shown for UI.</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/" className={styles.cardCta}>
← Home
</Link>
<Link href="/terms" className={styles.cardCta}>
Terms & Disclosures
</Link>
</div>
</footer>
</main>
</div>
);
}

/** Small info cell used in engine cards */
function InfoBox({ label, value }: { label: string; value: string }) {
return (
<div
style={{
border: "1px solid rgba(0,255,136,.28)",
borderRadius: 10,
padding: "8px 10px",
boxShadow: "inset 0 0 12px rgba(0,255,136,.08)",
}}
>
<div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>{label}</div>
<div style={{ fontWeight: 800, color: "#a9ffd1", textShadow: "0 0 10px rgba(0,255,136,.35)" }}>{value}</div>
</div>
);
}

/** Shared input style for search/select */
const inputStyle: React.CSSProperties = {
width: "100%",
padding: "10px 12px",
borderRadius: 10,
border: "1px solid rgba(0,255,136,.28)",
background: "rgba(0,0,0,.45)",
color: "#eaffe9",
boxShadow: "inset 0 0 12px rgba(0,255,136,.08)",
outline: "none",
};