// pages/security/auth.tsx
import { useEffect, useState, FormEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withGuardianGate from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string>('');
  const [alpacaKey, setAlpacaKey] = useState<string>('');
  const [alpacaSecret, setAlpacaSecret] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Dev bypass (optional)
  useEffect(() => {
    const devBypass = typeof window !== 'undefined' ? localStorage.getItem('dev-bypass') : null;
    if (devBypass === 'true') router.push('/dashboard').catch(() => {});
  }, [router]);

  // If already authenticated, go to dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push('/dashboard').catch(() => {});
    };
    void checkUser();
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 1) Supabase magic link login
    const { error: otpError } = await supabase.auth.signInWithOtp({ email });
    if (otpError) {
      setMessage(otpError.message);
      setLoading(false);
      return;
    }

    // 2) Optional Alpaca API key validation
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
        setMessage(err?.message ?? 'Alpaca validation failed.');
        setLoading(false);
        return;
      }
    }

    // 3) Store broker keys (only if not already saved)
    try {
      const { data: existing, error: existErr } = await supabase
        .from('broker_links')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (!existErr && (!existing || existing.length === 0)) {
        await supabase.from('broker_links').insert({
          email,
          alpaca_key: alpacaKey || null,
          alpaca_secret: alpacaSecret || null,
        });
      }
    } catch (err) {
      // non-fatal
      console.error('❌ Supabase error in auth.tsx (broker_links):', err);
    }

    // 4) Log referral if a referral code exists locally
    try {
      const ref = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;
      if (ref) {
        await supabase.from('referral_logs').insert({
          referred_email: email,
          ref_code: ref,
        });
      }
    } catch (err) {
      // non-fatal
      console.error('❌ Supabase error in auth.tsx (referral_logs):', err);
    }

    // 5) Assign engine key + alias if profile incomplete
    try {
      const { data: profile, error: profErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .limit(1)
        .single();

      if (!profErr) {
        if (!profile?.engine_key) {
          const ENGINE_POOL = ['snowbase', 'jarvis', 'synapse', 'comet', 'vector'];
          const assignedEngine = ENGINE_POOL[Math.floor(Math.random() * ENGINE_POOL.length)];
          const alias = `Operator-${Math.floor(10000 + Math.random() * 90000)}`;

          await supabase
            .from('user_profiles')
            .update({ engine_key: assignedEngine, alias })
            .eq('email', email);
        }
      }
    } catch (err) {
      // non-fatal
      console.error('❌ Supabase error in auth.tsx (user_profiles):', err);
    }

    setMessage('✅ Check your email for the login link.');
    setLoading(false);
  };

  return (
    <div className={styles.crtScreen}>
      <Head>
        <title>Felena Theory</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <h1 className={styles.crtTitle}>🔐 OPERATOR ACCESS</h1>

      <form onSubmit={handleLogin} style={{ maxWidth: 560, width: '100%' }}>
        <input
          className={styles.crtInput}
          placeholder="Your Email"
          type="email"
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
          {loading ? '⏳ Connecting…' : 'REQUEST LOGIN'}
        </button>

        {message && (
          <p style={{ color: message.startsWith('✅') ? '#8eff8e' : '#f66', marginTop: '1rem' }}>
            {message}
          </p>
        )}
      </form>

      <div className={styles.scanlines} />
    </div>
  );
}

export default withGuardianGate(AuthPage);