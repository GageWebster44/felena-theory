// pages/admin-utils.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function AdminUtils() {
  const [envVars, setEnvVars] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    log(`🔐 Admin Utilities Console Loaded`);
    fetchEnv();
  }, []);

  const fetchEnv = () => {
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      STRIPE_SECRET_KEY: mask(process.env.STRIPE_SECRET_KEY),
      STRIPE_WEBHOOK_SECRET: mask(process.env.STRIPE_WEBHOOK_SECRET),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    log('✅ Env variables loaded');
  };

  const mask = (val?: string) => {
    if (!val) return 'undefined';
    return val.slice(0, 4) + '•••' + val.slice(-4);
  };

  const log = (msg: string) => setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const clearLogs = () => setLogs([]);

  const simulatePurge = async () => {
    log('🧹 Simulated purge trigger');
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-utils.tsx', error);
  }
      user_id: 'system',
      action: '⚠️ Admin simulated purge executed',
      timestamp: new Date().toISOString(),
    });
    log('✅ Purge complete');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🛠️ Admin Utilities Panel</h1>
      <p className={styles.crtText}>Run final QA tasks and inspect live environment state.</p>

      <h2 className={styles.crtTitle}>🌐 ENV Vars</h2>
      <ul className={styles.crtText}>
        {Object.entries(envVars).map(([key, val]) => (
          <li key={key}><strong>{key}:</strong> <span className="text-yellow-400">{val}</span></li>
        ))}
      </ul>

      <h2 className={styles.crtTitle}>🧪 Tools</h2>
      <div className={styles.crtMenu}>
        <button className={styles.crtButton} onClick={fetchEnv}>🔁 Reload Env</button>
        <button className={styles.crtButton} onClick={simulatePurge}>⚠️ Simulate Purge</button>
        <button className={styles.crtButton} onClick={clearLogs}>🧹 Clear Log</button>
      </div>

      <div className={styles.crtCard}>
        <h3 className={styles.crtTitle}>🧾 Session Log</h3>
        <div className={styles.crtScrollBox}>
          {logs.length === 0 ? <p className={styles.crtText}>No logs yet.</p> : logs.map((line, i) => <p key={i}>{line}</p>)}
        </div>
      </div>
    </div>
  );
}

export default withAdminGate(AdminUtils);