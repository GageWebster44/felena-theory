// pages/audit-dashboard.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import Fuse from 'fuse.js';
import { CSVLink } from 'react-csv';

function AuditDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [type, setType] = useState('all');
  const [frozenCount, setFrozenCount] = useState<number>(0);

  useEffect(() => {
    loadLogs();
    loadFrozen();
  }, [type]);

  const loadLogs = async () => {
    let query = supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (type !== 'all') query = query.ilike('action', `%${type}%`);
    const { data } = await query;
    setLogs(data || []);
  };

  const loadFrozen = async () => {
  try {
    const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('status', 'frozen');
  } catch (error) {
    console.error('❌ Supabase error in audit-dashboard.tsx', error);
  }
    setFrozenCount(count || 0);
  };

  const filteredLogs = filter
    ? new Fuse(logs, {
        keys: ['user_id', 'action'],
        threshold: 0.3
      }).search(filter).map(r => r.item)
    : logs;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Audit Control Center</h1>
      <p className={styles.crtText}>🧊 Frozen Accounts: {frozenCount}</p>

      <div className={styles.crtMenu}>
        <select value={type} onChange={e => setType(e.target.value)} className={styles.crtInput}>
          <option value="all">All Logs</option>
          <option value="XP">XP Events</option>
          <option value="Badge">Badge Actions</option>
          <option value="Guardian">Guardian Reviews</option>
          <option value="Override">Overrides</option>
          <option value="Bulk">Bulk Injections</option>
        </select>
        <input
          placeholder="Search actions..."
          className={styles.crtInput}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <CSVLink data={filteredLogs} filename="audit_log_export.csv" className={styles.crtButton}>Export CSV</CSVLink>
      </div>

      <div className={styles.crtScrollBox}>
        {filteredLogs.map((log, i) => (
          <pre key={i} style={{ color: log.action.includes('⚠️') ? '#f66' : '#ccc' }}>
            {log.timestamp} — {log.user_id} → {log.action}
          </pre>
        ))}
      </div>
    </div>
  );
}

export default withAdminGate(AuditDashboard);