// pages/success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '@/styles/crtLaunch.module.css';

export default function SuccessPage() {
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
// /pages/api/verify-stripe-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'Missing session ID' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const userId = session.metadata?.userId;
    const type = session.metadata?.type;

    if (!userId) return res.status(400).json({ error: 'No user metadata found' });

    // ✅ Felena Vision Preorder Promotion
    if (type === 'preorder') {
  try {
    await supabase.from('user_profiles').update({ role: 'felena_vision' }).eq('id', userId);
  } catch (error) {
    console.error('❌ Supabase error in verify-stripe-session.ts', error);
  }

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in verify-stripe-session.ts', error);
  }
        user_id: 'system',
        action: `Auto-promoted ${userId} to felena_vision after preorder`,
        timestamp: new Date().toISOString(),
      });

  try {
    await supabase.from('user_badges').upsert({
  } catch (error) {
    console.error('❌ Supabase error in verify-stripe-session.ts', error);
  }
        user_id: userId,
        label: 'Felena Vision',
        source: 'preorder',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({ verified: true });
  } catch (err: any) {
    console.error('Stripe verify error:', err.message);
    return res.status(500).json({ error: 'Stripe session verification failed' });
  }
}