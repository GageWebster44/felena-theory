// pages/xp-center.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import triggerXPBurst from '@/utils/triggerXPBurst';
import { loadCSV } from '@/utils/exportCSV';

interface Crate {
  id: string;
  label: string;
  xp_value: number;
  opened: boolean;
  created_at: string;
  source?: 'shop' | 'referral' | 'mission' | 'admin';
}

function XPCenterPage() {
export default withGuardianGate(Page);
  const [crates, setCrates] = useState<Crate[]>([]);
  const [history, setHistory] = useState<Crate[]>([]);
  const [message, setMessage] = useState('');
  const [xpBalance, setXPBalance] = useState<number>(0);
  const [lockedXP, setLockedXP] = useState<number>(0);
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    loadCrates();
    loadXP();
  }, []);

  const loadXP = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.user.id);

    const { data } = await supabase
      .from('user_profiles')
      .select('xp, locked_xp, role')
      .eq('id', user.user.id)
      .single();

    if (data) {
      setXPBalance(data.xp);
      setLockedXP(data.locked_xp || 0);
      setUserRole(data.role);
    }
  };

  const loadCrates = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('xp_crates')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCrates(data.filter((c) => !c.opened));
      setHistory(data.filter((c) => c.opened).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  };

  const openCrate = async (crate: Crate) => {
    await supabase
      .from('xp_crates')
      .update({ opened: true })
      .eq('id', crate.id);

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in xp-center.tsx', error);
  }
      user_id: userId,
      amount: crate.xp_value,
      type: 'xp_crate',
      reason: `crate_open: ${crate.label}`,
      timestamp: new Date().toISOString(),
      season: 1,
    });

    playSound('xp-rain');
    triggerXPBurst();
    setMessage(`+${crate.xp_value} XP crate`);
    await loadCrates();
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🎁 XP CENTER</h2>
      <p>View your unopened XP crates and reward history here.</p>

      <section style={{ border: '1px solid #0ff', padding: '1rem', marginTop: '1rem' }}>
        <h3>📦 Unopened Crates</h3>
        <ul style={{ marginLeft: '1rem' }}>
          {crates.map((crate) => (
            <li key={crate.id}>
              <em>{crate.label}</em> from <strong>{crate.source}</strong>
              <button onClick={() => openCrate(crate)} className={styles.crtButton}>Open Crate</button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>🎞 Reward History</h3>
        <ul style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          {history.map((crate) => (
            <li key={crate.id}>
              <span style={{ color: '#0ff' }}>{crate.label}</span> → +{crate.xp_value} XP
              <span style={{ color: '#666' }}> from {crate.source || 'Unknown'} @ {new Date(crate.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>

      {message && (
        <p style={{ marginTop: '2rem', fontSize: '1.25rem', color: '#00ff99' }}>
          ✅ <strong>{message}</strong>
        </p>
      )}
    </div>
  );
}