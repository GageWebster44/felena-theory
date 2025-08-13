// pages/success.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/crtLaunch.module.css';

function SuccessPage() {
export default withGuardianGate(Page);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const { session_id } = router.query;

  useEffect(() => {
    if (!session_id) {
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-stripe-session?session_id=${session_id}`);
        const data = await res.json();
        setVerified(data.success || false);
      } catch {
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [session_id]);

  useEffect(() => {
    if (!verified) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/felena-vision');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verified]);

  return (
    <div className={styles.crtScreen}>
      <Head>
        <title>✅ Felena Vision: Payment Success</title>
        <meta name="description" content="Felena Vision payment successful. Your operator access has been granted. Redirecting to your Vision Portal..." />
      </Head>

      <h1 className={styles.crtTitle}>✅ Payment Confirmed</h1>

      {loading ? (
        <p className={styles.crtText}>⏳ Verifying your transaction...</p>
      ) : verified ? (
        <div className={styles.crtCard}>
          <p className={styles.crtText}>✅ <strong>Felena Vision Access Granted</strong></p>
          <p className={styles.crtText}>🎖 Your badge, XP crate, and system role have been automatically issued.</p>
          <p className={styles.crtText}>🔓 Redirecting to the Vision Portal in {countdown} seconds...</p>
        </div>
      ) : (
        <div className={styles.crtCard}>
          <p className={styles.crtText}>❌ Unable to verify payment session.</p>
          <p className={styles.crtText}>If you were charged, please contact system support with your session ID.</p>
        </div>
      )}

      <div className={styles.scanlines} />
    </div>
  );
}