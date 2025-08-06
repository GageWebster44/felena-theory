// pages/badges/public.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import badgeList from '@/data/badgeList';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';

function PublicBadgesPage() {
export default withGuardianGate(Page);
  const [holders, setHolders] = useState<{ [label: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBadgeCounts();
  }, []);

  const fetchBadgeCounts = async () => {
  try {
    const { data } = await supabase.from('user_badges').select('label');
  } catch (error) {
    console.error('❌ Supabase error in public.tsx', error);
  }
    const counts = badgeList.reduce((acc, badge) => {
      acc[badge.label] = data?.filter((b) => b.label === badge.label).length || 0;
      return acc;
    }, {} as Record<string, number>);
    setHolders(counts);
    setLoading(false);
  };

  if (loading) return <div className={styles.crtScreen}><h2>🔄 Loading badges...</h2></div>;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🏅 Felena Badge Archive</h1>
      <p className={styles.crtText}>Public showcase of all available badges in the XP Grid.</p>
      <div className={styles.crtGridResponsive}>
        {badgeList.map((badge, i) => {
          const slug = badge.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
          return (
            <div key={i} className={styles.crtCard} style={{ textAlign: 'center' }}>
              <img src={`/badges/${slug}.png`} alt={badge.label} style={{ width: '64px', height: '64px' }} />
              <h3>{badge.label}</h3>
              <p className={styles.crtText}>{badge.desc}</p>
              <p className={styles.crtText} style={{ fontSize: '0.75rem', color: '#0f0' }}>Held by {holders[badge.label] || 0} operator(s)</p>
            </div>
          );
        })}
      </div>
      <p className={styles.crtText} style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#888' }}>
        🔓 This page is public. Badge counts update dynamically.
      </p>
    </div>
  );
}