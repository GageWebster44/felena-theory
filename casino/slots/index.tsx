// src/pages/casino/slots/index.tsx
import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { SLOT_LIST, type SlotConfig } from "@/lib/casino/registry";
import styles from "@styles/index.module.css"; // reuse your CRT styling

type SortKey = "title" | "payways" | "volatility" | "engine";

const VOL_LABEL: Record<NonNullable<SlotConfig["volatility"]>, string> = {
low: "Low",
med: "Medium",
high: "High",
};

const ENGINE_LABEL: Record<string, string> = {
classicLines: "Classic Lines",
ways243: "243 Ways",
tumbleScatterPays: "Tumble Scatter",
holdAndSpin: "Hold & Spin",
holdAndSpinPlus: "Hold & Spin+",
holdAndSpinLava: "Hold & Spin (Lava)",
hyperWays: "HyperWays",
jackpotLadder: "Jackpot Ladder",
buffaloWays: "Buffalo Ways",
fireLink: "Fire Link",
ways243Stackers: "243 Ways (Stackers)",
dungeonDelver: "Dungeon Delver",
custom: "Custom",
};

const THEME_EMOJI: Record<string, string> = {
nuclear: "☢️",
horror: "🦇",
dungeon: "🗝️",
barnyard: "🐔",
volcano: "🌋",
space: "🚀",
galaxy: "🪐",
cyber: "🧪",
cats: "🐾",
ocean: "🌊",
neon: "💎",
jukebox: "🎵",
superhero: "⚡",
savannah: "🦁",
arctic: "❄️",
time: "⏳",
cantina: "🌮",
farm: "🌽",
hacker: "🖥️",
racer: "🏁",
classic: "⭐",
easy: "🍀",
music: "🎸",
galaxyHyper: "🌌",
};

function badge(text: string) {
return (
<span
style={{
display: "inline-block",
padding: "4px 8px",
borderRadius: 999,
fontSize: 12,
letterSpacing: 0.4,
marginRight: 6,
border: "1px solid rgba(0,255,160,.25)",
background: "rgba(0,255,160,.06)",
}}
>
{text}
</span>
);
}

export default function SlotsIndex() {
const [query, setQuery] = useState("");
const [engineFilter, setEngineFilter] = useState<string>("all");
const [volFilter, setVolFilter] = useState<string>("all");
const [sortKey, setSortKey] = useState<SortKey>("title");
const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

// unique lists for filters
const engines = useMemo(() => {
const s = new Set<string>();
SLOT_LIST.forEach((sl) => sl.engine && s.add(sl.engine));
return ["all", ...Array.from(s).sort()];
}, []);
const vols = ["all", "low", "med", "high"] as const;

const filtered = useMemo(() => {
const q = query.trim().toLowerCase();
const list = SLOT_LIST.filter((s) => {
const matchesQ =
!q ||
s.title.toLowerCase().includes(q) ||
(s.theme?.toLowerCase() || "").includes(q) ||
(s.slug?.toLowerCase() || "").includes(q);
const matchesEngine = engineFilter === "all" || s.engine === engineFilter;
const matchesVol = volFilter === "all" || s.volatility === (volFilter as any);
return matchesQ && matchesEngine && matchesVol;
});
const sorted = [...list].sort((a, b) => {
const dir = sortDir === "asc" ? 1 : -1;
switch (sortKey) {
case "title":
return a.title.localeCompare(b.title) * dir;
case "payways":
return ((a.payways || 0) - (b.payways || 0)) * dir;
case "volatility": {
const order = { low: 0, med: 1, high: 2 } as any;
return ((order[a.volatility] ?? 99) - (order[b.volatility] ?? 99)) * dir;
}
case "engine":
return (a.engine || "").localeCompare(b.engine || "") * dir;
default:
return 0;
}
});
return sorted;
}, [query, engineFilter, volFilter, sortKey, sortDir]);

return (
<>
<Head>
<title>Slots — Felena Theory</title>
<meta
name="description"
content="Browse all Felena Theory slot machines — tumble, ways, hold & spin, and more, with CRT cinematic skins."
/>
</Head>

<main className={styles.screen}>
<div className={styles.nav}>
<Link href="/casino">← Back to Casino</Link>
</div>

<header style={{ marginBottom: 16 }}>
<h1 style={{ margin: 0, letterSpacing: 1 }}>Slot Machines</h1>
<p className={styles.tag} style={{ marginTop: 6 }}>
{SLOT_LIST.length} total • {filtered.length} shown
</p>
</header>

{/* Controls */}
<section
className={styles.card}
style={{
display: "grid",
gap: 12,
alignItems: "center",
}}
>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
<div>
<label className={styles.tag}>Search</label>
<input
value={query}
onChange={(e) => setQuery(e.target.value)}
placeholder="title, theme, slug…"
style={{
width: "100%",
padding: "10px 12px",
borderRadius: 10,
border: "1px solid rgba(0,255,160,.25)",
background: "rgba(0,20,12,.4)",
color: "#caffe4",
}}
/>
</div>

<div>
<label className={styles.tag}>Engine</label>
<select
value={engineFilter}
onChange={(e) => setEngineFilter(e.target.value)}
style={{
width: "100%",
padding: "10px 12px",
borderRadius: 10,
border: "1px solid rgba(0,255,160,.25)",
background: "rgba(0,20,12,.4)",
color: "#caffe4",
}}
>
{engines.map((e) => (
<option key={e} value={e}>
{e === "all" ? "All engines" : ENGINE_LABEL[e] || e}
</option>
))}
</select>
</div>

<div>
<label className={styles.tag}>Volatility</label>
<select
value={volFilter}
onChange={(e) => setVolFilter(e.target.value)}
style={{
width: "100%",
padding: "10px 12px",
borderRadius: 10,
border: "1px solid rgba(0,255,160,.25)",
background: "rgba(0,20,12,.4)",
color: "#caffe4",
}}
>
{vols.map((v) => (
<option key={v} value={v}>
{v === "all" ? "All volatility" : VOL_LABEL[v as "low" | "med" | "high"]}
</option>
))}
</select>
</div>

<div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
<div>
<label className={styles.tag}>Sort by</label>
<select
value={sortKey}
onChange={(e) => setSortKey(e.target.value as SortKey)}
style={{
width: "100%",
padding: "10px 12px",
borderRadius: 10,
border: "1px solid rgba(0,255,160,.25)",
background: "rgba(0,20,12,.4)",
color: "#caffe4",
}}
>
<option value="title">Title</option>
<option value="payways">Payways</option>
<option value="engine">Engine</option>
<option value="volatility">Volatility</option>
</select>
</div>
<div>
<label className={styles.tag}>Order</label>
<button
className={styles.cardCta}
onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
style={{ width: "100%" }}
>
{sortDir === "asc" ? "Asc ↑" : "Desc ↓"}
</button>
</div>
</div>
</div>

<div style={{ display: "flex", gap: 10 }}>
<button
className={styles.cardCta}
onClick={() => {
setQuery("");
setEngineFilter("all");
setVolFilter("all");
setSortKey("title");
setSortDir("asc");
}}
>
Reset Filters
</button>
</div>
</section>

{/* Grid of slots */}
<section
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
gap: 14,
marginTop: 14,
}}
>
{filtered.map((s) => (
<article key={s.slug} className={styles.card} style={{ display: "grid", gap: 10 }}>
<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
<div
aria-hidden
style={{
width: 36,
height: 36,
borderRadius: 10,
display: "grid",
placeItems: "center",
background: "linear-gradient(180deg, rgba(0,255,160,.12), rgba(0,255,140,.18))",
outline: "1px solid rgba(0,255,160,.25)",
}}
>
<span style={{ fontSize: 18 }}>
{THEME_EMOJI[s.theme] || "🎰"}
</span>
</div>
<div>
<h3 style={{ margin: 0 }}>{s.title}</h3>
<p className={styles.tag} style={{ marginTop: 4 }}>
{s.theme} • {s.payways} ways • {VOL_LABEL[s.volatility]}
</p>
</div>
</div>

<div>
{badge(ENGINE_LABEL[s.engine || "custom"] || (s.engine || "Custom"))}
{badge(`Vol: ${VOL_LABEL[s.volatility]}`)}
{badge(`${s.payways} ways`)}
</div>

<div style={{ display: "flex", gap: 10, marginTop: 4 }}>
<Link href={`/casino/slots/${s.slug}`} className={styles.cardCta}>
Play
</Link>
<Link href={`/casino/slots/${s.slug}`} className={styles.tag}>
Details →
</Link>
</div>
</article>
))}
</section>

{/* Empty state */}
{filtered.length === 0 && (
<div className={styles.card} style={{ textAlign: "center" }}>
<p style={{ margin: 0 }}>No slots match your filters.</p>
</div>
)}
</main>
</>
);
}