// pages/500.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withGuardianGate from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import CRTBootFX from '@/components/CRTBootFX';

function Custom500Page() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [dots, setDots] = useState('.');

  // fake “recovery” boot sequence
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 4000);
    return () => clearTimeout(t);
  }, []);

  // animate status dots
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 450);
    return () => clearInterval(t);
  }, []);

  // fire telemetry when the detailed error view appears
  useEffect(() => {
    if (!booted) return;
    sendTelemetry('500_view', { path: router.asPath });
  }, [booted, router.asPath]);

  const sendTelemetry = async (event: string, extra?: Record<string, any>) => {
    try {
      await fetch('/api/telemetry/error-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          at: new Date().toISOString(),
          path: router.asPath,
          ...extra,
        }),
      });
    } catch {
      // swallow — we never want telemetry to block the page
    }
  };

  const handleRetry = async () => {
    await sendTelemetry('500_retry_click');
    router.reload();
  };

  if (!booted) {
    return (
      <>
        <Head>
          <title>Felena Theory</title>
          <meta name="description" content="Enter the XP Quantum Grid." />
        </Head>
        {CRTBootFX ? (
          <CRTBootFX text="SYSTEM FAULT DETECTED — ATTEMPTING RECOVERY" />
        ) : (
          <div className={styles.crtScreen}>
            <h1 className={styles.crtTitle} style={{ color: '#0ff' }}>
              SYSTEM FAULT DETECTED
            </h1>
            <p className={styles.crtText}>Attempting recovery{dots}</p>
            <div className={styles.scanlines} />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Felena Theory</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <div className={styles.crtScreen}>
        <h1 className={styles.crtTitle} style={{ color: '#ff5555' }}>
          🔥 INTERNAL SYSTEM ERROR
        </h1>

        <div className={styles.crtText} style={{ marginTop: '1rem' }}>
          <span style={{ color: '#ffa' }}>Subsystem:</span> Autonomous Logic Core
          <br />
          <span style={{ color: '#f66' }}>Error Code:</span> 500_FT_XQ0
          <br />
          All local processes have been temporarily halted.
        </div>

        <div
          className={styles.crtCard}
          style={{
            marginTop: '2rem',
            border: '1px solid #f00',
            background: '#110000',
            padding: '1rem',
            maxWidth: 720,
          }}
        >
          <div className={styles.crtText}>
            This may have been caused by a temporary overload, an AI misfire,
            or a corrupted engine dispatch.
            <br />
            <br />
            <strong>Recommended Actions:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Retry system entry</li>
              <li>Notify EchoMind Agent (Delta or Synapse)</li>
              <li>Check recent XP logs for anomalies</li>
            </ul>
          </div>
        </div>

        <button className={styles.crtButton} onClick={handleRetry} style={{ marginTop: '2rem' }}>
          ⟳ Retry Boot
        </button>

        <div
          className={styles.crtText}
          style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#888' }}
        >
          If this continues, report error code to a system developer. This module
          is protected under grid lockdown.
        </div>

        <div className={styles.scanlines} />
      </div>
    </>
  );
}

export default withGuardianGate(Custom500Page);