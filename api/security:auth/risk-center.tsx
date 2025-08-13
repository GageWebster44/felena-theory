// pages/risk-center.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import Link from 'next/link';
import { toast } from 'react-toastify';

function RiskCenter() {
  const [flaggedUsers, setFlaggedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    recordAudit();
    loadAuditFlags();
  }, []);

  const recordAudit = async () => {
    const { data: session } = await supabase.auth.getUser();
    if (session?.user?.id) {
      setCurrentUserId(session.user.id);
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in risk-center.tsx', error);
  }
        user_id: session.user.id,
        action: 'Accessed Risk Center dashboard',
        timestamp: new Date().toISOString()
      });
    }
  };

  const loadAuditFlags = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('user_id, action, timestamp')
      .ilike('action', '%⚠️%');

    const userMap: Record<string, any> = {};
    data?.forEach(log => {
      if (!userMap[log.user_id]) {
        userMap[log.user_id] = [];
      }
      userMap[log.user_id].push(log);
    });

    const flagged = await Promise.all(
      Object.entries(userMap).map(async ([id, logs]) => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('alias, xp, role')
          .eq('id', id)
          .single();
        return {
          id,
          alias: profile?.alias || 'Unknown',
          xp: profile?.xp || 0,
          role: profile?.role || 'public',
          logs
        };
      })
    );
    setFlaggedUsers(flagged);
    setLoading(false);
  };

  const freezeUser = async (userId: string) => {
  try {
    await supabase.from('user_profiles').update({ status: 'frozen' }).eq('id', userId);
  } catch (error) {
    console.error('❌ Supabase error in risk-center.tsx', error);
  }
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in risk-center.tsx', error);
  }
      user_id: currentUserId,
      action: `⚠️ Froze user ${userId} via Risk Center`,
      timestamp: new Date().toISOString()
    });
    toast.info('🧊 User frozen. Redirecting to Frozen Users...');
    setTimeout(() => {
      window.location.href = '/frozen-users';
    }, 1500);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>EchoMind Risk Center</h1>
      <p className={styles.crtText}>🧠 Users flagged by audit trail for anomaly detection or manual review.</p>

      {loading ? <p className={styles.crtText}>🔍 Scanning logs...</p> : (
        <div className={styles.crtScrollBox}>
          {flaggedUsers.length === 0 ? (
            <p className={styles.crtText}>✅ No active risk flags.</p>
          ) : (
            flaggedUsers.map((user, i) => (
              <div key={i} className={styles.crtCard}>
                <h3>{user.alias} ({user.id})</h3>
                <p className={styles.crtText}>🔓 Role: {user.role} — 💠 XP: {user.xp?.toLocaleString()}</p>
                <ul style={{ fontSize: '0.8rem', color: '#ffa' }}>
                  {user.logs.map((log: any, j: number) => (
                    <li key={j}>⚠️ {log.action} — {new Date(log.timestamp).toLocaleString()}</li>
                  ))}
                </ul>
                <div style={{ marginTop: '0.5rem' }}>
                  <Link href="/audit-dashboard" className={styles.crtButton}>🔎 View Audit Trail</Link>
                  <button onClick={() => freezeUser(user.id)} className={styles.crtButton} style={{ marginLeft: '0.5rem' }}>
                    🧊 Freeze Account
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default withAdminGate(RiskCenter);