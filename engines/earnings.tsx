 // pages/earnings.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';

function EarningsPage() {
export default withGuardianGate(Page);
  const [xpTotal, setXpTotal] = useState(0);
  const [xpByType, setXpByType] = useState<Record<string, number>>({});

  useEffect(() => {
    playSound('xp-rain');

    const fetchEarnings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('xp_history')
        .select('type, amount')
        .eq('user_id', user.id);

      const byType: Record<string, number> = {};
      let total = 0;

      data?.forEach((log) => {
        total += log.amount;
        if (!byType[log.type]) byType[log.type] = 0;
        byType[log.type] += log.amount;
      });

      setXpTotal(total);
      setXpByType(byType);
    };

    fetchEarnings();
  }, []);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📊 TOTAL XP EARNED</h2>
      <p style={{ fontSize: '2rem', color: '#00ff99', margin: '1rem 0' }}>{xpTotal} XP</p>

      <h3 style={{ marginTop: '2rem' }}>🔎 Breakdown</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {Object.entries(xpByType).map(([type, amt]) => (
          <li key={type} style={{ marginBottom: '0.5rem' }}>
            <strong>{type.replace(/_/g, ' ').toUpperCase()}</strong>: {amt} XP
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: '2rem' }}>📈 ROI Progress</h3>
      <div style={{ background: '#111', border: '1px solid #00ff99', height: '20px', width: '100%' }}>
        <div
          style={{
            width: `${Math.min(xpTotal / 1000, 1) * 100}%`,
            height: '100%',
            background: '#00ff99',
            transition: 'width 0.5s',
          }}
        />
      </div>
      <p style={{ fontSize: '0.8em', color: '#aaa', marginTop: '0.5rem' }}>
        {xpTotal}/1000 XP toward next unlock
      </p>
    </div>
  );
}