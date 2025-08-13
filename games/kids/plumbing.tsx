// pages/games/kids/plumbing.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function PlumbingGame() {
  const [pipeConnected, setPipeConnected] = useState(false);
  const [leakFixed, setLeakFixed] = useState(false);
  const [message, setMessage] = useState('🛠️ Welcome to Plumbing 101! Fix the flow!');

  const handleConnectPipes = () => {
    setPipeConnected(true);
    setMessage('✅ Pipes connected! Now locate the leak.');
  };

  const handleFixLeak = () => {
    if (!pipeConnected) {
      setMessage('⚠️ Connect the pipes first.');
      return;
    }
    setLeakFixed(true);
    setMessage('💧 Leak fixed! Water is flowing properly.');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🚰 Plumbing Simulation</h1>
      <p>🧰 Learn the basics of household plumbing by solving this leak scenario.</p>

      <div style={{ marginTop: '2rem' }}>
        <button
          className={styles.crtButton}
          onClick={handleConnectPipes}
          disabled={pipeConnected}
        >
          🔗 Connect Pipes
        </button>

        <button
          className={styles.crtButton}
          onClick={handleFixLeak}
          style={{ marginLeft: '1rem' }}
          disabled={leakFixed}
        >
          🔧 Fix Leak
        </button>
      </div>

      <div style={{ marginTop: '2rem', color: '#0ff' }}>{message}</div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📘 Learn More:</h3>
        <ul>
          <li>🌀 Water pressure basics</li>
          <li>🧵 Pipe fittings and sealants</li>
          <li>🔩 Tools used by real plumbers</li>
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(PlumbingGame);