// pages/admin/manual-invite.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { toast } from 'react-hot-toast';
import { sendWelcomeEmail } from '@/utils/send-welcome-email';

function ManualInvite() {
  const [invites, setInvites] = useState<any[]>([]);
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [selectedIP, setSelectedIP] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    const { data } = await supabase
      .from('manual_invites')
      .select('*')
      .order('issued_at', { ascending: false });
    setInvites(data || []);
  };

  const submitFinalInvite = async () => {
    if (!selectedIP || !alias || !email) return;

    const { error: updateError } = await supabase.from('manual_invites').update({
      alias,
      email,
      status: 'approved',
      approved_at: new Date().toISOString()
    }).eq('ip_address', selectedIP);

    if (updateError) {
      toast.error('Failed to finalize invite');
      return;
    }

  try {
    await supabase.from('user_profiles').insert({
  } catch (error) {
    console.error('❌ Supabase error in manual-invite.tsx', error);
  }
      id: email,
      alias,
      email,
      xp: 0,
      role: 'observer',
      created_at: new Date().toISOString()
    });

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in manual-invite.tsx', error);
  }
      user_id: email,
      amount: 100,
      reason: 'Manual Invite Bonus',
      type: 'manual',
      timestamp: new Date().toISOString(),
      season: 1
    });

    toast.success('Invite finalized + 100 XP injected');
    sendWelcomeEmail(email);
    setAlias('');
    setEmail('');
    setSelectedIP(null);
    fetchInvites();
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>🎟️ Finalize Manual Invites</h1>

      <div className={styles.crtScrollBox}>
        {invites.map((invite, i) => (
          <div key={i} className={styles.crtCard}>
            <p className={styles.crtText}>IP: {invite.ip_address}</p>
            <p className={styles.crtText}>Status: {invite.status}</p>
            {invite.status === 'pending' && (
              <button
                className={styles.crtButton}
                onClick={() => setSelectedIP(invite.ip_address)}
              >
                ✅ Finalize Invite
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedIP && (
        <div className={styles.crtCard} style={{ marginTop: '2rem' }}>
          <h3 className={styles.crtTitle}>Assign Operator Info</h3>
          <p className={styles.crtText}>IP: {selectedIP}</p>
          <input
            className={styles.crtInput}
            placeholder="Operator Alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <input
            className={styles.crtInput}
            placeholder="Contact Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className={styles.crtButton} onClick={submitFinalInvite}>
            🚀 Confirm Invite
          </button>
        </div>
      )}
    </div>
  );
}

export default withAdminGate(ManualInvite);