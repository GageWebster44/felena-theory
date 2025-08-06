// pages/xp-ledger.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import logXP from '@/utils/logXP';

interface XPEntry {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
}

function XPLedger() {
export default withGuardianGate(Page);
  const [logs, setLogs] = useState<XPEntry[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [userFilter, setUserFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [amount, setAmount] = useState(0);
  const [targetId, setTargetId] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  const [reloadFlag, setReloadFlag] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setReloadFlag((prev) => !prev), 5000);
    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [reloadFlag]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('id, role, username');

    const roleUser = data?.find((u) => u.id === user.id);
    setRole(roleUser?.role || '');

    const map = data?.reduce((acc, cur) => {
      acc[cur.id] = cur.username;
      return acc;
    }, {} as Record<string, string>) || {};

    setUserMap(map);
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from('xp_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(250);

    setLogs(data || []);
  };

  const injectXP = async () => {
    if (!targetId || !amount) return;

  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in xp-ledger.tsx', error);
  }
      user_id: targetId,
      amount,
      type: 'manual_adjustment',
      description: `Manual XP ${amount > 0 ? 'grant' : 'deduct'}`,
    });

    await logXP('manual_adjustment', amount, `Admin override: ${targetId}`);
    setMessage(`✅ XP ${amount > 0 ? 'added' : 'revoked'} for ${targetId}`);
    setAmount(0);
    setTargetId('');
    setReloadFlag((prev) => !prev);
  };

  const exportCSV = () => {
    const rows = logs.map((log) =>
      `${log.user_id},${log.type},${log.amount},${log.description},${log.created_at}`
    );
    const csv = 'user_id,type,amount,description,created_at\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'xp_ledger_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFraudulent = (log: XPEntry, index: number) => {
    if (logs.length < 2) return false;
    const next = logs[index + 1];
    if (!next || log.user_id !== next.user_id || log.type !== next.type) return false;

    const diff = new Date(log.created_at).getTime() - new Date(next.created_at).getTime();
    return diff < 300000; // under 5 min
  };

  if (role !== 'admin' && role !== 'dev') {
    return (
      <div className={styles.crtScreen}>
        <h2>🚫 Access Denied</h2>
        <p>This panel is admin-only.</p>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) =>
    (!userFilter || log.user_id.includes(userFilter)) &&
    (!typeFilter || log.type === typeFilter)
  );

  return (
    <div className={styles.crtScreen}>
      <h2>📘 XP LEDGER</h2>
      <p>🧠 Monitor all XP activity. Admin tools below.</p>
      {message && <p style={{ color: '#0f0', marginTop: '1rem' }}>{message}</p>}

      <div style={{ border: '1px solid #00fff9', padding: '1rem', marginTop: '1rem' }}>
        <h3>⚙️ XP Inject</h3>
        <input
          type="text"
          placeholder="Target User ID"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          style={{ marginRight: '1rem', width: '200px' }}
        />
        <input
          type="number"
          placeholder="XP Amount"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          style={{ marginRight: '1rem', width: '120px' }}
        />
        <button onClick={injectXP} className={styles.crtButton}>💉 Inject</button>
        <button onClick={exportCSV} className={styles.crtButton} style={{ marginLeft: '1rem' }}>
          📤 Export CSV
        </button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Filter by user ID"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All</option>
          <option value="shop_purchase">Shop</option>
          <option value="xp_crate">Crate</option>
          <option value="mission">Missions</option>
          <option value="referral">Referral</option>
          <option value="manual_adjustment">Manual</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', color: '#0f0', fontFamily: 'monospace' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #00fff9' }}>
              <th>Type</th>
              <th>Description</th>
              <th>XP</th>
              <th>User</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, i) => (
              <tr
                key={log.id}
                style={{ background: isFraudulent(log, i) ? '#330000' : 'transparent' }}
              >
                <td>{log.type}</td>
                <td>{log.description}</td>
                <td style={{ color: log.amount >= 0 ? '#0f0' : '#f33' }}>{log.amount}</td>
                <td title={log.user_id}>
                  {userMap[log.user_id] || log.user_id.slice(0, 6)}
                </td>
                <td style={{ fontSize: '0.75rem' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.scanlines}></div>
    </div>
  );
}