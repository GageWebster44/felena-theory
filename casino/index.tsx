// src/pages/casino/index.tsx
import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { SLOT_LIST } from "@/lib/casino/registry";
import styles from "@/styles/index.module.css";

// Simple emoji helpers for quick visual flavor (non-blocking)
const THEME_EMOJI: Record<string, string> = {
nuclear: "☢️", horror: "🦇", dungeon: "🗝️", barnyard: "🐔", volcano: "🌋",
space: "🚀", galaxy: "🪐", cyber: "🧪", cats: "🐾", ocean: "🌊", neon: "💎",
jukebox: "🎵", superhero: "⚡", savannah: "🦁", arctic: "❄️", time: "⏳",
cantina: "🌮", farm: "🌽", hacker: "🖥️", racer: "🏁", classic: "⭐", easy: "🍀", music: "🎸"
};

export default function CasinoLobby() {
// Sort slots alphabetically for consistency
const slotsSorted = useMemo(
() => [...SLOT_LIST].sort((a, b) => a.title.localeCompare(b.title)),
[]
);

// Curate a few headliners to “feel like everything’s here”
// You can tweak the slugs for curation order if needed.
const headliners = useMemo(() => {
const priority = new Set([
"global-meltdown",
"starship-stackers",
"volcano-vault",
"dungeon-delver",
"rooster-revenge",
"buffalo-legacy",
"fire-link-forge",
]);
const curated = slotsSorted.filter(s => priority.has(s.slug)).slice(0, 6);
if (curated.length < 6) {
// backfill from the rest
const rest = slotsSorted.filter(s => !priority.has(s.slug));
curated.push(...rest.slice(0, 6 - curated.length));
}
return curated;
}, [slotsSorted]);

// A secondary “More Slots” strip (for breadth)
const moreSlots = useMemo(() => {
const used = new Set(headliners.map(s => s.slug));
return slotsSorted.filter(s => !used.has(s.slug)).slice(0, 8);
}, [slotsSorted, headliners]);

// Teaser list for table games (linking to /casino/tables)
const tables = [
{ key: "blackjack", label: "Blackjack", emoji: "🂡" },
{ key: "roulette", label: "Roulette", emoji: "🎯" },
{ key: "crash", label: "Crash", emoji: "📉" },
{ key: "dice", label: "Dice", emoji: "🎲" },
{ key: "poker", label: "Poker", emoji: "🃏" },
];

return (
<div className={styles.page}>
<Head>
<title>Casino Control Panel — Felena Theory</title>
<meta name="description" content="Choose a slot or table to launch the cabinet. CRT-skinned, casino-grade math, and seamless animations." />
</Head>

<main className={styles.wrap}>
{/* Hero / Brand block */}
<header className={styles.hero} style={{ textAlign: "center" }}>
<h1 className={styles.title} style={{ marginBottom: 6 }}>Casino Control Panel</h1>
<p className={styles.sub} style={{ marginBottom: 16 }}>
Quantum‑smooth slots, cinematic CRT skins, and table classics — all in one grid.
</p>

<div className="ctaRow">
<Link href="/casino/slots" className="ctaPrimary">Browse All Slots</Link>
<Link href="/casino/tables" className="ctaGhost">Enter Table Games</Link>
</div>
</header>

{/* Headliners */}
<section className="section">
<div className="sectionHeader">
<h2 className="sectionTitle">Featured Cabinets</h2>
<Link href="/casino/slots" className="moreLink">Show more →</Link>
</div>

<div className="grid">
{headliners.map((s) => (
<article key={s.slug} className="card">
<div className="badges">
<span className="pill">SLOT</span>
<span className="pill">{(s.payways || 0).toLocaleString()} ways</span>
<span className="pill">{s.volatility.toUpperCase()} vol</span>
</div>
<div className="cardRow">
<div className="thumb">{THEME_EMOJI[s.theme] || "🎰"}</div>
<div>
<h3 className="cardTitle">{s.title}</h3>
<p className="cardSub">{s.theme} • engine: {s.engine ?? "custom"}</p>
</div>
</div>
<Link className="cta" href={`/casino/slots/${s.slug}`}>Launch →</Link>
</article>
))}
</div>
</section>

{/* More Slots strip */}
<section className="section">
<div className="sectionHeader">
<h2 className="sectionTitle">More Slots</h2>
<Link href="/casino/slots" className="moreLink">Full list ({slotsSorted.length}) →</Link>
</div>

<div className="grid compact">
{moreSlots.map((s) => (
<article key={s.slug} className="card">
<div className="badges">
<span className="pill">{(s.payways || 0).toLocaleString()} ways</span>
<span className="pill">{s.volatility.toUpperCase()}</span>
</div>
<div className="cardRow">
<div className="thumb">{THEME_EMOJI[s.theme] || "🎰"}</div>
<div>
<h3 className="cardTitle">{s.title}</h3>
<p className="cardSub">{s.theme}</p>
</div>
</div>
<Link className="cta" href={`/casino/slots/${s.slug}`}>Launch →</Link>
</article>
))}
</div>
</section>

{/* Table Games Teaser */}
<section className="section">
<div className="sectionHeader">
<h2 className="sectionTitle">Table Games</h2>
<Link href="/casino/tables" className="moreLink">Show all →</Link>
</div>

<div className="grid tables">
{tables.map((t) => (
<article key={t.key} className="card">
<div className="badges">
<span className="pill">TABLE</span>
</div>
<div className="cardRow">
<div className="thumb">{t.emoji}</div>
<div>
<h3 className="cardTitle">{t.label}</h3>
<p className="cardSub">Classic rules • CRT Presentation</p>
</div>
</div>
<Link className="cta" href={`/casino/tables#${t.key}`}>Enter →</Link>
</article>
))}
</div>
</section>
</main>

{/* CRT-styled inline tweaks */}
<style jsx>{`
.section { margin: 26px 0; }

.sectionHeader {
display: flex; align-items: baseline; justify-content: space-between;
margin-bottom: 10px;
}
.sectionTitle {
margin: 0; letter-spacing: .5px;
}
.moreLink {
color: #bdfed9; text-decoration: none; font-weight: 700; font-size: .95rem;
opacity: .9;
}
.moreLink:hover { text-decoration: underline; }

.ctaRow {
display: inline-grid; grid-auto-flow: column; gap: 10px; margin-top: 6px;
}
.ctaPrimary, .ctaGhost {
display: inline-block; padding: 10px 14px; border-radius: 12px;
text-decoration: none; font-weight: 800; letter-spacing: .04em;
border: 1px solid rgba(38,255,136,.35);
transition: transform .08s ease, box-shadow .2s ease, background .2s ease;
}
.ctaPrimary {
background: rgba(0, 0, 0, 0.6); color: #c9ffe7;
box-shadow: 0 0 16px rgba(38,255,136,0.15);
}
.ctaPrimary:hover { transform: translateY(-1px); box-shadow: 0 0 22px rgba(38,255,136,.25); }
.ctaGhost {
background: linear-gradient(180deg, rgba(38,255,136,.12), rgba(38,255,136,.18)); color: #10261e;
}

.grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
gap: 18px;
margin: 10px auto 24px;
max-width: 1200px;
}
.grid.compact { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
.grid.tables { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }

.card {
position: relative;
padding: 16px;
border-radius: 16px;
border: 1px solid rgba(38, 255, 136, 0.28);
background: radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,.04), rgba(0,0,0,.65));
box-shadow:
inset 0 0 16px rgba(38, 255, 136, 0.18),
0 0 22px rgba(0, 0, 0, 0.45);
display: grid; gap: 10px;
}
.badges { display: flex; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
.pill {
font-size: 12px; padding: 4px 8px; border-radius: 999px;
background: rgba(38, 255, 136, 0.12);
border: 1px solid rgba(38, 255, 136, 0.28);
color: #bdfed9; letter-spacing: 0.06em;
}
.cardRow { display: grid; grid-template-columns: 44px 1fr; gap: 10px; align-items: center; }
.thumb {
width: 44px; height: 44px; border-radius: 12px;
display: grid; place-items: center;
background: linear-gradient(180deg, rgba(38, 255, 136, 0.12), rgba(38, 255, 136, 0.18));
border: 1px solid rgba(38, 255, 136, 0.28);
font-size: 22px; color: #caffed;
}
.cardTitle { margin: 4px 0 2px; color: #fff; font-weight: 800; letter-spacing: .03em; }
.cardSub { color: #a6f7cd; opacity: .85; font-size: .92rem; margin: 0 0 2px; }

.cta {
display: inline-block; padding: 8px 12px; border-radius: 10px;
border: 1px solid rgba(38, 255, 136, 0.35);
background: rgba(0, 0, 0, 0.6); color: #c9ffe7;
font-weight: 700; text-decoration: none;
transition: transform .08s ease, box-shadow .2s ease;
width: fit-content;
}
.cta:hover { transform: translateY(-1px); box-shadow: 0 0 22px rgba(38, 255, 136, 0.25); }
`}</style>
</div>
);
}