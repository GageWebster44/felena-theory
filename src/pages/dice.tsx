 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import { getUserXP, getUserId } from '@/utils/xpEngine';
import { v4 as uuidv4 } from 'uuid';
import styles from '@/styles/crtLaunch.module.css';

function PrivateTableRoom() {
export default withGuardianGate(Page);
  const router = useRouter();
  const [tableId, setTableId] = useState('');
  const [xp, setXP] = useState(0);
  const [isHost, setIsHost] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function validateAccess() {
      const currentXP = await getUserXP();
      setXP(currentXP);
      const id = router.query.id as string;
      setTableId(id || '');
      if (currentXP < 5000) router.push('/');
    }
    validateAccess();
  }, [router.query]);

  function createPrivateTable() {
    const newId = uuidv4();
    setTableId(newId);
    setIsHost(true);
    setJoined(true);
    router.replace(`/private-table?id=${newId}`);
  }

  function joinTable() {
    if (tableId) setJoined(true);
  }

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🎯 PRIVATE TABLE</h1>

      {!tableId && (
        <button className={styles.crtButton} onClick={createPrivateTable}>
          CREATE TABLE
        </button>
      )}

      {tableId && !joined && (
        <>
          <p style={{ color: '#0ff' }}>Table ID: <strong>{tableId}</strong></p>
          <button className={styles.crtButton} onClick={joinTable}>
            JOIN TABLE
          </button>
        </>
      )}

      {joined && (
        <div>
          <p style={{ color: '#0f0' }}>🧠 Table {tableId} Active — High Roller Verified</p>
          {/* Placeholder — replace with actual private match UI */}
          <p style={{ marginTop: '2rem' }}>🎲 Game: Dice Match (Elite Stakes)</p>
          <button className={styles.crtButton}>ROLL DICE</button>
          {/* Future: show invite link, real-time users, XP wagers */}
        </div>
      )}

      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#ccc' }}>
        Invite another High Roller to this link to begin.
      </p>
    </div>
  );
}