import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

function AgentTasks() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('user_id', [
        'echomind', 'vanta', 'synapse', 'archivus',
        'delta', 'citadel', 'vector', 'orion', 'cycle'
      ])
      .order('timestamp', { ascending: false })
      .limit(300);
    if (!error) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = filter
    ? logs.filter(log => JSON.stringify(log).toLowerCase().includes(filter.toLowerCase()))
    : logs;

  const csvExport = logs.map(l => ({
    timestamp: l.timestamp,
    agent: l.user_id,
    action: l.action
  }));

  const typeTag = (text: string) => {
    if (text.includes('banned')) return '⛔';
    if (text.toLowerCase().includes('flag')) return '🚨';
    if (text.toLowerCase().includes('locked xp')) return '🔒';
    if (text.toLowerCase().includes('case')) return '📂';
    if (text.toLowerCase().includes('alert')) return '📢';
    if (text.toLowerCase().includes('export')) return '📦';
    return '⚙️';
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>EchoMind AI Task Log</h1>

      <div className={styles.crtMenu}>
        <input
          type="text"
          placeholder="Filter tasks..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.crtInput}
        />
        <CSVLink data={csvExport} filename="ai_tasks_export.csv" className={styles.crtButton}>
          Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <p className={styles.crtText}>Loading tasks...</p>
      ) : (
        <div className={styles.crtScrollBox}>
          {filtered.map((log, i) => (
            <pre key={i} className={styles.crtLogBlock}>
              {typeTag(log.action)} {log.user_id} — {new Date(log.timestamp).toLocaleString()}
              {'\n'}{log.action}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminGate(AgentTasks);