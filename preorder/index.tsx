// src/pages/preorder/index.tsx
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

export default function PreorderPage() {
// --- Local “waitlist” demo state (replace with your API) ---
const [email, setEmail] = useState("");
const [alias, setAlias] = useState("");
const [submitted, setSubmitted] = useState(false);
const [agree, setAgree] = useState(true);

// fake live counter
const base = 12870; // seed
const liveCount = useMemo(() => {
const t = Math.floor(Date.now() / (1000 * 60)); // minute bucket
const drift = (t % 97) * 3 + (t % 13); // whimsical
return base + drift;
}, []);

useEffect(() => {
if (typeof window === "undefined") return;
const prior = localStorage.getItem("felena_waitlist_submitted") === "1";
if (prior) setSubmitted(true);
}, []);

function joinWaitlist(e: React.FormEvent) {
e.preventDefault();
if (!agree) return alert("Please agree to the preview terms.");
if (!email || !email.includes("@")) return alert("Add a valid email.");
// In production, POST to your backend here. This is a local demo.
localStorage.setItem("felena_waitlist_email", email.trim());
localStorage.setItem("felena_waitlist_alias", alias.trim());
localStorage.setItem("felena_waitlist_submitted", "1");
setSubmitted(true);
}

return (
<div className={styles.page}>
<Head>
<title>Felena Vision — Beta Pre-Order</title>
<meta
name="description"
content="Join the Felena Vision beta: a proof-first XP economy where learning and play route real rewards. Secure early Operator access."
/>
</Head>

<main className={styles.wrap}>
{/* Hero */}
<header className={styles.hero}>
<h1 className={styles.title}>Felena Vision — Beta Access</h1>
<p className={styles.sub}>
A neon, proof-first XP economy where <strong>XP ≈ $1</strong> (display parity).
Train skills, compete head-to-head, redeem gift codes, and route value with your Keycard.
Pre-order beta access to secure your Operator handle and day-one rewards.
</p>
<div className={styles.ctaRow}>
<Link href="/" className={styles.btn}>← Back Home</Link>
<Link href="/about" className={`${styles.btn} ${styles.btnGhost}`}>Learn About the Vision</Link>
</div>
</header>

{/* Counter / Social proof */}
<section className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
<article className={styles.card}>
<h3>Operators in Line</h3>
<p className={styles.tag}>Live waitlist (demo)</p>
<div style={{ fontWeight: 900, fontSize: 28, color: "#a9ffd1", textShadow: "0 0 10px rgba(0,255,136,.35)" }}>
{liveCount.toLocaleString()}
</div>
<p className={styles.tag} style={{ marginTop: 6 }}>
Early birds get referral bounties and priority invites.
</p>
</article>

<article className={styles.card}>
<h3>Beta Window</h3>
<p>Private Beta (Wave 1): <strong>Q3 2025</strong></p>
<p>Public Beta (Wave 2): <strong>Q4 2025</strong></p>
<p className={styles.tag} style={{ marginTop: 6 }}>
Dates are estimates; you’ll receive updates as we lock milestones.
</p>
</article>

<article className={styles.card}>
<h3>What You’ll Get</h3>
<ul style={{ textAlign: "left", margin: "6px 0 0 18px", lineHeight: 1.4 }}>
<li>Reserved Operator alias + Keycard</li>
<li>Early access to Casino, Arcade & Arena loops</li>
<li>Learn-to-Earn tracks with daily XP</li>
<li>PhoneBooth redemptions (1 XP ≈ $1 display)</li>
<li>Beta-only badges & referral multipliers</li>
</ul>
</article>
</section>

{/* Signup Form */}
<section style={{ marginTop: 16 }}>
<article className={styles.card}>
<h3>Claim Your Operator Handle</h3>
{!submitted ? (
<form onSubmit={joinWaitlist} style={{ display: "grid", gap: 10, maxWidth: 620, margin: "0 auto" }}>
<label className={styles.tag}>Alias (optional, can be private)</label>
<input
value={alias}
onChange={(e) => setAlias(e.target.value)}
placeholder="e.g., ShadowPilot"
aria-label="Alias"
style={fieldStyle}
/>
<label className={styles.tag}>Email (required for access invite)</label>
<input
value={email}
onChange={(e) => setEmail(e.target.value)}
type="email"
placeholder="you@domain.com"
aria-label="Email"
style={fieldStyle}
required
/>
<label style={{ display: "flex", alignItems: "center", gap: 8 }}>
<input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
<span className={styles.tag}>
I agree this is a preview sign-up and final features may change.
</span>
</label>
<div className={styles.ctaRow}>
<button className={styles.btn} type="submit">Join the Beta Waitlist</button>
<Link href="/terms" className={`${styles.btn} ${styles.btnGhost}`}>Terms & Disclosures</Link>
</div>
<p className={styles.tag} style={{ marginTop: 6 }}>
We’ll email your invite and setup steps. You can change or hide your alias anytime.
</p>
</form>
) : (
<div style={{ maxWidth: 640, margin: "0 auto" }}>
<p style={{ fontWeight: 800, fontSize: 18, color: "#a9ffd1" }}>
You’re in. Watch your inbox for the invite.
</p>
<p className={styles.tag}>
Saved: <strong>{localStorage.getItem("felena_waitlist_alias") || "Anonymous"}</strong> •{" "}
<strong>{localStorage.getItem("felena_waitlist_email")}</strong>
</p>
<div className={styles.ctaRow}>
<Link href="/keycard" className={styles.cardCta}>Preview Keycard →</Link>
<Link href="/arcade" className={styles.cardCta}>Enter Arcade (Demo) →</Link>
</div>
</div>
)}
</article>
</section>

{/* Why Pre-Order / Feature Pillars */}
<section style={{ marginTop: 16 }}>
<h2 style={{ margin: "0 0 10px" }}>Why This Will Be Different</h2>
<div className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
<article className={styles.card}>
<h3>Keycard + QR Uplink</h3>
<p>
Your futuristic player profile. Keep your alias private or reveal it. Share value via
secure QR chains and build your network for referral bounties.
</p>
</article>
<article className={styles.card}>
<h3>Casino • Arcade • Arena</h3>
<p>
Classic house math and skill loops with transparent burns. PVP trivia, reflex, and
micro-strategy where XP is constantly recycled.
</p>
</article>
<article className={styles.card}>
<h3>Learn-to-Earn</h3>
<p>
Trades and job simulators from basics to mastery. Daily caps pace progress; overrides
let you push when you’re on a streak.
</p>
</article>
<article className={styles.card}>
<h3>PhoneBooth</h3>
<p>
Deposit, withdraw, redeem partner gift codes, and route peer-to-peer by Operator
extension. It’s the XP bridge that keeps value moving.
</p>
</article>
</div>
</section>

{/* FAQ */}
<section style={{ marginTop: 16 }}>
<h2 style={{ margin: "0 0 10px" }}>Pre-Order FAQ</h2>
<div className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
<article className={styles.card}>
<h3>What does “pre-order the beta” mean?</h3>
<p>
You’re reserving an Operator slot for early access and updates. We’ll invite waves of
testers during the beta windows, with perks for early cohorts.
</p>
</article>
<article className={styles.card}>
<h3>Is XP real money?</h3>
<p>
XP uses <em>display parity</em> (<strong>1 XP ≈ $1</strong>) for clarity across hubs.
Redemptions in PhoneBooth issue real partner gift codes per your balance and rules.
</p>
</article>
<article className={styles.card}>
<h3>Can I keep my alias private?</h3>
<p>
Yes. Your Keycard keeps identity private by default. You can reveal your alias when you
want to grow your network.
</p>
</article>
<article className={styles.card}>
<h3>How are minors protected?</h3>
<p>
Learn-to-Earn routes 60% to locked savings and 40% to guardians for minors; adults receive
100% spendable XP. We design for safety first.
</p>
</article>
</div>
</section>

{/* Footer */}
<footer className={styles.footer}>
<span>© {new Date().getFullYear()} Felena Holdings LLC — FelenaTheory@gmail.com</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/terms" className={styles.cardCta}>Terms & Disclosures</Link>
<Link href="/about" className={styles.cardCta}>Company & Roadmap</Link>
</div>
</footer>
</main>

<style jsx>{`
/* Local field styling to match the neon theme */
.spark {
position: absolute;
inset: 0;
border-radius: 12px;
pointer-events: none;
box-shadow: 0 0 28px rgba(0,255,136,.18);
}
`}</style>
</div>
);
}

const fieldStyle: React.CSSProperties = {
width: "100%",
padding: "10px 12px",
borderRadius: 10,
border: "1px solid rgba(0,255,136,.25)",
background: "rgba(0,20,8,.35)",
color: "#eaffe9",
boxShadow: "inset 0 0 14px rgba(0,255,136,.08)",
};