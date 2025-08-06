mport { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import getCrateHistory from '@/utils/crateHistory';
import getTodayXP from '@/utils/dailyLogger';
import OperatorConsole from '@/components/OperatorConsole';

export default function DashboardPage() {
  const [xp, setXP] = useState(0);
  const [connects, setConnects] = useState(0);
  const [engines, setEngines] = useState(0);
  const [alias, setAlias] = useState('Operator');
  const [dev, setDev] = useState(false);
  const [crateCount, setCrateCount] = useState(0);
  const [todayXP, setTodayXP] = useState(0);
  const [override, setOverride] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  const load = async (silent = false) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.id) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, alias, xp, devkey, role')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    // 🔒 Felena Vision Role Guard
    if (profile.role !== 'felena_vision' && !profile.devkey) {
      router.push('/preorder');
      return;
    }

    setXP(profile.xp || 0);
    setAlias(profile.alias || 'Operator');
    setDev(profile.devkey || false);

    const { data: refData } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', user.id);
    setConnects(refData?.length || 0);

    const { data: engineData } = await supabase
      .from('unlocked_engines')
      .select('id')
      .eq('user_id', user.id);
    setEngines(engineData?.length || 0);

    const history = await getCrateHistory(user.id);
    setCrateCount(history?.length || 0);

    const today = await getTodayXP(user.id);
    setTodayXP(today || 0);

    const { data: flag } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'enable_override')
      .single();
    setOverride(flag?.value === 'true');

    if (!silent) playSound('boot-success');
    setLoading(false);
  };

  if (loading) return <div className={styles.crtScreen}><h2>🔄 Loading Dashboard...</h2></div>;

  return (
    <div className={styles.crtScreen}>
      <h2>📊 DASHBOARD</h2>
      <p>🧠 Operator status report & system core info.</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>🪪 Identity</h3>
        <p><strong>Alias:</strong> {alias}</p>
        <p><strong>Role:</strong> {dev ? '🧠 DEV / SYSTEM' : '🟠 FELENA VISION'}</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📈 System Stats</h3>
        <ul>
          <li>🔓 Engines Unlocked: <strong>{engines}</strong></li>
          <li>📦 Crates Claimed: <strong>{crateCount}</strong></li>
          <li>⚡ XP Today: <strong>{todayXP}</strong></li>
          <li>🌐 Connects: <strong>{connects}</strong></li>
          <li>💎 Total XP: <strong>{xp}</strong></li>
          <li>🚨 Override Mode: <strong>{override ? '🟢 ACTIVE' : '🔴 OFF'}</strong></li>
        </ul>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <OperatorConsole />
      </div>
    </div>
  );
}