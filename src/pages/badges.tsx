import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import badgeList from '@/data/badgeList';
import { supabase } from '@/utils/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';

function BadgesPage() {
export default withGuardianGate(Page);
  const [holders, setHolders] = useState<{ [label: string]: number }>({});
  const user = useUser();

  useEffect(() => {
    fetchBadgeCounts();
  }, []);

  const fetchBadgeCounts = async () => {
  try {
    const { data } = await supabase.from('user_badges').select('label');
  } catch (error) {
    console.error('❌ Supabase error in badges.tsx', error);
  }
    const counts = badgeList.reduce((acc, badge) => {
      acc[badge.label] = data?.filter((b) => b.label === badge.label).length || 0;
      return acc;
    }, {} as Record<string, number>);
    setHolders(counts);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🏅 All Available Badges</h1>
      <div className={styles.crtGridResponsive}>
        {badgeList.map((badge, i) => {
          const slug = badge.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
          return (
            <div key={i} className={styles.crtCard} style={{ textAlign: 'center' }}>
              <img src={`/badges/${slug}.png`} alt={badge.label} style={{ width: '64px', height: '64px' }} />
              <h3>{badge.label}</h3>
              <p className={styles.crtText}>{badge.desc}</p>
              <p className={styles.crtText}>Held by {holders[badge.label] || 0} user(s)</p>
              {user?.user?.user_metadata?.role === 'admin' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Link href="/grant" className={styles.crtButton}>🎁 Grant</Link>
                  <Link href="/revoke" className={styles.crtButton}>🧯 Revoke</Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}