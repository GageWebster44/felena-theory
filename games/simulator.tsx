 // pages/simulator.tsx
import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

function Simulator() {
export default withGuardianGate(Page);
  const [prediction, setPrediction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const runSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      const random = Math.random();
      if (random > 0.5) {
        setPrediction('📈 Bull Signal: Momentum pattern detected.');
      } else {
        setPrediction('📉 Bear Signal: Downward trend likely.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🧪 AI SIMULATOR</h2>
      <p>Tap the button below to simulate a market signal prediction.</p>

      <div className={styles.simulatorPanel}>
        <button onClick={runSimulation} className={styles.crtButton}>
          🎛 Run Signal Simulation
        </button>
      </div>

      {loading && <p style={{ color: '#0ff' }}>Processing signal...</p>}

      {prediction && (
        <div className={styles.simulatorOutput}>
          <strong>🧠 Signal Result:</strong> {prediction}
        </div>
      )}
    </div>
  );
}