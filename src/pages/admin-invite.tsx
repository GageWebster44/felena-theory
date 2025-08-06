// pages/admin-invite.tsx
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { CSVLink } from 'react-csv';
import Fuse from 'fuse.js';

interface Invite {
  id: string;
  code: string;
  label: string;
  xp_reward: number;
  crate_reward: boolean;
  max_uses: number;
  used_by: string[];
  created_by: string;
  created_at: string;
}

function AdminInviteGenerator() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [label, setLabel] = useState('');
  const [xp, setXP] = useState(0);
  const [crate, setCrate] = useState(false);
  const [maxUses, setMaxUses] = useState(1);
  const [filter, setFilter] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (user?.user?.id) setUserId(user.user.id);
  try {
    const { data } = await supabase.from('invite_codes').select('*').order('created_at', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin-invite.tsx', error);
  }
    setInvites(data || []);
  };

  const generateInvite = async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error } = await supabase.from('invite_codes').insert({
      code,
      label,
      xp_reward: xp,
      crate_reward: crate,
      max_uses: maxUses,
      used_by: [],
      created_by: userId
    });
    if (!error) {
      setLabel('');
      setXP(0);
      setCrate(false);
      setMaxUses(1);
      fetchInvites();
    }
  };

  const filteredInvites = filter
    ? new Fuse(invites, { keys: ['label', 'code', 'created_by'], threshold: 0.3 }).search(filter).map(r => r.item)
    : invites;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🎟️ Invite Generator</h1>

      <div className={styles.crtMenu}>
        <input className={styles.crtInput} placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <input className={styles.crtInput} type="number" placeholder="XP Reward" value={xp} onChange={(e) => setXP(parseInt(e.target.value))} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={crate} onChange={() => setCrate(!crate)} /> Crate Reward
        </label>
        <input className={styles.crtInput} type="number" placeholder="Max Uses" value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value))} />
        <button className={styles.crtButton} onClick={generateInvite}>➕ Generate</button>
      </div>

      <input
        type="text"
        className={styles.crtInput}
        placeholder="Search invites..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <CSVLink data={invites} filename="invite_codes_export.csv" className={styles.crtButton} style={{ marginTop: '1rem' }}>
        📤 Export CSV
      </CSVLink>

      <div className={styles.crtScrollBox} style={{ marginTop: '1rem' }}>
        {filteredInvites.map((invite, i) => (
          <div key={i} className={styles.crtCard}>
            <p><strong>🔗 Code:</strong> {invite.code}</p>
            <p><strong>🏷️ Label:</strong> {invite.label}</p>
            <p><strong>🎯 XP:</strong> {invite.xp_reward}</p>
            <p><strong>📦 Crate:</strong> {invite.crate_reward ? 'Yes' : 'No'}</p>
            <p><strong>🔄 Max Uses:</strong> {invite.max_uses}</p>
            <p><strong>👥 Used By:</strong> {invite.used_by.length}</p>
            <p><strong>👨‍💻 Admin:</strong> {invite.created_by}</p>
            <p style={{ fontSize: '0.75rem' }}>{new Date(invite.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}

export default withAdminGate(AdminInviteGenerator);