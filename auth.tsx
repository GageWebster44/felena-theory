import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

export default function AuthLanding() {
const router = useRouter();
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);

async function sendMagicLink(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
if (!email) return;
try {
setLoading(true);
const { error } = await supabase.auth.signInWithOtp({
email,
options: { emailRedirectTo: `${window.location.origin}/dashboard` },
});
if (error) alert(error.message);
else alert('Check your email for the magic link!');
} catch (err) {
console.error('Magic link error:', err);
alert('Something went wrong sending the magic link.');
} finally {
setLoading(false);
}
}

return (
<div className={styles.siteBg}>
<Head>
<title>Felena Theory | Access Tunnel</title>
<meta name="description" content="Felena Theory: a retrofuturist progression system with a cinematic terminal vibe. XP powers access to algorithmic engines and payout upgrades." />
<meta property="og:title" content="Felena Theory" />
<meta property="og:description" content="XP Engines. QRUplink Chains. Quantum Arcade. Autonomous Trading Grid." />
<link rel="icon" href="/felena-favicon.png" />
</Head>

<div className={styles.gridOverlay} aria-hidden="true" />
<div className={styles.scanLines} aria-hidden="true" />

<main className={styles.container}>
<div className={styles.logoWrapper}>
<div className={styles.logoWrap}>
<img src="/felena-brand-kit/felena-logo-final.png" alt="Felena Theory" className={styles.logo} />
</div>
</div>

<p className={styles.center}>A financial engine disguised as a game. Built by a tradesman, not a suit.</p>

<nav className={styles.navTabs}>
<Link className={styles.chip} href="#access">Enter Access Tunnel</Link>
<Link className={styles.chip} href="#xp">XP Agreement</Link>
<Link className={styles.chip} href="#vision">FelenaVision</Link>
</nav>

<div className={styles.modePill}>PUBLIC MODE</div>

<header className={`${styles.hero} ${styles.lift}`}>
<h1 className={styles.title}>UPGRADE YOUR INCOME.</h1>
<p className={styles.tagline}>A retro-futurist progression system with a cinematic terminal vibe. XP powers access to engines and upgrades.</p>
</header>

<section id="quantum" className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>Quantum Arcade</h2>
<p>XP Casino featuring Slots, Table Games, Roulette, Crash, and more. Every spin fuels the system. Streak bonuses and leaderboards enabled.</p>
</section>

<section id="uplink" className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>QRUplink Network</h2>
<p>20-code referral chain resets every 90 days. Chain reaction payouts based on XP volume, invite velocity, and tier structure.</p>
</section>

<section id="lottery" className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>Lottery</h2>
<p>Weekly XP jackpot. Rebates for non-winners. Transparent odds. Winners broadcast across HUD.</p>
</section>

<section id="lab" className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>Learn to Earn Lab</h2>
<p>Kids under 18 train in 25+ real-world simulations (electric, carpentry, barbering, etc). 70/30 XP savings model. Guardian vault secured.</p>
</section>

<section id="phonebooth" className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>Phone Booth</h2>
<p>Stripe deposits. Real-time XP cashout via Alpaca. Every transaction is algorithmically verified. This is the system’s ATM.</p>
</section>

<section className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>What Is Felena Theory?</h2>
<p>Felena Theory is a quant-financial platform disguised as a game. Built by a tradesman from Iowa, not a suit from New York. It’s an income engine — not a startup. Not a simulation. Not a game. It’s real.</p>
</section>

<section id="xp" className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>XP Model</h2>
<ul className={styles.xpGrid}>
<li>5 XP = $5</li>
<li>10 XP = $10</li>
<li>20 XP = $20</li>
<li>50 XP = $50</li>
<li>100 XP = $100</li>
<li>250 XP = $250</li>
<li>500 XP = $500</li>
<li>1,000 XP = $1,000</li>
<li>2,500 XP = $2,500</li>
<li>5,000 XP = $5,000</li>
<li>10,000 XP = $10,000</li>
<li>25,000 XP = $25,000</li>
<li>50,000 XP = $50,000</li>
<li>75,000 XP = $75,000</li>
<li>100,000 XP = $100,000</li>
</ul>
<p>XP can also be earned in-app and redeemed via the Phone Booth (Alpaca bridge) for real payout.</p>
</section>

<section id="access" className={`${styles.card} ${styles.lift}`}>
<h2 className={styles.typewriter}>Access Tunnel</h2>
<p className={styles.muted}>1) Sign in 2) Verify for brokerage 3) Choose Operator Alias</p>

<form onSubmit={sendMagicLink} className={styles.inputRow}>
<input
type="email"
inputMode="email"
autoComplete="email"
placeholder="you@gridmail.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
className={styles.input}
required
/>
<button type="submit" disabled={loading} className={styles.pill}>
{loading ? 'Sending...' : 'Send Magic Link'}
</button>
</form>

<div className={styles.pillRow}>
<a href="/api/auth/google" className={styles.pillGhost}>Sign in with Google</a>
<a href="/api/auth/github" className={styles.pillGhost}>Sign in with GitHub</a>
</div>
</section>

<footer className={`${styles.card} ${styles.lift} ${styles.footer}`}>
<p className={styles.imprint}><strong>Important:</strong> XP is a simulated in-app resource. It is not fiat or crypto. Real-world settlement (if offered) requires full KYC & a brokerage account via our partner.</p>

<div className={styles.footerLinks}>
<Link href="/privacy">Privacy</Link>
<Link href="/terms">Terms</Link>
<a href="mailto:ops@felenatheory.com">Contact</a>
<a href="https://discord.gg/felenatheory" target="_blank">Discord</a>
</div>

<p className={styles.footerRight}>© 2025 Felena Holdings LLC</p>
</footer>
</main>
</div>
);
}