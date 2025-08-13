import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import Head from 'next/head';
import styles from '@/styles/crtLaunch.module.css';

function PreorderPage() {
export default withGuardianGate(Page);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const referral_code = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/log-preorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, referral_code })
    });

    if (!res.ok) {
      setError('Submission failed. Try again later.');
      setLoading(false);
    } else {
      const { id: sessionId } = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }).then(res => res.json());

      if (sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      } else {
        setError('Stripe session failed.');
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.crtScreen}>
      <Head>
        <title>🚨 Felena Preorder – Vision Operator Access</title>
        <meta name="description" content="Reserve one of 100 Felena Vision slots. Gain early access to XP casino, autonomous grid engines, kids simulations, and algorithmic payout bridge." />
      </Head>

      <h1 className={styles.crtTitle}>🚨 Felena Theory: Operator Grid Preorder</h1>
      <p className={styles.crtText}>
        The system is nearly live. Operators will be selected in phases. Submit your interest now and secure one of the first 100 Operator Keys.
      </p>

      {!submitted && (
        <div className={styles.crtMenu}>
          <input
            className={styles.crtInput}
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button className={styles.crtButton} onClick={handleSubmit} disabled={loading}>
            🚀 Reserve My Spot
          </button>
          {error && <p style={{ color: '#f66', marginTop: '0.5rem' }}>{error}</p>}
        </div>
      )}

      {submitted && (
        <>
          <div className={styles.crtCard}>
            <h2 className={styles.crtTitle}>🔐 Felena Vision Tier Reserved</h2>
            <p className={styles.crtText}>
              You’ve just unlocked a one-time Operator class — <strong>Felena Vision</strong>.
              <br /><br />
              This isn’t a points app. This is a programmable XP grid with:
              <ul style={{ marginTop: '0.5rem' }}>
                <li>🎮 XP Casino: Slots, Blackjack, Crash, Heads/Tails, and more</li>
                <li>📈 Simulated sports betting with XP wager mechanics</li>
                <li>🎟 Lottery system with uplink-based jackpot splits</li>
                <li>📦 Crates that contain XP, badges, unlocks, or override triggers</li>
                <li>🧠 Kids Mode: real trade-based simulations (electric, drywall, culinary, tattoo, etc.)</li>
                <li>🧬 A live QR-based Uplink Chain that ties all referrals to system branches</li>
              </ul>
              <br />
              This system uses XP as a digital utility — not currency, not investment, not financial advice.
              <br />
              It’s a framework built in the grey areas of autonomy, behavioral finance, and legal structure.
              <br /><br />
              <em>This system was built in sacrifice. 4am mornings. Midnight commits. Concrete dust. No shortcuts. No help.</em>
              <br /><br />
              If you're reading this and understand what's here — you belong inside.
            </p>
          </div>

          <div className={styles.crtCard} style={{ background: '#111', border: '1px solid #f80', marginTop: '1.5rem' }}>
            <h3 className={styles.crtTitle}>🔥 100 Felena Vision Slots</h3>
            <p className={styles.crtText}>
              The first 100 operators will be permanently marked. This tier will not reopen.
            </p>
          </div>

          <div className={styles.crtCard} style={{ background: '#0a0a0a', border: '1px solid #0ff', marginTop: '2rem' }}>
            <h3 className={styles.crtTitle}>📚 Youth Learning Pathways</h3>
            <p className={styles.crtText}>
              Felena Theory includes a fully interactive Kids Grid, where minors can play educational career simulations across 25 real-world trades — electric, drywall, culinary, tattoo, security, etc.
              <br /><br />
              All youth accounts are gated behind guardian consent (COPPA compliant), with XP activity isolated and monitored.
              Guardians retain full access to progress logs and payout locks.
              <br /><br />
              A <strong>70/30 model</strong> powers family-linked success: 70% of all earned XP from youth gameplay stays with the child, while 30% is pooled under the guardian's bonus structure — enabling shared incentives without financial exploitation.
            </p>
          </div>

          <div className={styles.crtCard} style={{ background: '#0a0a0a', border: '1px solid #0f0', marginTop: '2rem' }}>
            <h3 className={styles.crtTitle}>💸 XP, Payouts, and The Algorithmic Bridge</h3>
            <p className={styles.crtText}>
              This system does not sell stock, tokens, or investment contracts.
              <br />
              Instead, Operators earn XP by playing games, completing simulations, referring others, or performing internal actions.
              XP can be redeemed for algorithmic unlocks and access events.
              <br /><br />
              The cashout logic is handled through a bridge — XP unlocks algorithmic trading executions via secure integrations (e.g. Alpaca, Polygon).
              These are user-initiated, legally sandboxed, and non-custodial.
              <br /><br />
              You are not depositing funds. You are triggering internal XP-based simulations that function through decentralized infrastructure.
            </p>
          </div>

          {referral_code && (
            <p className={styles.crtText} style={{ color: '#9f9', marginTop: '1rem' }}>
              Referral Uplink Detected: {referral_code}
              <br />If valid, both you and your uplink will earn a bonus crate.
            </p>
          )}
        </>
      )}

      <div className={styles.crtScrollBox} style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#999' }}>
        <p>⚡ Felena Vision Operators receive:</p>
        <ul>
          <li>🎖 One-time Vision Badge</li>
          <li>📦 Rare XP Crate Drop</li>
          <li>🔓 Tier 1 Engine + Grid Access</li>
          <li>🧬 Personalized Keycard Identity</li>
        </ul>
        <p className="italic mt-4">$100 unlock — claim permanently linked access.</p>
      </div>
    </div>
  );
}