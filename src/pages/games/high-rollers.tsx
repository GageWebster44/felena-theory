 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import { getUserXP, getUserRole } from '@/utils/xpEngine';
import styles from '@/styles/crtLaunch.module.css';

function HighRollersLobby() {
export default withGuardianGate(Page);
  const router = useRouter();
  const [xp, setXP] = useState(0);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const userXP = await getUserXP();
      const userRole = await getUserRole();
      setXP(userXP);
      setRole(userRole);
      setLoading(false);

      if (userXP < 5000 && userRole !== 'admin' && userRole !== 'developer') {
        router.push('/');
      }
    }
    checkAccess();
  }, [router]);

  if (loading) return <div className={styles.crtScreen}><h2>Loading...</h2></div>;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🎩 HIGH ROLLERS LOUNGE</h1>
      <p style={{ color: '#0ff', marginBottom: '1rem' }}>
        Only the elite may enter. XP balance: <strong>{xp}</strong>
      </p>

      <div className={styles.crtGridContainer}>
        <div className={styles.crtPanelTile} onClick={() => router.push('/games/dice')}>
          <div className={styles.tileLabel}>🎲 Elite Dice</div>
          <div className={styles.xpRequirement}>Min 500 XP Wager</div>
        </div>

        <div className={styles.crtPanelTile} onClick={() => router.push('/private-table')}>
          <div className={styles.tileLabel}>🔒 Private Match</div>
          <div className={styles.xpRequirement}>Invite Only</div>
        </div>

        {/* Future elite games can be routed here */}
        <div className={styles.crtPanelTile}>
          <div className={styles.tileLabel}>🎰 Exclusive Blackjack</div>
          <div className={styles.xpRequirement}>Coming Soon</div>
        </div>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#ccc' }}>
        Invite-only games powered by The Architect. Every match echoes through your uplink chain.
      </p>
    </div>
  );
}