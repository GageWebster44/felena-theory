import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { markOnboardingStep } from '@/utils/onboarding-progress';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const user = useUser();

  const [stats, setStats] = useState({
    redemptionsToday: 0,
    totalUsers: 0,
    guardianPending: 0,
    referralsToday: 0,
    suspiciousIPs: 0,
    auditActionsToday: 0,
    loginsToday: 0,
    totalXP: 0,
    topUser: null,
    newOperators: [] // ✅ alias-ready
  });

  const [redemptionHistory, setRedemptionHistory] = useState(null);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [
      redemptRes,
      userRes,
      guardianRes,
      referralRes,
      loginRes,
      redemptionLogs,
      auditRes,
      loginsTodayRes,
      xpSumRes,
      topUserRes,
      newOps
    ] = await Promise.all([
      supabase.from('xp_redemptions').select('id', { count: 'exact' }).gte('timestamp', `${today}T00:00:00Z`),
      supabase.from('user_profiles').select('id', { count: 'exact' }),
      supabase.from('guardian_consent').select('*'),
      supabase.from('referral_logs').select('id', { count: 'exact' }).gte('timestamp', `${today}T00:00:00Z`),
      supabase.from('login_logs').select('ip_address, email'),
      supabase.from('xp_redemptions').select('timestamp'),
      supabase.from('audit_logs').select('id', { count: 'exact' }).gte('timestamp', `${today}T00:00:00Z`),
      supabase.from('login_logs').select('id', { count: 'exact' }).gte('timestamp', `${today}T00:00:00Z`),
      supabase.rpc('total_xp_sum'),
      supabase.from('user_profiles').select('alias, xp').order('xp', { ascending: false }).limit(1),
      supabase
        .from('user_onboarding')
        .select('user_id, user_profiles(alias)')
        .eq('completed', true)
        .gte('promoted_at', today)
        .order('promoted_at', { ascending: false })
    ]);

    const ipMap = {};
    loginRes.data?.forEach(({ ip_address, email }) => {
      if (!ip_address || !email) return;
      if (!ipMap[ip_address]) ipMap[ip_address] = new Set();
      ipMap[ip_address].add(email);
    });
    const suspiciousCount = Object.values(ipMap).filter(set => set.size > 1).length;

    const counts = {};
    redemptionLogs.data?.forEach(({ timestamp }) => {
      const date = new Date(timestamp).toLocaleDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const values = labels.map(l => counts[l]);
    setRedemptionHistory({
      labels,
      datasets: [
        {
          label: 'XP Redemptions Over Time',
          data: values,
          fill: false,
          borderColor: 'lime',
          tension: 0.2
        }
      ]
    });

    setStats({
      redemptionsToday: redemptRes.count || 0,
      totalUsers: userRes.count || 0,
      guardianPending: guardianRes.data?.filter(g => !g.verified).length || 0,
      referralsToday: referralRes.count || 0,
      suspiciousIPs: suspiciousCount,
      auditActionsToday: auditRes.count || 0,
      loginsToday: loginsTodayRes.count || 0,
      totalXP: xpSumRes.data || 0,
      topUser: topUserRes.data?.[0] || null,
      newOperators: newOps?.data || []
    });
  };

  useEffect(() => {
    if (user) markOnboardingStep(user.id, 'visited_dashboard');
    fetchStats();
  }, [user]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Admin Dashboard</h1>

      {stats.newOperators.length > 0 && (
        <div className={styles.crtCard} style={{ backgroundColor: '#002d00', color: '#0f0' }}>
          <h2>🆕 New Operators Today</h2>
          <ul>
            {stats.newOperators.map((op, i) => (
              <li key={i}>✅ {op.user_profiles?.alias || op.user_id}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.crtGrid}>
        <div className={styles.crtCard}><h2>XP Redemptions Today</h2><p>{stats.redemptionsToday}</p></div>
        <div className={styles.crtCard}><h2>Total Users</h2><p>{stats.totalUsers}</p></div>
        <div className={styles.crtCard}><h2>Guardian Requests Pending</h2><p>{stats.guardianPending}</p></div>
        <div className={styles.crtCard}><h2>Referrals Today</h2><p>{stats.referralsToday}</p></div>
        <div className={styles.crtCard}><h2>Suspicious IPs</h2><p>{stats.suspiciousIPs}</p></div>
        <div className={styles.crtCard}><h2>Audit Logs Today</h2><p>{stats.auditActionsToday}</p></div>
        <div className={styles.crtCard}><h2>Logins Today</h2><p>{stats.loginsToday}</p></div>
        <div className={styles.crtCard}><h2>Total XP in System</h2><p>{stats.totalXP.toLocaleString()}</p></div>
        <div className={styles.crtCard}>
          <h2>Top XP Holder</h2>
          <p>{stats.topUser?.alias || 'N/A'} ({stats.topUser?.xp || 0} XP)</p>
        </div>
      </div>

      {redemptionHistory && (
        <div style={{ background: 'black', padding: '1rem', marginTop: '2rem' }}>
          <Line data={redemptionHistory} />
        </div>
      )}
    </div>
  );
}

export default withAdminGate(AdminDashboard);