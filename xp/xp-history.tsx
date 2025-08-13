// pages/xp-history.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import Link from 'next/link';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { downloadCSV } from '@/utils/exportCSV';

interface XPLogEntry {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  timestamp: string;
  season?: number;
  type?: string;
}

function XPHistoryPage() {
export default withGuardianGate(Page);
  const [logs, setLogs] = useState<XPLogEntry[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<'current' | 'all'>('current');
  const [filterType, setFilterType] = useState<'all' | 'badges'>('all');
  const [userId, setUserId] = useState('');
  const [flagged, setFlagged] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadLogs();
  }, [seasonFilter, filterType]);

  const loadLogs = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.user.id);

    let query = supabase
      .from('xp_log')
      .select('*')
      .eq('user_id', user.user.id)
      .order('timestamp', { ascending: false });

    if (seasonFilter === 'current') query = query.eq('season', 1);
    if (filterType === 'badges') query = query.eq('type', 'badge');

    const { data } = await query;
    if (data) {
      setLogs(data);
      flagFraud(data);
    }
  };

  const flagFraud = (entries: XPLogEntry[]) => {
    const reasonsByDay: Record<string, Record<string, number>> = {};
    entries.forEach((log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      reasonsByDay[date] = reasonsByDay[date] || {};
      reasonsByDay[date][log.reason] = (reasonsByDay[date][log.reason] || 0) + 1;
    });
    const flaggedUsers = Object.values(reasonsByDay).flatMap((reasons) =>
      Object.entries(reasons)
        .filter(([_, count]) => count > 2)
        .map(([reason]) => reason)
    );
    setFlagged(flaggedUsers);
  };

  const handleExport = () => downloadCSV(filteredLogs(), 'xp_history_export');

  const getMostFrequentBadgeReason = () => {
    const badgeLogs = logs.filter(l => l.type === 'badge');
    const countMap: Record<string, number> = {};
    badgeLogs.forEach(log => {
      countMap[log.reason] = (countMap[log.reason] || 0) + 1;
    });
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : null;
  };

  const parseBadgeSource = (reason: string) => {
    if (reason.includes('(via system grant')) {
      const match = reason.match(/ref #(\w+)/);
      return match ? `🤖 via system grant — ref #${match[1]}` : '🤖 via system grant';
    } else if (reason.includes('(by ')) {
      const match = reason.match(/\(by (.*?)\)/);
      return match ? `🧑‍💼 Granted by ${match[1]}` : '🧑‍💼 Manual Grant';
    } else if (reason.toLowerCase().includes('auto')) {
      return '🤖 Auto-granted';
    } else {
      return '🔍 Unknown Source';
    }
  };

  const filteredLogs = () => logs.filter(log => {
    const matchSearch = search === '' || log.reason.toLowerCase().includes(search.toLowerCase());
    const matchFrom = fromDate === '' || new Date(log.timestamp) >= new Date(fromDate);
    const matchTo = toDate === '' || new Date(log.timestamp) <= new Date(toDate);
    return matchSearch && matchFrom && matchTo;
  });

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📜 XP HISTORY</h2>
      <p>Full breakdown of XP you've earned by action, reason, and season.</p>
      <p style={{ color: '#0f0', marginTop: '0.5rem' }}>🧾 Total Badge Events Logged: {logs.filter(l => l.type === 'badge').length}</p>
      {filterType === 'badges' && <p style={{ color: '#0ff', fontSize: '0.85rem' }}>🏅 Most Frequent Badge Event: {getMostFrequentBadgeReason() || '—'}</p>}

      {/* Filters */}
      <section style={{ marginTop: '1rem' }}>
        <label>Season Filter: </label>
        <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value as 'current' | 'all')} className={styles.crtInput}>
          <option value="current">Current Season</option>
          <option value="all">All Time</option>
        </select>

        <label style={{ marginLeft: '1rem' }}>Show: </label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as 'all' | 'badges')} className={styles.crtInput}>
          <option value="all">All XP</option>
          <option value="badges">Badge Only</option>
        </select>

        <input className={styles.crtInput} placeholder="🔍 Filter by reason..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ marginLeft: '1rem' }} />
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={styles.crtInput} style={{ marginLeft: '1rem' }} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={styles.crtInput} style={{ marginLeft: '0.5rem' }} />
        <button className={styles.crtButton} onClick={handleExport}>📤 Export</button>
      </section>

      {/* Table */}
      <section style={{ marginTop: '2rem' }}>
        {filteredLogs().length === 0 ? (
          <p>📭 No XP history yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredLogs().map((log) => (
              <li key={log.id} style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: flagged.includes(log.reason) ? '#ff0' : '#ccc' }}>
                +{log.amount} XP – {log.reason} @ {new Date(log.timestamp).toLocaleString()}
                {log.type === 'badge' && (
                  log.reason.toLowerCase().includes('revoked') ? (
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#f66' }}>❌ Badge Revoked</p>
                  ) : (
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#6ef' }}>{parseBadgeSource(log.reason)}</p>
                  )
                )}
                {(flagged.includes(log.reason) || log.reason.toLowerCase().includes('revoked')) && (
                  <Link href="/audit-dashboard" className={styles.crtText} style={{ fontSize: '0.75rem', color: '#ffa' }}>
                    🔍 View Audit Trail
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Flags */}
      {flagged.length > 0 && (
        <section style={{ marginTop: '2rem', color: '#f80' }}>
          <h4>🚨 Flagged Patterns</h4>
          <p>Repeated same-day actions found: {flagged.join(', ')}</p>
        </section>
      )}
    </div>
  );
}