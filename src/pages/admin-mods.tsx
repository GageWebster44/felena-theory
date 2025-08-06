import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

function AdminMods() {
  const [modStats, setModStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchModActions = async () => {
    setLoading(true);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();

    const range = dateFilter === 'today' ? todayStart : dateFilter === 'week' ? weekStart : null;

    let query = supabase.from('audit_logs').select('user_id, action, timestamp').order('timestamp', { ascending: false });
    if (range) query = query.gte('timestamp', range);

    const { data, error } = await query;

    if (!data || error) {
      setModStats([]);
      setLoading(false);
      return;
    }

    const actionCounts = {};
    data.forEach(({ user_id, action, timestamp }) => {
      if (!actionCounts[user_id]) {
        actionCounts[user_id] = { total: 0, recent: [], user_id };
      }
      actionCounts[user_id].total++;
      actionCounts[user_id].recent.push({ action, timestamp });
    });

    const sorted = Object.values(actionCounts).sort((a, b) => b.total - a.total);
    setModStats(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchModActions();
  }, [dateFilter]);

  const filteredMods = filter
    ? modStats.filter(mod => JSON.stringify(mod).toLowerCase().includes(filter.toLowerCase()))
    : modStats;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Moderator Leaderboard</h1>

      <div className={styles.crtMenu}>
        <button onClick={() => setDateFilter('all')} className={dateFilter === 'all' ? styles.crtButtonActive : styles.crtButton}>All Time</button>
        <button onClick={() => setDateFilter('week')} className={dateFilter === 'week' ? styles.crtButtonActive : styles.crtButton}>This Week</button>
        <button onClick={() => setDateFilter('today')} className={dateFilter === 'today' ? styles.crtButtonActive : styles.crtButton}>Today</button>
        <CSVLink data={modStats} filename={`moderator_stats_${dateFilter}.csv`} className={styles.crtButton}>Export CSV</CSVLink>
      </div>

      <input
        type="text"
        placeholder="Filter by user ID or action..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.crtInput}
      />

      {loading ? <p className={styles.crtText}>Loading moderator activity...</p> : (
        <div className={styles.crtScrollBox}>
          {filteredMods.length === 0 ? <p className={styles.crtText}>No activity found.</p> : (
            filteredMods.map((mod, i) => (
              <div key={i} className={styles.crtLogBlock}>
                <pre>🏆 {mod.user_id} — {mod.total} actions</pre>
                {mod.recent.slice(0, 5).map((entry, j) => (
                  <pre key={j} style={{ paddingLeft: '1rem' }}>🕒 {new Date(entry.timestamp).toLocaleTimeString()} — {entry.action}</pre>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default withAdminGate(AdminMods);