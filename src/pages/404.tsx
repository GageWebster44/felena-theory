import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import Link from 'next/link';
import styles from '@/styles/crtLaunch.module.css';

function NotFoundPage() {
export default withGuardianGate(Page);
  const [rebooting, setRebooting] = useState(false);
  const [vortex, setVortex] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRebooting(true);
      setTimeout(() => setVortex(true), 3000);
    }, 7000); // Wait 7 seconds before fake reboot

    return () => clearTimeout(timer);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  if (vortex) {
    return (
      <div style={{
        background: '#000',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        zIndex: 99999
      }}>
        <video
          src="/animations/binary-vortex.webm"
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  if (rebooting) {
    return (
      <div className={styles.crtScreen}>
        <h1 style={{ color: '#0f0' }}>♻️ REINITIALIZING FELENA GRID...</h1>
        <p className={styles.glitch}>System integrity check... <span style={{ color: '#0f0' }}>✅ OK</span></p>
        <p className={styles.glitch}>Reconnecting operator signals...</p>
        <p className={styles.glitch}>Scanning for route breadcrumbs...</p>
        <p className={styles.glitch}>🌀 VORTEX CLEANSE COMPLETE</p>
        <p className={styles.glitch}>Redirecting to dashboard...</p>
        <div className={styles.scanlines}></div>
        <meta httpEquiv="refresh" content="3;url=/dashboard" />
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1 style={{ fontSize: '3rem', color: '#f00', marginBottom: '1rem' }}>📡 SIGNAL LOST</h1>
      <p className={styles.glitch} style={{ fontSize: '1.2rem' }}>
        ERROR CODE: 404-ZX | This module has vanished into the static.
      </p>
      <p className={styles.glitch} style={{ fontSize: '1rem', marginTop: '1rem' }}>
        🧠 Attempting forced reboot...
      </p>
      <p className={styles.glitch} style={{ fontSize: '0.9rem', marginTop: '2rem', color: '#ccc' }}>
        Note: If this error was triggered from a mission or engine module, cached XP may be unrecoverable. Continue?
      </p>
      <Link href="/dashboard" className={styles.crtButton}>
        ⏭️ Skip Reboot / Return Now
      </Link>
      <div className={styles.scanlines}></div>
    </div>
  );
}