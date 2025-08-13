// pages/invite-log.tsx
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { CSVLink } from 'react-csv';

interface InviteRedemption {
  id: string;
  invite_code: string;
  user_id: string;
  user_email: string;
  claimed_at: string;
}

function InviteLogPage() {
  const [logs, setLogs] = useState<InviteRedemption[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('invite_redemptions')
      .select('*')
      .order('claimed_at', { ascending: false });
    setLogs(data || []);
  };

  const filteredLogs = filter
    ? logs.filter((log) =>
        log.invite_code?.toLowerCase().includes(filter.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(filter.toLowerCase()) ||
        log.user_id?.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>📜 Invite Redemption Log</h1>

      <input
        className={styles.crtInput}
        placeholder="Search by code, email, or user ID..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />

      <CSVLink
        data={logs}
        filename="invite_redemptions.csv"
        className={styles.crtButton}
        style={{ marginBottom: '1rem' }}
      >
        📥 Export CSV
      </CSVLink>

      <div className={styles.crtScrollBox}>
        {filteredLogs.map((log, i) => (
          <div key={i} className={styles.crtCard}>
            <p><strong>🔗 Code:</strong> {log.invite_code}</p>
            <p><strong>📧 Email:</strong> {log.user_email}</p>
            <p><strong>🆔 User ID:</strong> {log.user_id}</p>
            <p><strong>⏱️ Claimed:</strong> {new Date(log.claimed_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}

export default withAdminGate(InviteLogPage);