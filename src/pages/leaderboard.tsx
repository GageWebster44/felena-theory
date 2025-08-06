 // pages/leaderboard.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import supabase from '@/utils/supabaseClient';

interface Entry {
  id: string;
  alias: string;
  xp: number;
  engines: number;
  win_rate: number;
  accuracy: number;
  referrals: number;
}

function LeaderboardPage() {
export default withGuardianGate(Page);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('xp', { ascending: false })
        .limit(100);
      setEntries(data || []);
    };

    fetchData();
  }, [timeFilter]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📊 XP LEADERBOARD</h2>
      <p>Top operators by XP, engines, wins, referrals, and prediction accuracy.</p>

      <div style={{ marginTop: '1rem' }}>
        <label>⏱ Time Range: </label>
        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="all">All-Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>

      <table style={{ marginTop: '2rem', width: '100%', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #00ff99' }}>
            <th>#</th>
            <th>Alias</th>
            <th>XP</th>
            <th>Engines</th>
            <th>Wins</th>
            <th>Accuracy</th>
            <th>Referrals</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.id}
              style={{
                background:
                  idx === 0
                    ? '#0f0'
                    : idx === 1
                    ? '#00fff3'
                    : idx === 2
                    ? '#ff0'
                    : '#000',
                color: idx < 3 ? '#000' : '#00ff99',
                fontWeight: idx < 3 ? 'bold' : 'normal',
              }}
            >
              <td>{idx + 1}</td>
              <td>{entry.alias}</td>
              <td>{entry.xp.toLocaleString()}</td>
              <td>{entry.engines}</td>
              <td>{entry.win_rate}%</td>
              <td>{entry.accuracy}%</td>
              <td>{entry.referrals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}