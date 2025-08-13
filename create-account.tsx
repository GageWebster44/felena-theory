// pages/create-account.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import toast from 'react-hot-toast';

function CreateAccountPage() {
export default withGuardianGate(Page);
  const router = useRouter();
  const { email, alias } = router.query;

  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [alpacaKey, setAlpacaKey] = useState('');
  const [cardLinked, setCardLinked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Create Operator Account';
  }, []);

  const handleLinkCard = async () => {
    toast.success('🔗 Redirecting to secure card link...');
    window.open('https://stripe.com/customers', '_blank');
    setCardLinked(true);

    if (email) {
  try {
    await supabase.from('card_links').insert({
  } catch (error) {
    console.error('❌ Supabase error in create-account.tsx', error);
  }
        email: String(email),
        linked_at: new Date().toISOString()
      });
    }
  };

  const handleCreate = async () => {
    if (!email || !alias || !password || !alpacaKey || !acceptedTerms || !cardLinked) {
      toast.error('All fields are required including Alpaca Key and card link.');
      return;
    }
    setSubmitting(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: String(email),
      password,
      options: {
        data: {
          alias: String(alias),
          role: 'operator',
          alpaca_key: alpacaKey
        }
      }
    });

    if (signUpError) {
      toast.error(signUpError.message);
      setSubmitting(false);
      return;
    }

  try {
    await supabase.from('user_profiles').upsert({
  } catch (error) {
    console.error('❌ Supabase error in create-account.tsx', error);
  }
      id: String(email),
      email: String(email),
      alias: String(alias),
      xp: 0,
      role: 'operator',
      alpaca_key: alpacaKey,
      created_at: new Date().toISOString()
    });

    // Attempt auto-login after creation
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: String(email),
      password
    });

    if (loginError) {
      toast.error('Account created but auto-login failed. Please log in manually.');
      setSubmitting(false);
      return;
    }

    toast.success('✅ Account created and logged in!');
    setSubmitting(false);
    router.push('/onboard');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🚀 Create Operator Account</h1>
      <p className={styles.crtText}>Complete your entry into the Felena Grid.</p>

      <div className={styles.crtMenu}>
        <input
          className={styles.crtInput}
          value={String(alias)}
          readOnly
          placeholder="Alias"
        />
        <input
          className={styles.crtInput}
          value={String(email)}
          readOnly
          placeholder="Email"
        />
        <input
          className={styles.crtInput}
          type="password"
          placeholder="Set a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className={styles.crtInput}
          placeholder="Required: Alpaca API Key"
          value={alpacaKey}
          onChange={(e) => setAlpacaKey(e.target.value)}
        />
        <p className={styles.crtText} style={{ fontSize: '0.8rem' }}>
          💡 Your Alpaca key securely connects your cashout to real markets.
          <br />Need help? <a href="https://app.alpaca.markets/signup" target="_blank" rel="noopener noreferrer">Create an Alpaca account</a>
        </p>

        <button className={styles.crtButton} onClick={handleLinkCard}>
          💳 Link Card to Activate XP System
        </button>
        <p className={styles.crtText} style={{ fontSize: '0.8rem', color: cardLinked ? '#0f0' : '#f88' }}>
          {cardLinked ? '✅ Card linked successfully!' : 'Required for $ → XP conversion and in-grid actions.'}
        </p>

        <label className={styles.crtText}>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={() => setAcceptedTerms(!acceptedTerms)}
            style={{ marginRight: '0.5rem' }}
          />
          I accept the <a href="/terms" target="_blank">Terms of Use</a>
        </label>

        <button className={styles.crtButton} onClick={handleCreate} disabled={submitting}>
          ✅ Create Account
        </button>
      </div>
    </div>
  );
}