import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { format } from 'date-fns';
import RouteGuard from '@/components/RouteGuard';
import { downloadCSV } from '@/utils/exportCSV';

interface MissionLogEntry {
  id: string;
  type: string;
  description: string;
  amount: number;
  created_at: string;
}

function MissionLogContent() {
  const [logs, setLogs] = useState<MissionLogEntry[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('xp_history')
        .select('*')
        .eq('user_id', user.id)
        .ilike('type', 'mission_%')
        .order('created_at', { ascending: false });

      setLogs(data || []);
    })();
  }, []);

  const handleExport = () => downloadCSV(logs, 'mission_log_export');

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📚 MISSION XP LOG</h2>
      <p>Chronological feed of completed XP missions and earned values.</p>
      <button className={styles.crtButton} onClick={handleExport}>📤 Export CSV</button>

      {logs.length === 0 ? (
        <p>📭 No mission logs found.</p>
      ) : (
        <ul style={{ marginTop: '2rem' }}>
          {logs.map((log) => (
            <li key={log.id} className={styles.xpLogRow}>
              <p><strong>{log.description}</strong></p>
              <p style={{ color: '#0f0' }}>+{log.amount} XP</p>
              <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{format(new Date(log.created_at), 'PPpp')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MissionLogPage() {
export default withGuardianGate(Page);
  return (
    <RouteGuard allowedRoles={['admin', 'developer']}>
      <MissionLogContent />
    </RouteGuard>
  );
}