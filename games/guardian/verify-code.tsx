import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function VerifyCode() {
export default withGuardianGate(Page);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVerify = async () => {
    setStatus('verifying');
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'magiclink',
      });

      if (verifyError || !data?.session) {
        setStatus('error');
        setError(verifyError?.message || 'Invalid code or expired session.');
        return;
      }

      setStatus('success');
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className="text-2xl text-green-400 font-mono mb-4">🔑 ENTER VERIFICATION CODE</h1>
      <p className="text-sm text-gray-300 mb-2">Check your inbox for a magic link or 6-digit code.</p>

      <input
        className={styles.crtInput}
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={styles.crtInput}
        type="text"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
      />
      <button className={styles.crtButton} onClick={handleVerify} disabled={status === 'verifying'}>
        {status === 'verifying' ? '⏳ Verifying...' : '✅ Verify Code'}
      </button>

      {status === 'error' && <p className="text-red-500 mt-3">❌ {error}</p>}
      {status === 'success' && <p className="text-green-400 mt-3">✅ Verified! Redirecting...</p>}
    </div>
  );
}