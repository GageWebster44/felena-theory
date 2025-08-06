// pages/invite-claim.tsx
import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function InviteClaimPage() {
export default withGuardianGate(Page);
  const [email, setEmail] = useState('');
  const [alias, setAlias] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'approved' | 'denied'>('idle');
  const [message, setMessage] = useState('');

  const handleClaim = async () => {
    setStatus('checking');
    setMessage('');

    const { data } = await supabase
      .from('manual_invites')
      .select('*')
      .eq('email', email)
      .eq('alias', alias)
      .eq('status', 'approved')
      .single();

    if (data) {
      setStatus('approved');
      setMessage('✅ Invite verified! You may now proceed to login and begin onboarding.');
    } else {
      setStatus('denied');
      setMessage('❌ No matching approved invite found. Please double-check your entry.');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🎟️ Claim Your Operator Invite</h1>
      <p className={styles.crtText}>Enter your invite alias and email to unlock access.</p>

      <div className={styles.crtMenu}>
        <input
          className={styles.crtInput}
          placeholder="Your Alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <input
          className={styles.crtInput}
          placeholder="Your Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className={styles.crtButton} onClick={handleClaim}>
          ✅ Verify Invite
        </button>
      </div>

      {message && (
        <p style={{ color: status === 'approved' ? '#0f0' : '#f66' }}>{message}</p>
      )}
    </div>
  );
}