// pages/admin-fraud.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import Fuse from 'fuse.js';

interface FraudPattern {
  user_id: string;
  reason: string;
  count: number;
  entries: any[];
}

function AdminFraudPage() {
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchXPLogs();
  }, []);

  const fetchXPLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('xp_log')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!data || error) return setLoading(false);

    const patternMap: Record<string, FraudPattern> = {};

    data.forEach((entry) => {
      const key = `${entry.user_id}::${entry.reason}`;
      if (!patternMap[key]) {
        patternMap[key] = {
          user_id: entry.user_id,
          reason: entry.reason,
          count: 0,
          entries: [],
        };
      }
      patternMap[key].count++;
      patternMap[key].entries.push(entry);
    });

    const patternsArray = Object.values(patternMap).filter(p => p.count >= 3);
    setPatterns(patternsArray);
    setLoading(false);
  };

  const fuse = new Fuse(patterns, {
    keys: ['user_id', 'reason'],
    threshold: 0.3,
  });

  const filtered = filter ? fuse.search(filter).map(r => r.item) : patterns;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🚨 XP Fraud Pattern Detector</h1>

      <input
        type="text"
        className={styles.crtInput}
        placeholder="Search by reason or user..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className={styles.crtScrollBox}>
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p>✅ No suspicious patterns found.</p>
        ) : (
          filtered.map((pattern, i) => (
            <div key={i} className={styles.crtCard}>
              <h3>⚠️ {pattern.reason}</h3>
              <p><strong>User:</strong> {pattern.user_id}</p>
              <p><strong>Repeats:</strong> {pattern.count}</p>
              <ul style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                {pattern.entries.slice(0, 5).map((e, idx) => (
                  <li key={idx}>+{e.amount} XP — {new Date(e.timestamp).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default withAdminGate(AdminFraudPage);