// pages/grant.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import badgeList from '@/data/badgeList';

function GrantBadgePage() {
  const [email, setEmail] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [status, setStatus] = useState('');

  const handleGrant = async () => {
    setStatus('');
    if (!email || !selectedBadge) return setStatus('❌ Email and badge are required.');

  try {
    const { data: user } = await supabase.from('user_profiles').select('id').eq('email', email).single();
  } catch (error) {
    console.error('❌ Supabase error in grant.tsx', error);
  }
    if (!user) return setStatus('❌ User not found.');

    const badge = badgeList.find(b => b.label === selectedBadge);
    if (!badge) return setStatus('❌ Invalid badge selected.');

  try {
    await supabase.from('user_badges').insert({
  } catch (error) {
    console.error('❌ Supabase error in grant.tsx', error);
  }
      user_id: user.id,
      label: selectedBadge,
      source: 'manual',
      timestamp: new Date().toISOString()
    });

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in grant.tsx', error);
  }
      user_id: user.id,
      amount: 0,
      reason: `Badge granted: ${selectedBadge} (by admin)` ,
      timestamp: new Date().toISOString(),
      type: 'badge'
    });

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in grant.tsx', error);
  }
      user_id: 'admin',
      action: `Granted badge '${selectedBadge}' to ${user.id}`,
      timestamp: new Date().toISOString()
    });

    setStatus('✅ Badge granted successfully.');
    setEmail('');
    setSelectedBadge('');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🎖 Grant a Badge</h1>
      <p className={styles.crtText}>Search user by email and assign any system badge.</p>

      <div className={styles.crtMenu}>
        <input
          type="email"
          className={styles.crtInput}
          placeholder="User email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className={styles.crtInput}
          value={selectedBadge}
          onChange={(e) => setSelectedBadge(e.target.value)}
        >
          <option value="">-- Select Badge --</option>
          {badgeList.map((b, i) => (
            <option key={i} value={b.label}>{b.label}</option>
          ))}
        </select>
        <button className={styles.crtButton} onClick={handleGrant}>🎁 Grant Badge</button>
      </div>

      {status && <p className={styles.crtText} style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}

export default withAdminGate(GrantBadgePage);