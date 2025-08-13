// pages/global-search.tsx
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import Fuse from 'fuse.js';
import { withAdminGate } from '@/components/withRoleGate';

export default withAdminGate(function GlobalSearch() {
  const [data, setData] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [users, invites, logs, referrals] = await Promise.all([
      supabase.from('user_profiles').select('*'),
      supabase.from('invite_codes').select('*'),
      supabase.from('audit_logs').select('*'),
      supabase.from('referrals').select('*'),
    ]);

    const unified = [
      ...(users.data || []).map((d) => ({ type: 'user', ...d })),
      ...(invites.data || []).map((d) => ({ type: 'invite', ...d })),
      ...(logs.data || []).map((d) => ({ type: 'audit_log', ...d })),
      ...(referrals.data || []).map((d) => ({ type: 'referral', ...d })),
    ];

    setData(unified);
    setLoading(false);
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const fuse = new Fuse(data, {
      keys: ['id', 'email', 'alias', 'referral_code', 'label', 'user_id', 'referrer_id', 'action'],
      threshold: 0.3,
    });
    const filtered = fuse.search(query).map((r) => r.item);
    setResults(filtered);
  }, [query]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🌐 Global Search Terminal</h1>
      <p className={styles.crtText}>Search across users, invites, logs, and referrals.</p>

      <input
        className={styles.crtInput}
        placeholder="🔍 Search users, logs, invites, referrals..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginTop: '1rem', marginBottom: '1rem' }}
      />

      {loading ? (
        <p className={styles.crtText}>Loading data...</p>
      ) : results.length === 0 ? (
        <p className={styles.crtText}>No results found.</p>
      ) : (
        <div className={styles.crtScrollBox}>
          {results.map((entry, i) => (
            <div key={i} className={styles.crtCard}>
              <p><strong>📁 Type:</strong> {entry.type}</p>
              <pre style={{ fontSize: '0.75rem', color: '#ccc' }}>{JSON.stringify(entry, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}

      <div className={styles.scanlines} />
    </div>
  );
});