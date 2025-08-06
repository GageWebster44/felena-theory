// pages/403.tsx
import Link from 'next/link';
import styles from '@/styles/crtLaunch.module.css';

export default function ForbiddenPage() {
  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <div className={styles.crtCard} style={{ border: '1px solid #f00', padding: '2rem', maxWidth: '600px', margin: 'auto', marginTop: '5rem' }}>
        <h1 className={styles.crtTitle} style={{ color: '#f00' }}>🚫 ACCESS DENIED — CODE 403</h1>
        <p className={styles.crtText} style={{ marginTop: '1rem' }}>
          You’ve hit a restricted node in the grid.
          <br />Your current role or XP level does not grant access to this sector.
        </p>
        <p className={styles.crtText} style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#ccc' }}>
          This section may require:
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
            <li>🔒 Admin or Developer Role</li>
            <li>📊 Minimum XP Threshold</li>
            <li>🧒 Guardian Verification (for child-restricted zones)</li>
            <li>🧠 System Override or Onboarding Completion</li>
          </ul>
        </p>

        <p className={styles.crtText} style={{ marginTop: '1.5rem' }}>
          If you believe this is a mistake, please contact a system administrator or check your access tier.
        </p>

        <Link href="/dashboard" className={styles.crtButton} style={{ marginTop: '2rem' }}>
          🔁 Return to Dashboard
        </Link>
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}