// pages/403.tsx
import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/crtLaunch.module.css';

export default function ForbiddenPage() {
  const { query } = useRouter();
  const reason = String(query.reason || '').toLowerCase();

  const { headline, help, actions } = useMemo(() => {
    switch (reason) {
      case 'role':
        return {
          headline: 'Restricted Sector — Operator Role Required',
          help: [
            'Admin or Developer clearance needed for this grid node.',
            'If you think this is a mistake, contact a system admin.',
          ],
          actions: [
            { href: '/profile', label: 'View Profile' },
            { href: '/dashboard', label: 'Return to Dashboard', primary: true },
          ],
        };
      case 'xp':
        return {
          headline: 'Insufficient XP Threshold',
          help: [
            'Your current XP does not meet the minimum requirement.',
            'Complete missions or buy an XP pack to proceed.',
          ],
          actions: [
            { href: '/missions', label: 'Run Missions' },
            { href: '/cashout', label: 'Buy XP (Starter)' },
            { href: '/dashboard', label: 'Return to Dashboard', primary: true },
          ],
        };
      case 'guardian':
        return {
          headline: 'Guardian Verification Required',
          help: [
            'This zone is age‑restricted and requires Guardian approval.',
            'Complete the verification flow to unlock access.',
          ],
          actions: [
            { href: '/guardian', label: 'Open Guardian Portal', primary: true },
            { href: '/dashboard', label: 'Return to Dashboard' },
          ],
        };
      case 'onboarding':
        return {
          headline: 'Complete Onboarding',
          help: [
            'You haven’t finished initial setup.',
            'Finish the onboarding checklist to continue.',
          ],
          actions: [
            { href: '/onboard', label: 'Resume Onboarding', primary: true },
            { href: '/dashboard', label: 'Return to Dashboard' },
          ],
        };
      default:
        return {
          headline: 'ACCESS DENIED — CODE 403',
          help: [
            'You hit a restricted node in the grid.',
            'This section may require: Admin/Dev role, minimum XP, Guardian verification, or onboarding completion.',
          ],
          actions: [{ href: '/dashboard', label: 'Return to Dashboard', primary: true }],
        };
    }
  }, [reason]);

  return (
    <>
      <Head>
        <title>403 • Felena Theory</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.crtScreen}>
        <div
          className={styles.crtCard}
          style={{
            border: '1px solid #0fff99',
            padding: '2rem',
            maxWidth: 680,
            margin: '2rem auto',
            background: 'rgba(0,0,0,0.65)',
            boxShadow: '0 0 18px rgba(0,255,153,0.15), inset 0 0 24px rgba(0,255,153,0.07)',
          }}
        >
          <h1 className={styles.crtTitle} style={{ color: '#f40', fontWeight: 700 }}>
            {headline}
          </h1>

          <p className={styles.crtText} style={{ marginTop: '1rem' }}>
            You do not currently have access to this sector.
          </p>

          <ul className={styles.crtText} style={{ marginTop: '0.75rem', lineHeight: 1.7 }}>
            {help.map((h, i) => (
              <li key={i}>• {h}</li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            {actions.map(({ href, label, primary }, i) => (
              <Link key={i} href={href} className={styles.crtButton}
                style={{
                  border: '1px solid #0fff99',
                  padding: '10px 14px',
                  background: primary ? 'rgba(0,255,153,0.12)' : 'transparent',
                  textDecoration: 'none',
                }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.scanlines} />
      </div>
    </>
  );
}