// pages/payment.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { useRouter } from 'next/router';

function PaymentPage() {
export default withGuardianGate(Page);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to initiate checkout. Please try again later.');
      setLoading(false);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>💳 Felena Vision Payment</h1>
      <p className={styles.crtText}>
        This is a one-time $100 unlock for Felena Vision access.
        <br />
        You’ll receive:
        <ul>
          <li>🎖 Vision Badge</li>
          <li>📦 Rare XP Crate</li>
          <li>🔓 Engine Grid Access</li>
          <li>🧬 Personalized Keycard</li>
        </ul>
        <br />
        By continuing, you agree to our <a href="/terms" target="_blank">XP Terms</a>.
      </p>

      {error && <p className={styles.crtText} style={{ color: '#f66' }}>{error}</p>}

      <div className={styles.crtMenu}>
        <button className={styles.crtButton} onClick={handleCheckout} disabled={loading}>
          {loading ? 'Processing...' : '💸 Continue to Payment'}
        </button>
      </div>
    </div>
  );
}