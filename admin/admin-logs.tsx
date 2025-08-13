import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';
import { Line } from 'react-chartjs-2';
import Fuse from 'fuse.js';
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

const logTitles = {
  redemptions: 'XP Redemptions',
  referrals: 'Referral Logs',
  logins: 'Login Activity',
  suspicious_ips: 'Suspicious IPs',
  guardians: 'Guardian Requests',
  audit: 'Admin Audit Trail',
  xp_log: 'XP Log'
};

function AdminLogs() {
  const [logType, setLogType] = useState('redemptions');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [xpType, setXPType] = useState('all');
  const [chartData, setChartData] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    let res;

    switch (logType) {
      case 'redemptions':
  try {
    res = await supabase.from('xp_redemptions').select('*').order('timestamp', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin-logs.tsx', error);
  }
        break;
      case 'referrals':
  try {
    res = await supabase.from('referral_logs').select('*').order('timestamp', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin-logs.tsx', error);
  }
        break;
      case 'logins':
  try {
    res = await supabase.from('login_logs').select('*').order('timestamp', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin-logs.tsx', error);
  }
        break;
      case 'guardians':
  try {
    res = await supabase.from('guardian_consent').select('*').order('created_at', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin-logs.tsx', error);
  }
        break;
      case 'audit':
        res = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        break;
      case 'suspicious_ips':
        const loginData = await supabase.from('login_logs').select('ip_address, email');
        if (loginData.error || !loginData.data) {
          setLogs([]);
          setLoading(false);
          return;
        }
        const ipMap = {};
        loginData.data.forEach(({ ip_address, email }) => {
          if (!ip_address || !email) return;
          if (!ipMap[ip_address]) ipMap[ip_address] = new Set();
          ipMap[ip_address].add(email);
        });
        const suspicious = Object.entries(ipMap)
          .filter(([_, users]) => users.size > 1)
          .map(([ip, users]) => ({ ip_address: ip, accounts: Array.from(users) }));
        res = { data: suspicious };
        break;
      case 'xp_log':
  try {
    res = await supabase.from('xp_log').select('*').order('timestamp', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin-logs.tsx', error);
  }
        break;
    }

    if (res?.data) {
      let data = res.data;
      if (logType === 'xp_log' && xpType !== 'all') {
        data = data.filter((log) => log.type === xpType);
      }
      if (filter) {
        const fuse = new Fuse(data, {
          keys: ['email', 'referrer_email', 'ip_address', 'child_email', 'guardian_email', 'action', 'reason'],
          threshold: 0.3
        });
        setLogs(fuse.search(filter).map(r => r.item));
      } else {
        setLogs(data);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [logType, filter, xpType]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Admin Logs Terminal</h1>

      <div className={styles.crtMenu}>
        {Object.keys(logTitles).map((type) => (
          <button
            key={type}
            onClick={() => setLogType(type)}
            className={logType === type ? styles.crtButtonActive : styles.crtButton}
          >
            {logTitles[type]}
          </button>
        ))}
        <CSVLink data={logs} filename={`${logType}_export.csv`} className={styles.crtButton}>
          Export CSV
        </CSVLink>
      </div>

      <input
        type="text"
        placeholder="Filter logs..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.crtInput}
      />

      {logType === 'xp_log' && (
        <select
          value={xpType}
          onChange={(e) => setXPType(e.target.value)}
          className={styles.crtInput}
          style={{ marginTop: '0.5rem' }}
        >
          <option value="all">All XP Types</option>
          <option value="mission"></option>