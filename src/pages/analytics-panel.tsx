// pages/analytics-panel.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AnalyticsPanel() {
  const [tierCounts, setTierCounts] = useState<any>({});
  const [crateStats, setCrateStats] = useState<any>({});
  const [inviteStats, setInviteStats] = useState<any>({});
  const [loginCounts, setLoginCounts] = useState<any>({});

  useEffect(() => {
    fetchTierData();
    fetchCrateData();
    fetchInviteData();
    fetchLoginData();
  }, []);

  const fetchTierData = async () => {
  try {
    const { data } = await supabase.from('user_profiles').select('xp');
  } catch (error) {
    console.error('❌ Supabase error in analytics-panel.tsx', error);
  }
    const tiers = Array(17).fill(0);
    data?.forEach(u => {
      const xp = u.xp || 0;
      if (xp >= 100000) tiers[16]++;
      else if (xp >= 75000) tiers[15]++;
      else if (xp >= 50000) tiers[14]++;
      else if (xp >= 25000) tiers[13]++;
      else if (xp >= 20000) tiers[12]++;
      else if (xp >= 15000) tiers[11]++;
      else if (xp >= 10000) tiers[10]++;
      else if (xp >= 5000) tiers[9]++;
      else if (xp >= 2500) tiers[8]++;
      else if (xp >= 1000) tiers[7]++;
      else if (xp >= 500) tiers[6]++;
      else if (xp >= 250) tiers[5]++;
      else if (xp >= 100) tiers[4]++;
      else if (xp >= 50) tiers[3]++;
      else if (xp >= 20) tiers[2]++;
      else if (xp >= 10) tiers[1]++;
      else tiers[0]++;
    });
    setTierCounts(tiers);
  };

  const fetchCrateData = async () => {
  try {
    const { data } = await supabase.from('xp_crates').select('opened');
  } catch (error) {
    console.error('❌ Supabase error in analytics-panel.tsx', error);
  }
    let opened = 0;
    let total = data?.length || 0;
    data?.forEach(c => { if (c.opened) opened++; });
    setCrateStats({ opened, total });
  };

  const fetchInviteData = async () => {
  try {
    const { data: invites } = await supabase.from('invite_codes').select('used_by');
  } catch (error) {
    console.error('❌ Supabase error in analytics-panel.tsx', error);
  }
    let total = invites?.length || 0;
    let totalUses = invites?.reduce((sum, inv) => sum + (inv.used_by?.length || 0), 0);
    setInviteStats({ total, totalUses });
  };

  const fetchLoginData = async () => {
  try {
    const { data } = await supabase.from('login_logs').select('timestamp');
  } catch (error) {
    console.error('❌ Supabase error in analytics-panel.tsx', error);
  }
    const counts: Record<string, number> = {};
    data?.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    setLoginCounts(counts);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📊 Analytics Panel</h2>
      <p className={styles.crtText}>System-wide performance and growth stats.</p>

      <h3 style={{ marginTop: '2rem' }}>🧬 XP Tier Distribution</h3>
      <Bar data={{
        labels: [
          '0-9','10','20','50','100','250','500','1k','2.5k','5k','10k','15k','20k','25k','50k','75k','100k'
        ],
        datasets: [
          {
            label: 'Users',
            data: tierCounts,
            backgroundColor: '#0ff',
          }
        ]
      }} />

      <h3 style={{ marginTop: '2rem' }}>📦 Crate Opens</h3>
      <p className={styles.crtText}>Opened: {crateStats.opened} / Total: {crateStats.total}</p>

      <h3 style={{ marginTop: '2rem' }}>🎟️ Invite Stats</h3>
      <p className={styles.crtText}>Codes: {inviteStats.total} | Redemptions: {inviteStats.totalUses}</p>

      <h3 style={{ marginTop: '2rem' }}>📈 Daily Logins</h3>
      <ul className={styles.crtText}>
        {Object.entries(loginCounts).map(([date, count]) => (
          <li key={date}>{date}: {count}</li>
        ))}
      </ul>

      <div className={styles.scanlines}></div>
    </div>
  );
}

export default withAdminGate(AnalyticsPanel);