// src/pages/about/index.tsx
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

export default function AboutPage() {
return (
<div className={styles.page}>
<Head>
<title>About — Felena Theory</title>
<meta
name="description"
content="Felena Theory — owned and operated exclusively by Felena Holdings LLC. The original Financial Reactor system with full legal protection."
/>
</Head>

<main className={styles.wrap}>
{/* Hero */}
<header className={styles.hero}>
<h1 className={styles.title}>About Felena Theory</h1>
<p className={styles.sub}>
Felena Theory is not just another app. It is the <strong>only legally owned and protected
Financial Reactor system</strong> — created, operated, and safeguarded exclusively by{" "}
<strong>Felena Holdings LLC</strong>. Every element of this XP economy is our
intellectual property, our original design, and our protected ecosystem. No other
company, platform, or entity can replicate this system without using Felena Theory.
</p>
<div className={styles.ctaRow}>
<Link href="/" className={styles.btn}>← Back Home</Link>
<Link href="/auth" className={`${styles.btn} ${styles.btnGhost}`}>Join as an Operator</Link>
</div>
</header>

{/* Company */}
<section style={{ marginTop: 20 }}>
<h2>Company</h2>
<article className={styles.card}>
<p>
<strong>Felena Holdings LLC</strong> is the sole legal owner of the Felena Theory
platform. All rights, patents, trademarks, and trade secrets regarding the{" "}
<strong>Financial Reactor</strong>, Keycard, QR Uplink, XP-to-USD bridges, and
autonomous trading engines are protected under Felena Holdings. This ensures that
our system cannot be duplicated, cloned, or rebranded without our consent.
</p>
<p>
What this means: If a school, a business, or a partner wants to run this type of
system, they must do it through Felena Theory. Our framework is legally protected,
and <strong>we are the originators</strong> of the XP economy structure. We created
it, we own it, and we operate it under one umbrella.
</p>
</article>
</section>

{/* Leadership */}
<section style={{ marginTop: 16 }}>
<h2>Leadership</h2>
<div
className={styles.grid}
style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
>
<article className={styles.card}>
<h3>Founder & CEO — Gage Webster</h3>
<p>
Gage Webster designed Felena Theory from the ground up as a completely new category
of income system. His vision: merge entertainment, education, and finance into one
protected ecosystem where proof-of-effort drives real outcomes. The Felena system
is his original creation, legally secured, and operated exclusively under his
company — Felena Holdings LLC.
</p>
</article>
<article className={styles.card}>
<h3>Legal Ownership</h3>
<p>
Unlike open-source projects or generic fintech platforms, Felena Theory is a{" "}
<strong>closed, company-owned financial simulation system</strong>. Every hub,
mechanic, and algorithm is registered under Felena Holdings LLC. This ensures
originality, legal enforceability, and complete control of the system.
</p>
</article>
</div>
</section>

{/* What is the Reactor */}
<section style={{ marginTop: 16 }}>
<h2>The Financial Reactor</h2>
<div
className={styles.grid}
style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
>
<article className={styles.card}>
<h3>Exclusive System</h3>
<p>
The Financial Reactor — the XP mint/burn/recycle loop — is a protected invention of
Felena Holdings LLC. No other platform may operate this closed-loop XP economy.
</p>
</article>
<article className={styles.card}>
<h3>On/Off Ramps</h3>
<p>
PhoneBooth is our proprietary deposit/withdraw/redeem system. It is legally owned
technology, ensuring no competitor can provide the same XP-to-USD or XP-to-gift-card
routes outside our platform.
</p>
</article>
<article className={styles.card}>
<h3>Identity & Proof</h3>
<p>
The Keycard and QR Uplink are exclusive operator-identity systems. They make XP
transferable in a legally-protected format that no one else can duplicate.
</p>
</article>
</div>
</section>

{/* Roadmap with estimated dates/quarters */}
<section style={{ marginTop: 20 }}>
<h2>Roadmap Timeline (Estimated)</h2>
<div className="timeline">
<div className="phase">
<div className="dot" />
<div className="content">
<h3>Phase 0 — Private Beta <span className="time">Q3 2025</span></h3>
<p>
Operator Wave 1: UX polish, Keycard + QR Uplink validation, PhoneBooth stubs,
and Learn-to-Earn pilots. This was the proof stage showing our invention at work.
</p>
</div>
</div>
<div className="phase">
<div className="dot" />
<div className="content">
<h3>Phase 1 — Core Systems <span className="time">Q4 2025</span></h3>
<p>
Public beta of Casino, Arcade, Arena, Learn-to-Earn v1, PhoneBooth v1, and Engine
Grid preview. Establish XP parity and legal positioning.
</p>
</div>
</div>
<div className="phase">
<div className="dot" />
<div className="content">
<h3>Phase 2 — Community Growth <span className="time">Q1–Q2 2026</span></h3>
<p>
Expand Operator graph, referrals, and school/trade integrations. All contracts and
partnerships run through Felena Holdings LLC — ensuring exclusive control.
</p>
</div>
</div>
<div className="phase">
<div className="dot" />
<div className="content">
<h3>Phase 3 — Professionalization <span className="time">Q3–Q4 2026</span></h3>
<p>
Advanced Engine Rentals, Sportsbook production rollout, and compliance hardening.
We position Felena Theory as the <strong>only legally compliant XP-based system</strong>.
</p>
</div>
</div>
<div className="phase">
<div className="dot" />
<div className="content">
<h3>Phase 4 — Expansion <span className="time">2027+</span></h3>
<p>
Global tournaments, creator programs, and integrations with real-world partners —
all through Felena Theory. <strong>No other platform can run this system legally.</strong>
</p>
</div>
</div>
</div>
</section>

{/* Contact */}
<section style={{ marginTop: 16 }}>
<article className={styles.card}>
<h3>Contact & Partnerships</h3>
<p>
Felena Theory is the <strong>exclusive rights holder</strong> to this system. If you
wish to engage, partner, or build with this technology, it must be done through{" "}
Felena Holdings LLC. Our legal protections ensure this system cannot be copied or
deployed by third parties.
</p>
<p className={styles.tag}><strong>Email:</strong> FelenaTheory@gmail.com</p>
<div className={styles.ctaRow}>
<Link href="/terms" className={styles.cardCta}>Terms & Disclosures →</Link>
<Link href="/preorder" className={styles.cardCta}>Pre-Order Felena Vision →</Link>
</div>
</article>
</section>

{/* Footer */}
<footer className={styles.footer}>
<span>
© {new Date().getFullYear()} Felena Holdings LLC — All rights reserved. Felena Theory and
the Financial Reactor system are proprietary inventions of Felena Holdings LLC. Any use
outside our platform constitutes infringement. — FelenaTheory@gmail.com
</span>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
<Link href="/auth" className={styles.cardCta}>Become an Operator</Link>
<Link href="/terms" className={styles.cardCta}>Terms</Link>
</div>
</footer>
</main>

<style jsx>{`
.timeline {
position: relative;
margin: 20px 0;
padding-left: 30px;
border-left: 2px solid rgba(0,255,136,.35);
}
.phase { position: relative; margin-bottom: 30px; }
.dot {
position: absolute; left: -11px; top: 5px;
width: 18px; height: 18px; border-radius: 50%;
background: var(--neon); box-shadow: 0 0 10px rgba(0,255,136,.6);
}
.content {
background: linear-gradient(180deg, rgba(0,20,8,.45), rgba(0,0,0,.6));
padding: 12px 16px; border-radius: 12px;
border: 1px solid rgba(0,255,136,.25);
box-shadow: inset 0 0 14px rgba(0,255,136,.08);
}
.content h3 {
margin: 0 0 6px; color: #a9ffd1; font-size: 18px; text-transform: uppercase;
display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
}
.content .time {
font-size: 12px; letter-spacing: .08em; opacity: .9;
}
.content p { margin: 0; color: #c6ffe0; font-size: 14px; line-height: 1.4; }
`}</style>
</div>
);
}