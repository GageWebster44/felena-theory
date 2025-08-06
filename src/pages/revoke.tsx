// pages/revoke.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function RevokeBadgePage() {
  const [email, setEmail] = useState('');
  const [badges, setBadges] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [status, setStatus] = useState('');

  const fetchBadges = async () => {
    setBadges([]);
    setSelectedBadge('');
    setStatus('');
    if (!email) return;
  try {
    const { data: user } = await supabase.from('user_profiles').select('id').eq('email', email).single();
  } catch (error) {
    console.error('❌ Supabase error in revoke.tsx', error);
  }
    if (!user) return setStatus('❌ User not found.');

  try {
    const { data } = await supabase.from('user_badges').select('label').eq('user_id', user.id);
  } catch (error) {
    console.error('❌ Supabase error in revoke.tsx', error);
  }
    if (!data || data.length === 0) return setStatus('❌ No badges found.');

    setBadges(data.map(b => b.label));
  };

  const handleRevoke = async () => {
    setStatus('');
    if (!email || !selectedBadge) return setStatus('❌ Email and badge are required.');

  try {
    const { data: user } = await supabase.from('user_profiles').select('id').eq('email', email).single();
  } catch (error) {
    console.error('❌ Supabase error in revoke.tsx', error);
  }
    if (!user) return setStatus('❌ User not found.');

  try {
    await supabase.from('user_badges').delete().eq('user_id', user.id).eq('label', selectedBadge);
  } catch (error) {
    console.error('❌ Supabase error in revoke.tsx', error);
  }

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in revoke.tsx', error);
  }
      user_id: user.id,
      amount: 0,
      reason: `Badge revoked: ${selectedBadge} (by admin)` ,
      timestamp: new Date().toISOString(),
      type: 'badge'
    });

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in revoke.tsx', error);
  }
      user_id: 'admin',
      action: `Revoked badge '${selectedBadge}' from ${user.id}`,
      timestamp: new Date().toISOString()
    });

    setStatus('✅ Badge revoked successfully.');
    setBadges([]);
    setSelectedBadge('');
    setEmail('');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🧯 Revoke a Badge</h1>
      <p className={styles.crtText}>Search user by email, view their badges, and revoke one manually.</p>

      <div className={styles.crtMenu}>
        <input
          type="email"
          className={styles.crtInput}
          placeholder="User email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={fetchBadges} className={styles.crtButton}>🔍 Load Badges</button>
        {badges.length > 0 && (
          <select
            className={styles.crtInput}
            value={selectedBadge}
            onChange={(e) => setSelectedBadge(e.target.value)}
          >
            <option value="">-- Select Badge to Revoke --</option>
            {badges.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>
        )}
        {badges.length > 0 && (
          <button onClick={handleRevoke} className={styles.crtButton}>🧯 Revoke Badge</button>
        )}
      </div>

      {status && <p className={styles.crtText} style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}

export default withAdminGate(RevokeBadgePage);