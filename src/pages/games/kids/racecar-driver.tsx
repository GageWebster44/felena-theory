// pages/games/kids/racecar-driver.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function RacecarDriverGame() {
  const [stage, setStage] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const advance = (action: string) => {
    setLog((prev) => [...prev, action]);
    setStage(stage + 1);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🏎️ RACECAR DRIVER SIM</h1>
      <p>Start your engine, shift gears, and hit the track like a pro!</p>

      {stage === 0 && (
        <div>
          <p>➡️ Step 1: Prime the engine and start ignition.</p>
          <button className={styles.crtButton} onClick={() => advance('🟢 Engine started')}>
            Start Engine
          </button>
        </div>
      )}

      {stage === 1 && (
        <div>
          <p>➡️ Step 2: Press clutch and shift to 1st gear.</p>
          <button className={styles.crtButton} onClick={() => advance('🟡 Shifted to 1st gear')}>
            Shift to 1st
          </button>
        </div>
      )}

      {stage === 2 && (
        <div>
          <p>➡️ Step 3: Accelerate smoothly.</p>
          <button className={styles.crtButton} onClick={() => advance('⚙️ Accelerating...')}>
            Accelerate
          </button>
        </div>
      )}

      {stage === 3 && (
        <div>
          <p>➡️ Step 4: Shift up to 2nd gear as RPM rises.</p>
          <button className={styles.crtButton} onClick={() => advance('⚙️ Shifted to 2nd gear')}>
            Shift to 2nd
          </button>
        </div>
      )}

      {stage === 4 && (
        <div>
          <p>➡️ Step 5: Maintain throttle and steer into the first corner.</p>
          <button className={styles.crtButton} onClick={() => advance('🏁 First corner taken')}>
            Steer
          </button>
        </div>
      )}

      {stage > 4 && (
        <div>
          <h3 style={{ color: '#0f0' }}>✅ Track Start Sequence Complete!</h3>
          <p>Total Actions:</p>
          <ul>
            {log.map((entry, idx) => (
              <li key={idx}>{entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default withGuardianGate(RacecarDriverGame);