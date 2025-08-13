// pages/admin-ban.tsx
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import Fuse from 'fuse.js';
import { CSVLink } from 'react-csv';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  xp: number;
  status: string;
}

function AdminBanPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filter, setFilter] = useState('');
  const [flagged, setFlagged] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchFlagged();
  }, []);

  const fetchUsers = async () => {
  try {
    const { data } = await supabase.from('user_profiles').select('*');
  } catch (error) {
    console.error('❌ Supabase error in admin-ban.tsx', error);
  }
    setUsers(data || []);
  };

  const fetchFlagged = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('user_id')
      .ilike('action', '%⚠️%');
    const flaggedIds = Array.from(new Set(data?.map(d => d.user_id) || []));
    setFlagged(flaggedIds);
  };

  const updateStatus = async (id: string, status: string) => {
  try {
    await supabase.from('user_profiles').update({ status }).eq('id', id);
  } catch (error) {
    console.error('❌ Supabase error in admin-ban.tsx', error);
  }
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-ban.tsx', error);
  }
      user_id: 'admin',
      action: `${status === 'banned' ? '⛔' : '🧊'} Admin marked user ${id} as ${status}`,
      timestamp: new Date().toISOString()
    });
    fetchUsers();
  };

  const filtered = filter
    ? new Fuse(users, { keys: ['email', 'id', 'role'], threshold: 0.3 })
        .search(filter).map(r => r.item)
    : users;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🚫 Admin Ban / Freeze Panel</h1>

      <input
        className={styles.crtInput}
        placeholder="Search by email, ID, or role..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <CSVLink data={users} filename="ban_freeze_export.csv" className={styles.crtButton}>
        📤 Export CSV
      </CSVLink>

      <div className={styles.crtScrollBox}>
        {filtered.map((u) => (
          <div key={u.id} className={styles.crtCard} style={{ borderColor: flagged.includes(u.id) ? '#f66' : '#666' }}>
            <p><strong>📧 Email:</strong> {u.email}</p>
            <p><strong>🆔 ID:</strong> {u.id}</p>
            <p><strong>🔓 Role:</strong> {u.role}</p>
            <p><strong>💠 XP:</strong> {u.xp.toLocaleString()}</p>
            <p><strong>🚨 Status:</strong> {u.status || 'active'}</p>
            {flagged.includes(u.id) && <p style={{ color: '#f66' }}>⚠️ Flagged for repeated audit violations</p>}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button onClick={() => updateStatus(u.id, 'frozen')} className={styles.crtButton}>🧊 Freeze</button>
              <button onClick={() => updateStatus(u.id, 'banned')} className={styles.crtButton}>⛔ Ban</button>
              <button onClick={() => updateStatus(u.id, 'active')} className={styles.crtButton}>✅ Reinstate</button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}

export default withAdminGate(AdminBanPanel);