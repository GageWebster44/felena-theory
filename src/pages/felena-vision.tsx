// pages/felena-vision.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

export default withGuardianGate(function FelenaVisionPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

  try {
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
  } catch (error) {
    console.error('❌ Supabase error in felena-vision.tsx', error);
  }
      if (!profile || profile.role !== 'felena_vision') return router.push('/unauthorized');

      setProfile(profile);
      setAuthorized(true);
      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) return <div className={styles.crtScreen}><h2>🔄 Verifying Felena Vision Access...</h2></div>;
  if (!authorized) return null;

  return (
    <div className={styles.crtScreen}>
      <Head>
        <title>Felena Vision Operator Portal</title>
        <meta name="description" content="Felena Vision Operator Portal — Exclusive access to XP casino, crates, kids simulations, and algorithmic engines." />
      </Head>

      <h1 className={styles.crtTitle}>🧬 FELENA VISION OPERATOR PORTAL</h1>
      <p className={styles.crtText}>
        Welcome, Vision-tier Operator. You now have access to the protected internals of the Felena Grid.
      </p>

      <div className={styles.crtCard}>
        <h2 className={styles.crtTitle}>🎮 Systems Unlocked</h2>
        <ul className={styles.crtText}>
          <li>📦 Exclusive Vision Crate System</li>
          <li>🎲 Casino: Blackjack, Slots, Crash, Heads/Tails</li>
          <li>📈 Algorithmic Simulation Launchpad</li>
          <li>🧠 Kids Grid: Career Sim Access</li>
          <li>📊 Real-time Engine Dashboard</li>
          <li>🧾 Verified XP Ledger + Redemptions</li>
        </ul>
      </div>

      <div className={styles.crtCard} style={{ marginTop: '1.5rem' }}>
        <h3 className={styles.crtTitle}>🔗 Your Role</h3>
        <p className={styles.crtText}>Felena Vision Operator</p>
        <p className={styles.crtText}>ID: {profile.username || profile.id}</p>
        <p className={styles.crtText}>XP: {profile.xp?.toLocaleString()} XP</p>
      </div>

      <div className={styles.crtCard} style={{ marginTop: '2rem', border: '1px solid #0ff' }}>
        <p className={styles.crtText}>
          🔐 This access is permanently logged. Abuse or attempts to duplicate your tier will result in blacklisting.
        </p>
      </div>

      <div className={styles.scanlines}></div>
    </div>
  );
});