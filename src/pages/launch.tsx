// pages/launch.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import Head from 'next/head';
import styles from '@/styles/crtLaunch.module.css';
import CRTBootFX from '@/components/CRTBootFX';
import { useRouter } from 'next/router';

function LaunchPage() {
export default withGuardianGate(Page);
  const [booted, setBooted] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch('/api/felena-vision-count')
      .then(res => res.json())
      .then(data => {
        setCount(data?.count || 0);
        setIsFull(data?.isFull || false);

        if (data?.isFull) {
          setTimeout(() => router.push('/waitlist'), 2500);
        }
      });
  }, []);

  const handleEnter = () => {
    router.push('/preorder');
  };

  if (!booted) return <CRTBootFX text="Initializing Felena Grid Launch Protocol..." />;

  return (
    <div className={styles.crtScreen}>
      <Head>
        <title>Felena Theory Launch Mode</title>
        <meta
          name="description"
          content="Felena Theory: a quantum XP grid for education, casino games, crates, referrals, and algorithmic market engines. Launch mode now active."
        />
      </Head>

      <h1 className={styles.crtTitle}>🧬 FELENA THEORY: LAUNCH MODE</h1>
      <p className={styles.crtText}>
        This is not a financial app. This is a quantum learning and payout grid,
        designed to reward behavior, referrals, education, and autonomous logic execution.
      </p>

      <ul className={styles.crtText} style={{ marginTop: '2rem' }}>
        <li>🎮 Play XP Slots, Blackjack, Crash, Roulette</li>
        <li>📦 Unlock Crates and Algorithmic Engines</li>
        <li>📚 Kids Mode: Learn-to-earn trade simulations</li>
        <li>🔓 Enter via QR-based Uplink Chains</li>
        <li>📈 XP triggers real market simulations</li>
      </ul>

      <div className={styles.crtCard} style={{ marginTop: '2rem', border: '1px solid #0ff' }}>
        <h3 className={styles.crtTitle}>🔥 Felena Vision Class</h3>
        <p className={styles.crtText}>
          Felena Vision is a one-time-only access tier.
          <br /> Only 100 will be admitted.
          <br /> Status: {count === null ? '...' : isFull ? '⛔ Full' : `${100 - count} slots left`}
        </p>
      </div>

      {!isFull && (
        <div className={styles.crtMenu}>
          <button className={styles.crtButton} onClick={handleEnter}>
            🚀 Request Access
          </button>
        </div>
      )}

      {isFull && (
        <div className={styles.crtText} style={{ color: '#f66', marginTop: '1rem' }}>
          ⛔ Felena Vision preorders are now closed. Redirecting to waitlist...
        </div>
      )}
    </div>
  );
}