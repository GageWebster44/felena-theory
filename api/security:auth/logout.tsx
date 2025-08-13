// pages/security/auth/logout.tsx
import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        // Clear Supabase session
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('❌ Supabase logout error in logout.tsx', error);
        }
      } catch (err) {
        console.error('❌ Unexpected logout error', err);
      } finally {
        // Redirect to login page
        router.replace('/login');
      }
    };

    doLogout();
  }, [router]);

  return (
    <>
      <Head>
        <title>Logging Out…</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className={styles.crtScreen}>
        <h2 className={styles.crtTitle}>🔒 Logging you out…</h2>
        <p>Please wait while we securely end your session.</p>
        <div className={styles.scanlines} />
      </div>
    </>
  );
}

export default withGuardianGate(LogoutPage);