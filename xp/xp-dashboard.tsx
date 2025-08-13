// pages/xp-dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { Bar, Line } from 'react-chartjs-2';
import { CSVLink } from 'react-csv';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function XPDashboard() {
  const [totals, setTotals] = useState({ totalXP: 0, avgXP: 0 });
  const [topUsers, setTopUsers] = useState([]);
  const [xpByType, setXPByType] = useState<any>(null);
  const [xpByDate, setXPByDate] = useState<any>(null);
  const [badgeCounts, setBadgeCounts] = useState([]);
  const [filterType, setFilterType] = useState<'all' | 'badge' | 'crate' | 'mission' | 'manual' | 'shop'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchXPStats();
  }, [filterType, fromDate, toDate]);

  const fetchXPStats = async () => {
  try {
    const { data: xpRows } = await supabase.from('xp_log').select('*');
  } catch (error) {
    console.error('❌ Supabase error in xp-dashboard.tsx', error);
  }
  try {
    const { data: users } = await supabase.from('user_profiles').select('id, alias, xp');
  } catch (error) {
    console.error('❌ Supabase error in xp-dashboard.tsx', error);
  }
  try {
    const { data: badgeRows } = await supabase.from('user_badges').select('user_id');
  } catch (error) {
    console.error('❌ Supabase error in xp-dashboard.tsx', error);
  }

    // Filtered XP rows
    let filteredXP = xpRows;
    if (filterType !== 'all') filteredXP = filteredXP.filter(x => x.type === filterType);
    if (fromDate) filteredXP = filteredXP.filter(x => new Date(x.timestamp) >= new Date(fromDate));
    if (toDate) filteredXP = filteredXP.filter(x => new Date(x.timestamp) <= new Date(toDate));

    // Total & Avg
    const totalXP = users.reduce((sum, u) => sum + (u.xp || 0), 0);
    const avgXP = users.length > 0 ? Math.round(totalXP / users.length) : 0;
    setTotals({ totalXP, avgXP });

    // Top Users
    const top = [...users].sort((a, b) => b.xp - a.xp).slice(0, 10);
    setTopUsers(top);

    // XP by Type
    const typeMap: Record<string, number> = {};
    filteredXP.forEach((x) => {
      const t = x.type || 'unknown';
      typeMap[t] = (typeMap[t] || 0) + x.amount;
    });
    setXPByType({
      labels: Object.keys(typeMap),
      datasets: [{
        label: 'XP by Type',
        data: Object.values(typeMap),
        backgroundColor: 'rgba(0,255,0,0.6)'
      }]
    });

    // XP by Date
    const dateMap: Record<string, number> = {};
    filteredXP.forEach((x) => {
      const d = new Date(x.timestamp).toLocaleDateString();
      dateMap[d] = (dateMap[d] || 0) + x.amount;
    });
    const sortedDates = Object.keys(dateMap).sort();
    setXPByDate({
      labels: sortedDates,
      datasets: [{
        label: 'Daily XP Earned',
        data: sortedDates.map(d => dateMap[d]),
        borderColor: 'lime',
        fill: false
      }]
    });

    // Badge Earners
    const badgeMap: Record<string, number> = {};
    badgeRows.forEach((b) => {
      badgeMap[b.user_id] = (badgeMap[b.user_id] || 0) + 1;
    });
    const badgeRanked = users.map(u => ({ ...u, badgeCount: badgeMap[u.id] || 0 }))
      .sort((a, b) => b.badgeCount - a.badgeCount)
      .slice(0, 10);
    setBadgeCounts(badgeRanked);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>XP Intelligence Dashboard</h1>

      <div className={styles.crtGrid}>
        <div className={styles.crtCard}><h2>Total XP</h2><p>{totals.totalXP.toLocaleString()} XP</p></div>
        <div className={styles.crtCard}><h2>Average XP / User</h2><p>{totals.avgXP.toLocaleString()}</p></div>
      </div>

      <div className={styles.crtMenu}>
        <label>Filter Type: </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className={styles.crtInput}
        >
          <option value="all">All</option>
          <option value="mission">🎯 Mission</option>
          <option value="crate">📦 Crate</option>
          <option value="badge">🏅 Badge</option>
          <option value="manual">✍️ Manual</option>
          <option value="shop">🛒 Shop</option>
        </select>

        <label style={{ marginLeft: '1rem' }}>From: </label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={styles.crtInput} />

        <label style={{ marginLeft: '1rem' }}>To: </label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={styles.crtInput} />

        <CSVLink data={topUsers} filename="top_xp_users.csv" className={styles.crtButton}>
          Export Top Users
        </CSVLink>
        <CSVLink data={badgeCounts} filename="top_badges.csv" className={styles.crtButton}>
          Export Badge Stats
        </CSVLink>
      </div>

      <div className={styles.crtGridResponsive}>
        <div className={styles.crtCard}>
          <h2>Top XP Holders</h2>
          <ul>
            {topUsers.map((u, i) => (
              <li key={i}>{u.alias || u.id} — {u.xp} XP</li>
            ))}
          </ul>
        </div>

        <div className={styles.crtCard}>
          <h2>Top Badge Earners</h2>
          <ul>
            {badgeCounts.map((u, i) => (
              <li key={i}>{u.alias || u.id} — {u.badgeCount} badges</li>
            ))}
          </ul>
        </div>
      </div>

      {xpByType && (
        <div style={{ background: 'black', padding: '1rem', marginTop: '2rem' }}>
          <Bar data={xpByType} />
        </div>
      )}

      {xpByDate && (
        <div style={{ background: 'black', padding: '1rem', marginTop: '2rem' }}>
          <Line data={xpByDate} />
        </div>
      )}
    </div>
  );
}

export default withAdminGate(XPDashboard);