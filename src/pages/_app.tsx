import '../styles/globals.css';
import GlobalProvider from '@/context/GlobalProvider';
import AuthGuard from '@/context/AuthGuard';
import GlobalWinnerBar from '@/components/GlobalWinnerBar';
import SeasonCountdownBar from '@/components/SeasonCountdownBar';
import CRTBootFX from '@/components/CRTBootFX';
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

function App({ Component, pageProps }: AppProps) {
export default withGuardianGate(Page);
  const [booted, setBooted] = useState(false);
  const router = useRouter();

  // ✅ Referral Code Capture (once on first load)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('referralCode', ref);
    }
  }, []);

  if (!booted) {
    return <CRTBootFX onComplete={() => setBooted(true)} />;
  }

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <GlobalProvider>
      <SeasonCountdownBar />
      <GlobalWinnerBar />
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </GlobalProvider>
  );
}