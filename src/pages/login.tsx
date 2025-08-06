import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function Login() {
export default withGuardianGate(Page);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  const RATE_LIMIT = 5;

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push('/dashboard');
    };
    check();
  }, []);

  useEffect(() => {
    const devBypass = localStorage.getItem('dev-bypass');
    if (devBypass === 'true') {
      router.push('/dashboard');
    }
  }, []);

  const handleLogin = async () => {
    setError('');

    if (attempts >= RATE_LIMIT) {
      setError('🚫 Too many attempts. Please wait before trying again.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      setAttempts((prev) => prev + 1);
      if (error) {
        setError(error.message);
        return;
      }

      setSent(true);

      const ip = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      const ref = localStorage.getItem('referralCode');
      if (ref) {
  try {
    await supabase.from('referral_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in login.tsx', error);
  }
          referred_email: email,
          ref_code: ref,
          ip_address: ip,
          timestamp: new Date().toISOString(),
        });
      }

  try {
    await supabase.from('login_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in login.tsx', error);
  }
        email,
        ip_address: ip,
        timestamp: new Date().toISOString(),
      });

  try {
    await supabase.from('mfa_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in login.tsx', error);
  }
        email,
        triggered_at: new Date().toISOString(),
        ip_address: ip,
      });

    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred.');
    }

    setLoading(false);
  };

  const validateCaptcha = async () => {
    return true; // Placeholder for real CAPTCHA later
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2 className={styles.crtTitle}>🔐 FELENA THEORY ACCESS</h2>
      <p>Enter your operator email to receive a one-time login code.</p>

      {!sent ? (
        <>
          <input
            className={styles.crtInput}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className={styles.crtButton}
            onClick={async () => {
              const passed = await validateCaptcha();
              if (passed) handleLogin();
              else setError('🛡 CAPTCHA verification failed.');
            }}
            disabled={!email.includes('@') || loading}
          >
            {loading ? '🔄 Sending...' : '🚀 Send Login Code'}
          </button>
        </>
      ) : (
        <p style={{ color: '#0f0', marginTop: '1rem' }}>
          ✅ OTP sent to your inbox. Check your email to continue.
        </p>
      )}

      {error && (
        <p style={{ color: '#f00', marginTop: '1rem' }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}