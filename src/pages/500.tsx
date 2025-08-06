// pages/500.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import CRTBootFX from '@/components/CRTBootFX';
import { useRouter } from 'next/router';

function Custom500() {
export default withGuardianGate(Page);
  const [booted, setBooted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 4000);
    return () => clearTimeout(timer);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  const handleRetry = () => {
    router.reload();
  };

  if (!booted) return <CRTBootFX text="⛔ SYSTEM FAULT DETECTED... ATTEMPTING RECOVERY" />;

  return (
    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle} style={{ color: '#ff5555' }}>🔥 INTERNAL SYSTEM ERROR</h1>
      <p className={styles.crtText} style={{ marginTop: '1rem' }}>
        A fatal exception has occurred inside the Felena Grid.<br />
        <span style={{ color: '#ffa' }}>Subsystem: Autonomous Logic Core</span><br />
        <span style={{ color: '#f66' }}>Error Code: 500_FT_XQ0</span><br />
        All local processes have been temporarily halted.
      </p>

      <div className={styles.crtCard} style={{ marginTop: '2rem', border: '1px solid #f00', background: '#110000' }}>
        <p className={styles.crtText}>
          This may have been caused by a temporary overload, an AI misfire, or a corrupted engine dispatch.
          <br /><br />
          <strong>Recommended Actions:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>🔁 Retry System Entry</li>
            <li>🧠 Notify EchoMind Agent (Delta or Synapse)</li>
            <li>📦 Check recent XP logs for anomalies</li>
          </ul>
        </p>
      </div>

      <button className={styles.crtButton} onClick={handleRetry} style={{ marginTop: '2rem' }}>
        🔄 Retry Boot
      </button>

      <div className={styles.crtText} style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#888' }}>
        If this continues, report error code to a system developer. This page is protected under grid lockdown.
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}