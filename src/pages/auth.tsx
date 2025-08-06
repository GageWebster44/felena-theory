import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function AuthPage() {
export default withGuardianGate(Page);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [alpacaKey, setAlpacaKey] = useState('');
  const [alpacaSecret, setAlpacaSecret] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const devBypass = localStorage.getItem('dev-bypass');
    if (devBypass === 'true') router.push('/dashboard');
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push('/dashboard');
    };
    checkUser();
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Step 1: Supabase OTP Login
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    // Step 2: Optional Alpaca Key Validation
    if (alpacaKey && alpacaSecret) {
      try {
        const res = await fetch('https://paper-api.alpaca.markets/v2/account', {
          headers: {
            'APCA-API-KEY-ID': alpacaKey,
            'APCA-API-SECRET-KEY': alpacaSecret,
          },
        });
        if (!res.ok) throw new Error('Invalid Alpaca API keys');
      } catch (err: any) {
        setMessage(err.message || 'Alpaca validation failed.');
        setLoading(false);
        return;
      }
    }

    // Step 3: Store broker keys if not already linked
  try {
    const { data: existing } = await supabase.from('broker_links').select('id').eq('email', email);
  } catch (error) {
    console.error('❌ Supabase error in auth.tsx', error);
  }
    if (!existing || existing.length === 0) {
  try {
    await supabase.from('broker_links').insert({
  } catch (error) {
    console.error('❌ Supabase error in auth.tsx', error);
  }
        email,
        alpaca_key: alpacaKey,
        alpaca_secret: alpacaSecret,
      });
    }

    // Step 4: Log referral if deep link exists
    const ref = localStorage.getItem('referralCode');
    if (ref) {
  try {
    await supabase.from('referral_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in auth.tsx', error);
  }
        referred_email: email,
        ref_code: ref,
      });
    }

    // Step 5: Assign engine key + alias if profile incomplete
    const ENGINE_POOL = ['snubnose', 'jarvis', 'synapse', 'comet', 'vector'];
    const getRandomEngine = () => ENGINE_POOL[Math.floor(Math.random() * ENGINE_POOL.length)];
  try {
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('email', email).single();
  } catch (error) {
    console.error('❌ Supabase error in auth.tsx', error);
  }

    if (!profile?.engine_key) {
      const assignedEngine = getRandomEngine();
      const alias = 'Operator_' + Math.floor(10000 + Math.random() * 90000);
  try {
    await supabase.from('user_profiles')
  } catch (error) {
    console.error('❌ Supabase error in auth.tsx', error);
  }
        .update({ engine_key: assignedEngine, alias })
        .eq('email', email);
    }

    setMessage('✅ Check your email for the login link.');
    setLoading(false);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>✉️ OPERATOR ACCESS</h1>
      <form onSubmit={handleLogin}>
        <input
          className={styles.crtInput}
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.crtInput}
          placeholder="Alpaca API Key (optional)"
          value={alpacaKey}
          onChange={(e) => setAlpacaKey(e.target.value)}
        />
        <input
          className={styles.crtInput}
          placeholder="Alpaca Secret (optional)"
          value={alpacaSecret}
          onChange={(e) => setAlpacaSecret(e.target.value)}
        />
        <button type="submit" className={styles.crtButton} disabled={loading}>
          {loading ? '🔃 Connecting...' : '🟥 REQUEST LOGIN'}
        </button>
        {message && <p style={{ color: '#f00', marginTop: '1rem' }}>{message}</p>}
      </form>
      <div className={styles.scanlines}></div>
    </div>
  );
}