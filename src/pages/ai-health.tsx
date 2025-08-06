import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

const agents = [
  { id: 'echomind', name: 'Echo' },
  { id: 'vanta', name: 'Vanta' },
  { id: 'synapse', name: 'Synapse' },
  { id: 'archivus', name: 'Archivus' },
  { id: 'delta', name: 'Delta' },
  { id: 'citadel', name: 'Citadel' },
  { id: 'vector', name: 'Vector' },
  { id: 'orion', name: 'Orion' },
  { id: 'cycle', name: 'Cycle' }
];

function AIHealthMonitor() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [lastCheck, setLastCheck] = useState(Date.now());

  const fetchLatest = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('user_id, timestamp')
      .in('user_id', agents.map(a => a.id))
      .order('timestamp', { ascending: false });

    if (!error) {
      setLogs(data);
      const critical = [];
      const now = Date.now();

      agents.forEach(({ id, name }) => {
        const last = data.find(l => l.user_id === id);
        const ts = last ? new Date(last.timestamp).getTime() : null;
        const delta = ts ? now - ts : null;

        if (!ts || delta > 1000 * 60 * 60 * 6) {
          critical.push(`⚠️ ${name} has not been active in 6+ hours.`);
        }
      });

      if (critical.length > 0) {
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in ai-health.tsx', error);
  }
          user_id: 'cycle',
          action: `AI Health Alert: ${critical.join(' | ')}`,
          timestamp: new Date().toISOString()
        });
      }

      setAlerts(critical);
    }

    setLastCheck(Date.now());
    setLoading(false);
  };

  const getStatus = (lastTime: string | null) => {
    if (!lastTime) return '❌ No Activity';
    const delta = Date.now() - new Date(lastTime).getTime();
    if (delta < 1000 * 60 * 15) return '🟢 Active';
    if (delta < 1000 * 60 * 60) return '🟡 Idle';
    return '🔴 Unresponsive';
  };

  const getLastSeen = (id: string) => {
    const match = logs.find(l => l.user_id === id);
    return match ? new Date(match.timestamp).toLocaleString() : null;
  };

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 300000); // every 5 min
    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  return (
    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>EchoMind AI Health Monitor</h1>
      <p className={styles.crtText}>Last Check: {new Date(lastCheck).toLocaleTimeString()}</p>

      {loading ? (
        <p className={styles.crtText}>Loading status...</p>
      ) : (
        <>
          {alerts.length > 0 && (
            <div className={styles.crtCard}>
              <h2>⚠️ Health Alerts</h2>
              {alerts.map((a, i) => (
                <p key={i} className={styles.crtText}>{a}</p>
              ))}
            </div>
          )}

          <div className={styles.crtScrollBox}>
            {agents.map((a, i) => {
              const last = getLastSeen(a.id);
              return (
                <pre key={i} className={styles.crtText}>
                  🤖 {a.name} [{a.id}]
                  {'\n'}Last Seen: {last || '—'}
                  {'\n'}Status: {getStatus(last)}
                </pre>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default withAdminGate(AIHealthMonitor);