import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { downloadCSV } from '@/utils/exportCSV';

interface VaultEntry {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  source?: string;
}

function VaultHistory() {
export default withGuardianGate(Page);
  const [logs, setLogs] = useState<VaultEntry[]>([]);
  const [userId, setUserId] = useState('');
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.user.id);

    let query = supabase
      .from('xp_log')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('type', filter);

    const { data, error } = await query;
    if (error) {
      setMessage('Error loading logs.');
    } else {
      setLogs(data || []);
    }
  };

  const exportData = () => downloadCSV(logs, 'vault_history');

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🧾 VAULT HISTORY</h2>
      <p>Logs of crate rewards, shop purchases, XP injections, and redemptions.</p>
      {message && <p style={{ color: '#f00' }}>{message}</p>}

      <div style={{ marginTop: '1rem' }}>
        <label>Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.crtInput}
        >
          <option value="all">All</option>
          <option value="crate_open">Crate Opens</option>
          <option value="shop_purchase">Shop Buys</option>
          <option value="manual_adjustment">Admin Injections</option>
          <option value="redeem">XP Redemptions</option>
        </select>
        <button className={styles.crtButton} onClick={exportData} style={{ marginLeft: '1rem' }}>
          ⬇️ Export
        </button>
      </div>

      <ul style={{ marginTop: '2rem', listStyle: 'none', padding: 0 }}>
        {logs.length === 0 ? (
          <p>📭 No vault logs yet.</p>
        ) : (
          logs.map((log) => (
            <li key={log.id} style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              +{log.amount} XP – <strong>{log.type}</strong> → {log.description}
              <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(log.created_at).toLocaleString()}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}