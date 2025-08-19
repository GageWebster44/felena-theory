// src/pages/terms/index.tsx
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

export default function TermsPage() {
return (
<div className={styles.page}>
<Head>
<title>Terms & Disclosures — Felena Theory</title>
<meta
name="description"
content="Terms of use, disclosures, and ownership notices for Felena Theory and the Financial Reactor."
/>
</Head>

<main className={styles.wrap}>
{/* Hero */}
<header className={styles.hero}>
<h1 className={styles.title}>Terms & Disclosures</h1>
<p className={styles.sub}>
Please read these terms carefully. Using Felena Theory or any of its hubs
(including Casino, Arcade, Arena, Learn-to-Earn, Sportsbook, PhoneBooth,
Keycard, and Engine Grid) means you agree to the rules below.
</p>
<div className={styles.ctaRow}>
<Link href="/" className={styles.btn}>← Back Home</Link>
<Link href="/about" className={`${styles.btn} ${styles.btnGhost}`}>About the Company</Link>
</div>
</header>

{/* Terms body */}
<section className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
{/* Ownership */}
<article className={styles.card}>
<h3>1) Ownership & Originality</h3>
<p>
The <strong>Financial Reactor</strong>, <strong>Keycard</strong>, <strong>QR Uplink</strong>, the
XP lifecycle design (mint → burn → recycle), game flows, UI, and related
system logic are proprietary works owned by <strong>Felena Holdings LLC</strong>.
Access is licensed <em>only</em> through Felena Theory applications and services.
Copying, cloning, framing, reverse engineering, or commercial use of these
systems without written consent is strictly prohibited.
</p>
</article>

{/* Eligibility */}
<article className={styles.card}>
<h3>2) Eligibility</h3>
<p>You must be at least 18 to use wagering or banking features.</p>
<p>
Minors may participate in Learn-to-Earn with guardian linkage. By default,
<strong> 60%</strong> of a minor’s XP is locked as savings until age 18 and
<strong> 40%</strong> routes to the linked guardian account.
</p>
</article>

{/* XP parity */}
<article className={styles.card}>
<h3>3) XP Parity & Redemptions</h3>
<p>
For clarity we display <strong>1 XP ≈ $1</strong> (“display parity”). XP has
no cash value unless and until you redeem via approved channels (e.g., digital
gift cards) or transfer out through an available, fully-onboarded banking
integration. Redemption options can change due to partner, regional, or
compliance requirements.
</p>
</article>

{/* PhoneBooth & Gift Cards */}
<article className={styles.card}>
<h3>4) PhoneBooth & Gift Cards</h3>
<p>
Gift card redemptions convert XP to third-party codes denominated in USD
equivalents. Codes are delivered digitally and are subject to the issuer’s
terms. Lost or shared codes are the user’s responsibility. We may impose per-day
or per-account limits to prevent fraud.
</p>
</article>

{/* Risk / Games */}
<article className={styles.card}>
<h3>5) Games, Arena & Sportsbook — Risk</h3>
<p>
Games involve chance, variance, and <strong>explicit XP burns</strong>. Do not
participate with XP you cannot afford to lose. House math, edge, and fees are
disclosed in-app and may be updated. PVP formats recycle XP among participants
with transparent rake/burn rules.
</p>
<p>
Sportsbook (where enabled) uses American odds and demo settlement in the client;
production settlement is server-side and subject to local laws and availability.
</p>
</article>

{/* Engines */}
<article className={styles.card}>
<h3>6) Engine Grid (Autonomous Strategies)</h3>
<p>
Engine Rentals are informational/risk-simulation experiences. Historical or
hypothetical performance does not guarantee future results. If a broker
connection (e.g., Alpaca) is supported in your region, it requires separate
onboarding and compliance with the broker’s terms.
</p>
</article>

{/* Accounts & Keycard */}
<article className={styles.card}>
<h3>7) Accounts, Security & Keycard</h3>
<p>
Your Keycard is your identity across the platform. Keep credentials private;
you are responsible for any activity on your account. We may suspend or
terminate accounts to address fraud, abuse, or policy violations.
</p>
</article>

{/* Data */}
<article className={styles.card}>
<h3>8) Data & Privacy</h3>
<p>
We store only what’s needed to operate the platform (balances, ledgers, and
receipts). See our <Link className={styles.cardCta} href="/privacy">Privacy Notice →</Link>.
We may aggregate/anonymize data to improve the Reactor and anti-abuse systems.
</p>
</article>

{/* Compliance */}
<article className={styles.card}>
<h3>9) Compliance & Geography</h3>
<p>
Certain features may be unavailable in your jurisdiction. You agree not to use
VPNs or methods to evade geofencing, KYC, or age controls. Where required, we
may request identity verification before enabling specific functions.
</p>
</article>

{/* Prohibited conduct */}
<article className={styles.card}>
<h3>10) Prohibited Conduct</h3>
<ul style={ulList}>
<li>Circumventing fees, rakes, caps, or XP burns.</li>
<li>Automating play where not explicitly allowed.</li>
<li>Account sharing, code reselling, or exploiting bugs.</li>
<li>Upload of illegal content or harassment of other users.</li>
</ul>
</article>

{/* Changes */}
<article className={styles.card}>
<h3>11) Changes to These Terms</h3>
<p>
We may update these terms and in-app rules from time to time. Continued use
after an update constitutes acceptance of the revised terms.
</p>
<p className={styles.tag}>Last updated: {new Date().toLocaleDateString()}</p>
</article>

{/* Contact */}
<article className={styles.card}>
<h3>12) Contact</h3>
<p>
Questions about these terms or partnerships? Reach us at{" "}
<strong>FelenaTheory@gmail.com</strong>.
</p>
<div className={styles.ctaRow}>
<Link href="/about" className={styles.cardCta}>Company & Roadmap →</Link>
<Link href="/preorder" className={styles.cardCta}>Join the Beta →</Link>
</div>
</article>
</section>

<footer className={styles.footer}>
<span>© {new Date().getFullYear()} Felena Holdings LLC — All rights reserved.</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/privacy" className={styles.cardCta}>Privacy</Link>
<Link href="/" className={styles.cardCta}>Home</Link>
</div>
</footer>
</main>
</div>
);
}

/* Tight list style */
const ulList: React.CSSProperties = {
margin: 0,
paddingLeft: 18,
display: "grid",
gap: 6,
listStyle: "disc",
color: "#c6ffe0",
};