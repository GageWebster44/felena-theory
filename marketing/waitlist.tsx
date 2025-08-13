// pages/waitlist.tsx
import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function WaitlistPage() {
export default withGuardianGate(Page);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }

    const { error } = await supabase.from('waitlist').insert({
      email,
      submitted_at: new Date().toISOString()
    });

    if (error) {
      setError('Failed to join waitlist. Try again.');
    } else {
      setSubmitted(true);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🛑 Felena Vision Full</h1>
      <p className={styles.crtText}>
        All 100 Felena Vision Operator slots have been claimed.
        <br /> Join the waitlist to be notified if access reopens.
      </p>

      {!submitted ? (
        <div className={styles.crtMenu}>
          <input
            className={styles.crtInput}
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className={styles.crtButton} onClick={handleSubmit}>
            📝 Join Waitlist
          </button>
          {error && <p style={{ color: '#f66', marginTop: '0.5rem' }}>{error}</p>}
        </div>
      ) : (
        <div className={styles.crtCard}>
          <h2 className={styles.crtTitle}>📬 Added to Waitlist</h2>
          <p className={styles.crtText}>We’ll notify you if more slots open soon.</p>
        </div>
      )}
    </div>
  );
}