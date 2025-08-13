// pages/private_table.tsx
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
  const [currentXP, setCurrentXP] = useState(0);
  const [isHost, setIsHost] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function validateAccess() {
      const xp = await getUserXP();
      setCurrentXP(xp);

      if (xp < 5000) router.push('/'); // Only Override tier allowed

      const id = router.query.id as string;
      setTableId(id || '');
      if (!id) return;
      setJoined(true);
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
      <h1>🧠 PRIVATE TABLE ROOM</h1>
      <p>Only Operators with Tier 3+ access (≥ 5000 XP) may create or join encrypted sessions.</p>

      {!joined && (
        <div style={{ marginTop: '2rem' }}>
          <button className={styles.crtButton} onClick={createPrivateTable}>
            🛠 Create Table
          </button>
          <button className={styles.crtButton} onClick={joinTable} style={{ marginLeft: '1rem' }}>
            🔑 Join Existing
          </button>
        </div>
      )}

      {joined && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #0ff' }}>
          <p>
            {isHost ? '🧿 Hosting encrypted table:' : '🔗 Connected to private table:'}{' '}
            <code>{tableId}</code>
          </p>
          <p className="text-sm text-green-400 mt-2">
            Secure session initialized. Future updates will allow multi-user sync and chat here.
          </p>
        </div>
      )}
    </div>
  );
}