// pages/promotion-log.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { createClient } from '@supabase/supabase-js';
import styles from '@/styles/crtLaunch.module.css';
import { format } from 'date-fns';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PromotionLog {
  id: string;
  user_id: string;
  old_status: string;
  new_status: string;
  promoted_by: string;
  timestamp: string;
  username?: string;
}

function PromotionLogPage() {
export default withGuardianGate(Page);
  const [logs, setLogs] = useState<PromotionLog[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'new_status'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data: logsData, error } = await supabase
      .from('employee_promotions')
      .select('*');

    const { data: profiles } = await supabase
      .from('user_profile')
      .select('id, username');

    const enriched = logsData?.map((log: PromotionLog) => {
      const profile = profiles?.find((p) => p.id === log.user_id);
      return {
        ...log,
        username: profile?.username || 'Unknown',
      };
    });

    setLogs(enriched || []);
  }

  function handleExportCSV() {
    const headers = ['Username', 'Old Status', 'New Status', 'Promoted By', 'Timestamp'];
    const rows = logs.map(log => [
      log.username,
      log.old_status,
      log.new_status,
      log.promoted_by,
      format(new Date(log.timestamp), 'PPP p')
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'promotion_log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter((log) => log.new_status === filter);

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return sortOrder === 'asc'
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return sortOrder === 'asc'
        ? a.new_status.localeCompare(b.new_status)
        : b.new_status.localeCompare(a.new_status);
    }
  });

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>Promotion Log</h1>
      <p>Total Promotions: {sortedLogs.length}</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Filter by Role: </label>
          <select
            className={styles.crtInput}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="mechanic">Mechanic</option>
            <option value="brain">Brain</option>
            <option value="virus">Virus</option>
            <option value="guardian">Guardian</option>
            <option value="apprentice">Apprentice</option>
            <option value="associate">Associate</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label>Sort By: </label>
          <select
            className={styles.crtInput}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="timestamp">Date</option>
            <option value="new_status">Role</option>
          </select>
        </div>

        <div>
          <label>Order: </label>
          <select
            className={styles.crtInput}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <button className={styles.crtButton} onClick={handleExportCSV}>
          Export CSV
        </button>
      </div>

      <div className={styles.overrideLog}>
        {sortedLogs.map((log) => (
          <div key={log.id} className={styles.xpLogRow}>
            <strong>{log.username}</strong> was promoted from{' '}
            <span style={{ color: '#f44' }}>{log.old_status}</span> →{' '}
            <span style={{ color: '#0f0' }}>{log.new_status}</span><br />
            Approved by: <code>{log.promoted_by}</code><br />
            <small>{format(new Date(log.timestamp), 'PPP p')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}