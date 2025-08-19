// src/pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

export default function Home() {
return (
<div className={styles.page}>
<Head>
<title>THE FELENA THEORY</title>
<meta name="description" content="The Financial Reactor." />
</Head>

<main className={styles.wrap}>
{/* Masthead */}
<header className={styles.masthead}>
<h1 className={styles.brandTitle}>THE FELENA THEORY</h1>
<span className={styles.brandUnderline} aria-hidden="true" />
<p className={styles.tag}>The Financial Reactor.</p>

<div className={styles.ctaRow}>
<Link href="/preorder" className={styles.btn}>
Pre-Order Felena Vision
</Link>
<Link href="/becomeanoperator" className={styles.btn}>
Become An Operator
</Link>
</div>
</header>

{/* 3×3 Control Grid */}
<section
className={styles.grid}
style={{ gridTemplateColumns: "repeat(3, minmax(260px, 1fr))" }}
>
{/* 1. CASINO */}
<article className={styles.card}>
<h3>Casino</h3>
<p>
Tables & Slots — Blackjack, Roulette, Baccarat, Craps, Video Poker,
plus themed slot banks.
</p>
<div>
<Link className={styles.cardCta} href="/casino">
Open Casino →
</Link>
</div>
</article>

{/* 2. ARCADE */}
<article className={styles.card}>
<h3>Arcade</h3>
<p>
Mobile-style games — strategy, puzzle, endless runner, crash & other
generic algorithms with dynamic leveling.
</p>
<div>
<Link className={styles.cardCta} href="/arcade">
Enter Arcade →
</Link>
</div>
</article>

{/* 3. KEYCARD */}
<article className={styles.card}>
<h3>Keycard</h3>
<p>
Alias • XP • Tier • Badges • Referral. Includes QR Uplink for
Keycard↔Keycard sharing.
</p>
<div>
<Link className={styles.cardCta} href="/keycard">
Open Keycard →
</Link>
</div>
</article>

{/* 4. PHONEBOOTH */}
<article className={styles.card}>
<h3>PhoneBooth</h3>
<p>Deposit • Withdraw • Redeem Gift Cards • P2P XP transfers • Ledger.</p>
<div>
<Link className={styles.cardCta} href="/phonebooth">
Step Inside →
</Link>
</div>
</article>

{/* 5. ENGINE RENTALS */}
<article className={styles.card}>
<h3>Algorithm Engine Rentals</h3>
<p>
Alpaca autonomous engines. Pick a strategy, stake XP, track
performance.
</p>
<div>
<Link className={styles.cardCta} href="/engine-grid">
Open Engine Grid →
</Link>
</div>
</article>

{/* 6. ARENA */}
<article className={styles.card}>
<h3>Felena Arena</h3>
<p>Ranked duels & seasonal events. Prove skill and climb the leaderboard.</p>
<div>
<Link className={styles.cardCta} href="/arena">
Enter Arena →
</Link>
</div>
</article>

{/* 7. LEARN */}
<article className={styles.card}>
<h3>Learn-to-Earn</h3>
<p>Trades & skills progression (levels 1–10). Earn XP by mastering tracks.</p>
<div>
<Link className={styles.cardCta} href="/learn">
Enter Lab →
</Link>
</div>
</article>

{/* 8. SPORTSBOOK */}
<article className={styles.card}>
<h3>Sportsbook</h3>
<p>
American & international markets. Straight bets, parlays, props — XP
stakes with house rules.
</p>
<div>
<Link className={styles.cardCta} href="/sportsbook">
Open Sportsbook →
</Link>
</div>
</article>

{/* 9. ABOUT */}
<article className={styles.card}>
<h3>About Us</h3>
<p>
What Felena is, how the Reactor works, and our proof-first mission.
</p>
<div>
<Link className={styles.cardCta} href="/about">
Learn More →
</Link>
</div>
</article>
</section>

{/* Footer */}
<footer className={styles.footer}>
<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
<span>© {new Date().getFullYear()} Felena Theory</span>
<span>Felena Holdings LLC</span>
<span>FelenaTheory@gmail.com</span>
</div>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/terms" className={styles.cardCta}>
Terms & Disclosures
</Link>
<Link href="/preorder" className={styles.cardCta}>
Pre-Order
</Link>
</div>
</footer>
</main>
</div>
);
}