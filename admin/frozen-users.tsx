// pages/frozen-users.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

function FrozenUsers() {
  const [frozen, setFrozen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');

  useEffect(() => {
    loadFrozen();
    trackVisit();
  }, []);

  const loadFrozen = async () => {
  try {
    const { data: frozenUsers } = await supabase.from('user_profiles').select('*').eq('status', 'frozen');
  } catch (error) {
    console.error('❌ Supabase error in frozen-users.tsx', error);
  }

    const enriched = await Promise.all(
      frozenUsers.map(async (user) => {
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('user_id, action, timestamp')
          .ilike('action', `%Froze user ${user.id}%`)
          .order('timestamp', { ascending: false })
          .limit(1);
        const last = logs?.[0];
        return {
          ...user,
          frozen_by: last?.user_id || 'Unknown',
          frozen_at: last?.timestamp || 'Unknown'
        };
      })
    );

    setFrozen(enriched);
    setLoading(false);
  };

  const trackVisit = async () => {
    const { data: session } = await supabase.auth.getUser();
    if (session?.user?.id) {
      setAdminId(session.user.id);
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in frozen-users.tsx', error);
  }
        user_id: session.user.id,
        action: 'Viewed Frozen Users page',
        timestamp: new Date().toISOString()
      });
    }
  };

  const unfreeze = async (id: string) => {
  try {
    await supabase.from('user_profiles').update({ status: 'active' }).eq('id', id);
  } catch (error) {
    console.error('❌ Supabase error in frozen-users.tsx', error);
  }
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in frozen-users.tsx', error);
  }
      user_id: adminId,
      action: `Unfroze user ${id} via Frozen Users page`,
      timestamp: new Date().toISOString()
    });
    loadFrozen();
  };

  const csvData = frozen.map(user => ({
    id: user.id,
    alias: user.alias,
    role: user.role,
    xp: user.xp,
    frozen_by: user.frozen_by,
    frozen_at: user.frozen_at
  }));

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>🧊 Frozen User Registry</h1>
      <p className={styles.crtText}>All accounts currently frozen by admin or audit trail.</p>

      <div className={styles.crtMenu}>
        <CSVLink data={csvData} filename="frozen_users_export.csv" className={styles.crtButton}>
          📤 Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <p className={styles.crtText}>🔍 Fetching frozen accounts...</p>
      ) : (
        <div className={styles.crtScrollBox}>
          {frozen.length === 0 ? (
            <p className={styles.crtText}>✅ No frozen accounts.</p>
          ) : (
            frozen.map((user, i) => (
              <div key={i} className={styles.crtCard}>
                <h3>{user.alias || user.username} ({user.id})</h3>
                <p className={styles.crtText}>💠 XP: {user.xp?.toLocaleString()} — 🔓 Role: {user.role}</p>
                <p className={styles.crtText}>🧊 Frozen by: {user.frozen_by} — at: {new Date(user.frozen_at).toLocaleString()}</p>
                <button onClick={() => unfreeze(user.id)} className={styles.crtButton}>🔓 Unfreeze</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default withAdminGate(FrozenUsers);