import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function DepositPage() {
export default withGuardianGate(Page);
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    setMessage('');

    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user) {
      setMessage('❌ You must be logged in.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId: user.id }),
      });

      const { url, error: err } = await res.json();
      if (err || !url) throw new Error(err || 'Unknown error');
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setMessage('❌ Stripe error. Please try again.');
    }

    setLoading(false);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>💵 DEPOSIT FUNDS →</h2>
      <p>
        Convert USD into XP. Every $1 = 1 XP. Funds are routed through Operator Stripe terminal.
        After success, you’ll continue to the <strong>ATM Payout Simulator</strong>.
      </p>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="bg-black text-green-400 border border-green-600 p-2 mt-4"
        placeholder="Amount"
        min={5}
      />

      <button
        className={styles.crtButton}
        onClick={handleDeposit}
        disabled={loading || amount < 5}
        style={{ marginTop: '1rem' }}
      >
        ▶ Send ${amount} → {amount} XP
      </button>

      {message && (
        <p style={{ color: '#ff0044', marginTop: '1rem' }}>{message}</p>
      )}
    </div>
  );
}