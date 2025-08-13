// pages/observer.tsx
import { useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { useRouter } from 'next/router';
import { logObserverVisit } from '@/utils/observer-tracker';

function ObserverPage() {
export default withGuardianGate(Page);
  const router = useRouter();

  useEffect(() => {
    logObserverVisit();
  }, []);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>👁️ Observer Access Mode</h1>
      <p className={styles.crtText}>
        You’re exploring the public layer of the Felena Grid.
        <br /> Operator status requires verification, badge access, or a valid invite chain.
      </p>

      <div className={styles.crtCard} style={{ marginTop: '2rem' }}>
        <p className={styles.crtText}>
          🎲 Preview Games: Slots, Crash, Blackjack, Roulette
          <br />
          📚 Kids Portal: View learning simulations
          <br />
          🧾 XP System: Crates, Quizzes, Grid Unlocks
        </p>
        <button className={styles.crtButton} onClick={() => router.push('/login')}>
          🔐 Authenticate to Enter
        </button>
      </div>

      <div className={styles.crtScrollBox}>
        <ul className={styles.crtText}>
          <li>💠 XP cannot be earned in Observer Mode</li>
          <li>🔓 XP Crates require full onboarding</li>
          <li>🚨 Referral Codes or Badges unlock Grid Tiers</li>
          <li>🧠 System is monitored by autonomous AI agents</li>
        </ul>
      </div>
    </div>
  );
}