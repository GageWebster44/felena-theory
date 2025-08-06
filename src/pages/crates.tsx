// pages/crates.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const crateTiers = {
  common: { label: 'Common', color: '#ccc' },
  rare: { label: 'Rare', color: '#33f' },
  epic: { label: 'Epic', color: '#a0f' },
  legendary: { label: 'Legendary', color: '#f80' },
  mythic: { label: 'Mythic', color: '#f00' }
};

export default withGuardianGate(function CratesPage() {
  const [crates, setCrates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCrates();
  }, []);

  const loadCrates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('xp_crates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setCrates(data || []);
    setLoading(false);
  };

  if (loading) return <div className={styles.crtScreen}><h2>🔄 Loading your crates...</h2></div>;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>📦 Your XP Crates</h1>
      <div className={styles.crtGridResponsive}>
        {crates.length === 0 ? (
          <p className={styles.crtText}>You don’t have any crates yet. Earn them through missions, referrals, or grid unlocks.</p>
        ) : (
          crates.map((crate, i) => {
            const tier = crate.tier?.toLowerCase();
            const meta = crateTiers[tier] || { label: 'Unknown', color: '#999' };
            return (
              <div key={i} className={styles.crtCard} style={{ borderColor: meta.color }}>
                <h3>{meta.label} Crate</h3>
                <p className={styles.crtText}>Source: {crate.source}</p>
                <p className={styles.crtText}>XP: {crate.xp_value}</p>
                <p className={styles.crtText}>Opened: {crate.opened ? '✅' : '❌'}</p>
                <p className={styles.crtText} style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(crate.created_at).toLocaleString()}</p>
              </div>
            );
          })
        )}
      </div>
      <p className={styles.crtText} style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#666' }}>
        💡 Crates are unlocked automatically when XP milestones are met or triggered by system rewards.
      </p>
    </div>
  );
});