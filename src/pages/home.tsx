// pages/home.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import Link from 'next/link';

function ObserverHome() {
export default withGuardianGate(Page);
  const [alias, setAlias] = useState('Operator');
  const [xp, setXP] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [tier, setTier] = useState('Observer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;
    const userId = user.user.id;
  try {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
  } catch (error) {
    console.error('❌ Supabase error in home.tsx', error);
  }
    if (!data) return;
    setAlias(data.alias || 'Operator');
    setXP(data.xp || 0);
    setReferralCode(data.referral_code || '');
    setTier(getTierFromXP(data.xp || 0));
    setLoading(false);
  };

  const getTierFromXP = (xp: number) => {
    if (xp >= 100000) return 'Tier 17: Quantum Architect';
    if (xp >= 75000) return 'Tier 16: Ascendant';
    if (xp >= 50000) return 'Tier 15: Final Ascension';
    if (xp >= 25000) return 'Tier 14: Visionary';
    if (xp >= 20000) return 'Tier 13: Conductor';
    if (xp >= 15000) return 'Tier 12: Tactician';
    if (xp >= 10000) return 'Tier 11: Legendary';
    if (xp >= 5000) return 'Tier 10: Override';
    if (xp >= 2500) return 'Tier 9: Commander';
    if (xp >= 1000) return 'Tier 8: Operator';
    if (xp >= 500) return 'Tier 7: Prototype';
    if (xp >= 250) return 'Tier 6: Apprentice';
    if (xp >= 100) return 'Tier 5: Initiate';
    if (xp >= 50) return 'Tier 4: Connected';
    if (xp >= 20) return 'Tier 3: Linked';
    if (xp >= 10) return 'Tier 2: Registered';
    if (xp >= 5) return 'Tier 1: Witness';
    return 'Tier 0: Observer';
  };

  if (loading) return <div className={styles.crtScreen}><h2>⏳ Loading system...</h2></div>;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🛰 Welcome, {alias}</h1>
      <p className={styles.crtText}>Current XP: <strong>{xp.toLocaleString()} XP</strong></p>
      <p className={styles.crtText}>Your Access Tier: <strong>{tier}</strong></p>
      <p className={styles.crtText}>Referral Code: <code>{referralCode}</code></p>
      <p className={styles.crtText}>Use this key to connect others to your Uplink Chain.</p>

      <div className={styles.crtCard}>
        <h2 className={styles.crtTitle}>🎟️ Ready to Upgrade?</h2>
        <p className={styles.crtText}>Preorder access to the Felena Vision tier. First 100 Operators are permanently marked.</p>
        <Link href="/preorder" className={styles.crtButton}>🚀 Join Felena Vision</Link>
      </div>

      <div className={styles.crtCard}>
        <h2 className={styles.crtTitle}>📚 Learn More</h2>
        <ul className={styles.crtText}>
          <li><Link href="/keycard">🧬 Your Keycard</Link></li>
          <li><Link href="/terms">📜 XP Terms & Policy</Link></li>
          <li><Link href="/xp-hub">🎰 Explore XP Games & Shop</Link></li>
        </ul>
      </div>

      <div className={styles.crtCard}>
        <h2 className={styles.crtTitle}>🌐 System Intel</h2>
        <p className={styles.crtText}>Track system upgrades, explore the Uplink chain, and witness the grid come online.</p>
        <Link href="/observer-dashboard" className={styles.crtButton}>🛰 Observer Dashboard</Link>
      </div>

      <div className={styles.scanlines}></div>
    </div>
  );
}