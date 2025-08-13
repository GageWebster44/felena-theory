// pages/404.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import withGuardianGate from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

function NotFoundPage() {
  const router = useRouter();
  const [rebooting, setRebooting] = useState(false);
  const [vortex, setVortex] = useState(false);

  // Sequence: wait 7s → reboot → wait 3s → vortex
  useEffect(() => {
    const t1 = setTimeout(() => {
      setRebooting(true);
      const t2 = setTimeout(() => setVortex(true), 3000);
      return () => clearTimeout(t2);
    }, 7000);
    return () => clearTimeout(t1);
  }, []);

  // Redirect after vortex has been shown for 3 seconds
  useEffect(() => {
    if (vortex) {
      const t = setTimeout(() => {
        router.replace('/dashboard');
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [vortex, router]);

  return (
    <>
      <Head>
        <title>Felena Theory • 404</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Vortex view */}
      {vortex ? (
        <div
          style={{
            background: '#000',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at center, rgba(0,255,153,0.15) 0%, transparent 70%), repeating-conic-gradient(rgba(0,255,153,0.09) 0deg 8deg, transparent 8deg 16deg)',
              animation: 'spinVortex 6s linear infinite',
              willChange: 'transform',
            }}
          />
          <div style={{ zIndex: 2, textAlign: 'center' }}>
            <p className={styles.glitch}>🌀 VORTEX INITIATED</p>
            <p className={styles.glitch}>Stabilizing Signal...</p>
          </div>
          <style jsx>{`
            @keyframes spinVortex {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      ) : rebooting ? (
        // Reboot view
        <div className={styles.crtScreen}>
          <h1 style={{ color: '#0f0' }}>♻️ REINITIALIZING FELENA GRID...</h1>
          <p className={styles.glitch}>
            System integrity check... <span style={{ color: '#0f0' }}>✅ OK</span>
          </p>
          <p className={styles.glitch}>Reconnecting operator signals...</p>
          <p className={styles.glitch}>Scanning for route breadcrumbs...</p>
          <p className={styles.glitch}>🌀 VORTEX CLEANSE QUEUED</p>
          <div className={styles.scanlines}></div>
        </div>
      ) : (
        // Initial 404 view
        <div className={styles.crtScreen}>
          <h1 style={{ fontSize: '3rem', color: '#f00', marginBottom: '1rem' }}>📡 SIGNAL LOST</h1>
          <p className={styles.glitch} style={{ fontSize: '1.2rem' }}>
            ERROR CODE: 404‑ZX | This module has vanished into the static.
          </p>
          <p className={styles.glitch} style={{ fontSize: '1rem', marginTop: '1rem' }}>
            🧠 Attempting forced reboot...
          </p>
          <p
            className={styles.glitch}
            style={{ fontSize: '0.9rem', marginTop: '2rem', color: '#ccc' }}
          >
            Note: If this error was triggered from a mission or engine module, cached XP may be
            unrecoverable. Continue?
          </p>
          <div className={styles.scanlines}></div>
        </div>
      )}
    </>
  );
}

export default withGuardianGate(NotFoundPage);