import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { getXPBreakdown } from '@/utils/xpEngine';

function XPVault() {
export default withGuardianGate(Page);
  const [lockedXP, setLockedXP] = useState(0);
  const [freeXP, setFreeXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const fetchXP = async () => {
      const { locked, free } = await getXPBreakdown();
      setLockedXP(locked);
      setFreeXP(free);
      setTotalXP(locked + free);
    };

    const verified = localStorage.getItem('isAdult') === 'true';
    setAgeVerified(verified);

    fetchXP();
  }, []);

  const lockedPercentage =
    totalXP > 0 ? ((lockedXP / totalXP) * 100).toFixed(0) : '0';
  const freePercentage =
    totalXP > 0 ? ((freeXP / totalXP) * 100).toFixed(0) : '0';

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🔐 XP VAULT</h2>
      <p>You've earned XP through learning, challenges, and referral impact.</p>

      <div className={styles.crtGridContainer}>
        <div className={styles.crtPanelTile}>
          <div className={styles.titleLabel}>🔒 Locked XP</div>
          <div style={{ fontSize: '1.5rem', color: '#ff0044' }}>
            {lockedXP.toLocaleString()} XP
          </div>
          <p>
            Secured until age verification. This is your long-term power reserve.
          </p>
        </div>

        <div className={styles.crtPanelTile}>
          <div className={styles.titleLabel}>🟢 Free XP</div>
          <div style={{ fontSize: '1.5rem', color: '#00ffff' }}>
            {freeXP.toLocaleString()} XP
          </div>
          <p>
            This XP is active. Use it to unlock engines, play games, or trigger
            missions.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#0ff' }}>
        <strong>Total XP:</strong> {totalXP.toLocaleString()} XP
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
        🔓 {lockedPercentage}% Locked | 🟢 {freePercentage}% Free
      </div>

      {ageVerified ? (
        <div style={{ marginTop: '2rem', color: '#00ff00', fontWeight: 'bold' }}>
          ✅ Age verified. Vault release countdown active.
        </div>
      ) : (
        <div style={{ marginTop: '2rem', color: '#ff0', fontWeight: 'bold' }}>
          ⚠️ Some XP is locked. Guardian or age confirmation required to access
          full power.
        </div>
      )}
    </div>
  );
}