// pages/season-dashboard.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

function SeasonDashboard() {
export default withGuardianGate(Page);
  const [entries, setEntries] = useState([]);
  const [season, setSeason] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchXP();
  }, [season]);

  const fetchXP = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('xp_log')
      .select('user_id, amount')
      .eq('season', season);

    const tally = data?.reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + log.amount;
      return acc;
    }, {} as Record<string, number>) || {};

    const users = await Promise.all(
      Object.entries(tally).map(async ([user_id, total]) => {
  try {
    const { data: user } = await supabase.from('user_profiles').select('alias').eq('id', user_id).single();
  } catch (error) {
    console.error('❌ Supabase error in season-dashboard.tsx', error);
  }
        return {
          user_id,
          alias: user?.alias || 'Anonymous',
          total
        };
      })
    );

    users.sort((a, b) => b.total - a.total);
    setEntries(users);
    setLoading(false);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>📊 Season {season} XP Dashboard</h1>
      <p className={styles.crtText}>Leaderboard of all operators ranked by total XP earned this season.</p>

      <div className={styles.crtMenu}>
        <label>Season: </label>
        <select
          className={styles.crtInput}
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <option key={s} value={s}>Season {s}</option>
          ))}
        </select>
        <CSVLink data={entries} filename={`season_${season}_xp_leaderboard.csv`} className={styles.crtButton}>
          Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <p className={styles.crtText}>Loading...</p>
      ) : (
        <ul className={styles.crtScrollBox}>
          {entries.map((entry, i) => (
            <li key={i} className={styles.crtText}>
              #{i + 1} — {entry.alias} → {entry.total.toLocaleString()} XP
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}