// src/pages/index.tsx
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/crtLaunch.module.css'; // uses your CRT module (no Tailwind)

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Felena Theory</title>
        <meta name="description" content="Felena Theory — a retro‑futurist progression system with a cinematic terminal vibe." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Screen frame + scanlines + grid */}
      <div className={styles.crtScreen}>
        <div className={styles.crtGrid} aria-hidden />

        {/* TOP BAR / LOGO */}
        <header
          className={styles.panel}
          style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div className={styles.panelHeader}>Felena Theory</div>
          <div className={styles.panelBody} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, position: 'relative' }}>
              <Image
                src="/felena-brand-kit/felena-logo-final.png"
                alt="Felena Theory logo"
                fill
                sizes="28px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <span className={styles.badge}>PUBLIC MODE</span>
          </div>
        </header>

        {/* HERO */}
        <section className={styles.panel} style={{ marginBottom: 20 }}>
          <div className={styles.panelBody}>
            <h1 className={styles.heroTitle}>
              PLAY. EARN XP. <br /> UNLOCK ENGINES.
            </h1>
            <p className={styles.heroSub}>
              A retro‑futurist progression system with a cinematic terminal vibe.
              Public marketing mode — no dashboards here. Just the door in.
            </p>

            <div className={styles.ctaRow}>
              <Link href="/auth" className={styles.btnPrimary} aria-label="Sign up or log in">
                Sign Up / Log In
              </Link>
              <a href="#about" className={styles.btnGhost} aria-label="Learn more about Felena Theory">
                Learn More
              </a>
            </div>

            <div className={styles.kvRow}>
              <Stat label="LATENCY" value="12.3ms" />
              <Stat label="SIGNAL" value="STRONG" />
              <Stat label="CHANNEL" value="FT‑01" />
            </div>
          </div>
        </section>

        {/* FEATURE STRIP */}
        <section className={styles.featureGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>FelenaVision</div>
            <div className={styles.panelBody}>
              <p style={{ marginBottom: 10 }}>
                Pre‑order access to FelenaVision — our cinematic telemetry layer for replays,
                highlights, and spectral signal overlays.
              </p>
              <Link href="/auth" className={styles.btnGhost}>Pre‑Order →</Link>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>Kidzone</div>
            <div className={styles.panelBody}>
              <p style={{ marginBottom: 10 }}>
                Curated safe‑mode for younger players. XP accrues, while social & cashout
                features remain locked behind guardian approval.
              </p>
              <Link href="/auth" className={styles.btnGhost}>Enter Kidzone →</Link>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>Security & Compliance</div>
            <div className={styles.panelBody}>
              <ul className={styles.bulletList}>
                <li>Agreement receipts & audit trails</li>
                <li>Broker KYC handled via partner (if cashout is offered)</li>
                <li>Guardian locks for child accounts</li>
              </ul>
              <Link href="/auth" className={styles.btnGhost}>Review Agreement →</Link>
            </div>
          </article>
        </section>

        {/* ABOUT */}
        <section id="about" className={styles.panel} style={{ marginTop: 20 }}>
          <div className={styles.panelHeader}>About Felena Theory</div>
          <div className={styles.panelBody}>
            <p>
              Felena Theory is a tactical progression system. Players route XP through simulated
              engines. Outcomes log to a personal ledger for audit and season play. XP is an in‑app
              resource — not cash, crypto, or fiat. Any real‑world cashout (if offered) requires
              identity verification (KYC) and a brokerage account with our partner.
            </p>
          </div>
        </section>

        {/* STATUS BAR */}
        <footer className={styles.statusBar} role="status" aria-live="polite">
          <span>BOOT OK</span>
          <span>GRID SYNC</span>
          <span>SIGNAL LOCK</span>
          <span>SECURE SESSION</span>
          <span>SYSTEM FEED</span>
          <span>ENGINE ROUTER</span>
        </footer>
      </div>
    </>
  );
}

/** Small stat pill used in the hero */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{label}</span>
      <strong style={{ fontSize: 16 }}>{value}</strong>
    </div>
  );
}