// pages/admin/observer-dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { toast } from 'react-hot-toast';

function ObserverDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('observer_logs')
      .select('*')
      .order('visited_at', { ascending: false });
    setLogs(data || []);
  };

  const convertToInvite = async (ip: string) => {
    setLoading(true);
    const { error } = await supabase.from('manual_invites').insert({
      ip_address: ip,
      issued_at: new Date().toISOString(),
      status: 'pending'
    });
    setLoading(false);
    if (error) {
      toast.error('Failed to add invite.');
    } else {
      toast.success(`Invite added for ${ip}`);
    }
  };

  const filtered = logs.filter(log => {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      log.ip_address?.includes(filter) ||
      log.referral_code?.toLowerCase().includes(filter.toLowerCase())
    );
  });

  return (
    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>👁️ Observer Log Monitor</h1>

      <div className={styles.crtMenu}>
        <input
          className={styles.crtInput}
          placeholder="🔍 Filter IP or referral..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className={styles.crtScrollBox}>
        {filtered.map((log, i) => (
          <div key={i} className={styles.crtCard} style={{ marginBottom: '1rem' }}>
            <p className={styles.crtText}>
              {log.visited_at} — {log.ip_address} {log.referral_code && `→ ref: ${log.referral_code}`}
            </p>
            <button
              onClick={() => convertToInvite(log.ip_address)}
              className={styles.crtButton}
              disabled={loading}
            >
              🎟️ Convert to Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAdminGate(ObserverDashboard);