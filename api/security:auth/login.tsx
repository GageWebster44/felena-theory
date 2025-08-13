// pages/security/auth/login.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withGuardianGate from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

type IpifyResponse = { ip: string };

const RATE_LIMIT = 5;          // UI gate per session
const OTP_COOLDOWN_MS = 30_000; // 30s UI cooldown

export default withGuardianGate(function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  // If already logged in, bounce to dashboard
  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.replace('/dashboard');
    };
    run().catch(() => {});
  }, [router]);

  // Optional: dev bypass
  useEffect(() => {
    try {
      const devBypass = localStorage.getItem('dev-bypass');
      if (devBypass === 'true') router.replace('/dashboard');
    } catch {}
  }, [router]);

  // Simple client “captcha” stub (always returns true for now)
  const validateCaptcha = async () => true;

  const handleLogin = async () => {
    setError(null);

    // UI rate limit
    if (attempts >= RATE_LIMIT) {
      setError('Too many attempts. Please wait a bit before trying again.');
      return;
    }
    if (cooldownUntil > Date.now()) {
      const secs = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setError(`Please wait ${secs}s before requesting another code.`);
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    const passed = await validateCaptcha();
    if (!passed) {
      setError('CAPTCHA verification failed.');
      return;
    }

    setLoading(true);
    setAttempts(prev => prev + 1);

    try {
      // Record IP (best‑effort; ignore failures)
      let ip = 'unknown';
      try {
        const r = await fetch('https://api.ipify.org?format=json');
        const j = (await r.json()) as IpifyResponse;
        if (j?.ip) ip = j.ip;
      } catch {}

      // Send magic link
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email });
      if (otpErr) throw otpErr;

      // Persist a quick audit (best‑effort)
      try {
        await supabase.from('login_logs').insert({
          email,
          ip_address: ip,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        // non‑fatal
        console.error('[login.tsx] Supabase error (login_logs):', e);
      }

      // If a referral was set locally, persist it once
      try {
        const ref = localStorage.getItem('referralCode');
        if (ref) {
          await supabase.from('referral_logs').insert({
            referred_email: email,
            ref_code: ref,
            ip_address: ip,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('[login.tsx] Supabase error (referral_logs):', e);
      }

      setSent(true);
      setCooldownUntil(Date.now() + OTP_COOLDOWN_MS);
    } catch (e: any) {
      console.error('[login.tsx] OTP error:', e);
      setError(e?.message ?? 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const disabled =
    loading ||
    !email.includes('@') ||
    attempts >= RATE_LIMIT ||
    cooldownUntil > Date.now();

  return (
    <>
      <Head>
        <title>Felena Theory</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <div className={styles.crtScreen}>
        <h2 className={styles.crtTitle}>🛡️ FELENA THEORY ACCESS</h2>
        <p>Enter your operator email to receive a one‑time login code.</p>

        <div style={{ maxWidth: 520, width: '100%', marginTop: '1rem' }}>
          <input
            className={styles.crtInput}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="button"
            className={styles.crtButton}
            disabled={disabled}
            onClick={handleLogin}
            style={{ marginTop: '0.75rem' }}
          >
            {loading ? 'Sending…' : '📩 Send Login Code'}
          </button>

          {sent && (
            <p style={{ color: '#0f0', marginTop: '1rem' }}>
              ✅ OTP sent to your inbox. Check your email to continue.
            </p>
          )}

          {error && (
            <p style={{ color: '#f00', marginTop: '1rem' }}>
              ✖ {error}
            </p>
          )}

          {attempts > 0 && attempts < RATE_LIMIT && (
            <p style={{ color: '#aaa', marginTop: '0.5rem', fontSize: 12 }}>
              Attempts: {attempts}/{RATE_LIMIT}
            </p>
          )}
        </div>

        <div className={styles.scanlines} />
      </div>
    </>
  );
});