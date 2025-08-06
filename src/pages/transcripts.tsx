import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

interface Tier {
  label: string;
  minXP: number;
  description: string;
}

function XPTiersPage() {
export default withGuardianGate(Page);
  const [userXP, setUserXP] = useState(0);
  const [currentTier, setCurrentTier] = useState('');

  const tiers: Tier[] = [
    { minXP: 100000, label: 'Tier 17: Quantum Architect', description: 'Ascend the simulation. Full override control.' },
    { minXP: 75000, label: 'Tier 16: Ascendant', description: 'System control node.' },
    { minXP: 50000, label: 'Tier 15: Final Ascension', description: 'Rare crate + Engine unlock.' },
    { minXP: 25000, label: 'Tier 14: Visionary', description: 'Crate + dashboard access.' },
    { minXP: 20000, label: 'Tier 13: Conductor', description: 'Sim integration access.' },
    { minXP: 15000, label: 'Tier 12: Tactician', description: 'Override mode access.' },
    { minXP: 10000, label: 'Tier 11: Legendary', description: 'Badge + leaderboard tier.' },
    { minXP: 5000, label: 'Tier 10: Override', description: 'Access to DAO voting + engine grid.' },
    { minXP: 2500, label: 'Tier 9: Commander', description: 'Control multiple referral branches.' },
    { minXP: 1000, label: 'Tier 8: Operator', description: 'System-wide access. Full crate unlocks.' },
    { minXP: 500, label: 'Tier 7: Prototype', description: 'Unlock Kids Grid + Starter Engines.' },
    { minXP: 250, label: 'Tier 6: Apprentice', description: 'Daily crates and skill missions.' },
    { minXP: 100, label: 'Tier 5: Initiate', description: 'Access XP Hub + core games.' },
    { minXP: 50, label: 'Tier 4: Connected', description: 'Referral chain bonus + invites.' },
    { minXP: 20, label: 'Tier 3: Linked', description: 'Basic crate drop access.' },
    { minXP: 10, label: 'Tier 2: Registered', description: 'Intro simulation access.' },
    { minXP: 5, label: 'Tier 1: Witness', description: 'Entered the grid.' },
    { minXP: 0, label: 'Tier 0: Observer', description: 'No XP yet. Observe and learn.' },
  ];

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  try {
    const { data } = await supabase.from('user_profiles').select('xp').eq('id', user.id).single();
  } catch (error) {
    console.error('❌ Supabase error in transcripts.tsx', error);
  }
      const xp = data?.xp || 0;
      setUserXP(xp);
      const tier = tiers.find(t => xp >= t.minXP)?.label || 'Unranked';
      setCurrentTier(tier);
    };
    load();
  }, []);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>📈 XP Tier Directory</h1>
      <p className={styles.crtText}>Your XP: {userXP.toLocaleString()} XP</p>
      <p className={styles.crtText}>Current Tier: <strong>{currentTier}</strong></p>

      <div className={styles.crtScrollBox}>
        {tiers.map((tier, i) => (
          <div key={i} className={styles.crtCard} style={{ marginBottom: '1rem' }}>
            <h3 className={styles.crtTitle}>{tier.label}</h3>
            <p className={styles.crtText}><strong>XP Required:</strong> {tier.minXP.toLocaleString()}</p>
            <p className={styles.crtText}><strong>Description:</strong> {tier.description}</p>
          </div>
        ))}
      </div>

      <div className={styles.scanlines}></div>
    </div>
  );
}
// pages/transcript.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { useRouter } from 'next/router';

function TranscriptPage() {
export default withGuardianGate(Page);
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

  try {
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
  } catch (error) {
    console.error('❌ Supabase error in transcripts.tsx', error);
  }
      if (!profile) return router.push('/login');
      setProfile(profile);

  try {
    await supabase.from('cert_views').insert({
  } catch (error) {
    console.error('❌ Supabase error in transcripts.tsx', error);
  }
        user_id: user.id,
        cert_type: 'transcript',
        viewed_at: new Date().toISOString()
      });

  try {
    const { data: entries } = await supabase.from('xp_log').select('*').eq('user_id', user.id).order('timestamp', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in transcripts.tsx', error);
  }
      setLogs(entries || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className={styles.crtScreen}><h2>📜 Loading Transcript...</h2></div>;

  return (
    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>📜 Operator Transcript</h1>
      <p className={styles.crtText}>This document displays your complete XP event history.</p>

      <div className={styles.crtScrollBox}>
        {logs.map((log, i) => (
          <div key={i} className={styles.crtCard}>
            <p><strong>{log.reason}</strong> — {log.amount > 0 ? '+' : ''}{log.amount} XP</p>
            <p style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(log.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}