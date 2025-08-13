import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { createClient } from '@supabase/supabase-js';
import styles from '@/styles/crtLaunch.module.css';
import useUser from '@/utils/useUser';
import { logXPInjection } from '@/utils/adminTools';
import { downloadCSV } from '@/utils/exportCSV';
import RouteGuard from '@/components/RouteGuard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AdminPanelContent() {
  const { user } = useUser();
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [xpLog, setXpLog] = useState<any[]>([]);
  const [referralLog, setReferralLog] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);
  const [promotionLog, setPromotionLog] = useState<any[]>([]);
  const [flagged, setFlagged] = useState<any[]>([]);
  const [overrideStatus, setOverrideStatus] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchXPLogs();
    fetchReferrals();
    fetchUsers();
    fetchPromotions();
    fetchOverrideStatus();
    fetchActivity();
  }, []);

  useEffect(() => {
    flagSuspicious();
  }, [xpLog]);

  const fetchXPLogs = async () => {
  try {
    const { data } = await supabase.from('xp_log').select('*').order('timestamp', { ascending: false }).limit(100);
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
    if (data) setXpLog(data);
  };

  const fetchReferrals = async () => {
  try {
    const { data } = await supabase.from('referral_logs').select('*').order('timestamp', { ascending: false }).limit(100);
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
    if (data) setReferralLog(data);
  };

  const fetchUsers = async () => {
  try {
    const { data } = await supabase.from('user_profiles').select('*');
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
    if (data) setUserList(data);
  };

  const fetchPromotions = async () => {
  try {
    const { data } = await supabase.from('employee_promotions').select('*').order('timestamp', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
    if (data) setPromotionLog(data);
  };

  const fetchActivity = async () => {
  try {
    const { data } = await supabase.from('system_activity_log').select('*').order('timestamp', { ascending: false }).limit(100);
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
    if (data) setActivityLog(data);
  };

  const fetchOverrideStatus = async () => {
  try {
    const { data } = await supabase.from('config').select('value').eq('key', 'enable_override').single();
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
    if (data?.value === 'true') setOverrideStatus(true);
  };

  const toggleOverride = async () => {
    const newState = !overrideStatus;
  try {
    await supabase.from('config').update({ value: newState ? 'true' : 'false' }).eq('key', 'enable_override');
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
    setOverrideStatus(newState);
  };

  const flagSuspicious = () => {
    const seen: Record<string, number> = {};
    xpLog.forEach((entry) => {
      const key = `${entry.user_id}-${entry.reason}`;
      seen[key] = (seen[key] || 0) + 1;
    });
    const flaggedUsers = Object.entries(seen)
      .filter(([_, count]) => count >= 3)
      .map(([key]) => key.split('-')[0]);
    setFlagged([...new Set(flaggedUsers)]);
  };

  const promoteUser = async (userId: string, newRole: string) => {
    const u = userList.find((u) => u.id === userId);
    if (!u) return;
  try {
    await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
  try {
    await supabase.from('employee_promotions').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin.tsx', error);
  }
      user_id: userId,
      approver_id: user.id,
      old_status: u.role,
      new_status: newRole,
    });
    fetchUsers();
    fetchPromotions();
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>ADMIN PANEL</h1>

      <div className={styles.crtGridResponsive}>
        <div className={styles.crtBlock}>
          <h2>XP Injection</h2>
          <input className={styles.crtInput} placeholder="User ID" onChange={(e) => setTargetId(e.target.value)} />
          <input className={styles.crtInput} type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
          <input className={styles.crtInput} placeholder="Reason" onChange={(e) => setReason(e.target.value)} />
          <button className={styles.crtButton} onClick={() => logXPInjection(targetId, amount, reason)}>Inject XP</button>
        </div>

        <div className={styles.crtBlock}>
          <h2>User Role Promotion</h2>
          {userList.map((u) => (
            <div key={u.id}>
              <strong>{u.username}</strong>
              <select onChange={(e) => promoteUser(u.id, e.target.value)} value={u.role}>
                <option value="public">Public</option>
                <option value="guardian">Guardian</option>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>

        <div className={styles.crtBlock}>
          <h2>Referral Log</h2>
          <button className={styles.crtButton} onClick={() => downloadCSV(referralLog, 'referral_log')}>Export CSV</button>
          <ul>
            {referralLog.map((r) => (
              <li key={r.id}>{r.referrer_id} ➜ {r.referred_id} @ {r.timestamp}</li>
            ))}
          </ul>
        </div>

        <div className={styles.crtBlock}>
          <h2>XP Log</h2>
          <button className={styles.crtButton} onClick={() => downloadCSV(xpLog, 'xp_log')}>Export CSV</button>
          {xpLog.map((x) => (
            <div key={x.id}>{x.user_id} ➜ {x.amount} XP – {x.reason}</div>
          ))}
        </div>

        <div className={styles.crtBlock}>
          <h2>Red Flag Watchlist</h2>
          {flagged.length === 0 ? <p>✅ No patterns flagged</p> : flagged.map((id, i) => <p key={i}>⚠️ {id}</p>)}
        </div>

        <div className={styles.crtBlock}>
          <h2>System Timeline</h2>
          <button onClick={() => downloadCSV(activityLog, 'activity_log')}>Export</button>
          <input className={styles.crtInput} placeholder="Search description" onChange={(e) => setSearchQuery(e.target.value)} />
          <select className={styles.crtInput} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="xp">XP</option>
            <option value="promotion">Promotions</option>
          </select>
          <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {activityLog
              .filter((entry) => filterType === 'all' || entry.action_type === filterType)
              .filter((entry) => searchQuery === '' || entry.description.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((a, i) => (
                <li key={i}>{a.timestamp} | {a.action_type} – {a.description}</li>
              ))}
          </ul>
        </div>

        <div className={styles.crtBlock}>
          <h2>Mutation Toggle</h2>
          <p>Status: {overrideStatus ? '🟢 ACTIVE' : '🔴 DISABLED'}</p>
          <button onClick={toggleOverride} className={styles.crtButton}>
            {overrideStatus ? 'Deactivate' : 'Activate'} Override
          </button>
        </div>

        {user?.id === process.env.NEXT_PUBLIC_ARCHITECT_ID && (
          <div className={styles.crtBlock}>
            <h2>Architect Dashboard</h2>
            <ul>
              <li>📦 Matrix Drop Watch</li>
              <li>🧬 Apprentice Chain Monitor</li>
              <li>🌀 XP Flywheel Tracking</li>
              <li>🚨 Manual Override Control</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPanelPage() {
export default withGuardianGate(Page);
  return (
    <RouteGuard allowedRoles={['admin', 'developer']}>
      <AdminPanelContent />
    </RouteGuard>
  );
}