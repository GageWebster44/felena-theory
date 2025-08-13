// pages/games/kids/culinary.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const steps = [
  'Wash Hands & Prep Station',
  'Chop Ingredients (Onion, Tomato, Garlic)',
  'Heat Pan & Add Oil',
  'Cook Ingredients in Sequence',
  'Plate & Garnish the Dish',
];

function CulinaryGame() {
  const [stepIndex, setStepIndex] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const handleStep = (step: string) => {
    setLog(prev => [`✅ ${step}`, ...prev]);
    setStepIndex(prev => prev + 1);
  };

  const reset = () => {
    setStepIndex(0);
    setLog([]);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>👩‍🍳 CULINARY APPRENTICE SIM</h1>
      <p>Follow the steps to cook a simple dish and simulate a kitchen station experience.</p>

      {stepIndex < steps.length ? (
        <div style={{ marginTop: '2rem' }}>
          <h3>Step {stepIndex + 1}</h3>
          <p style={{ fontSize: '1.2rem', color: '#0f0' }}>{steps[stepIndex]}</p>
          <button
            className={styles.crtButton}
            onClick={() => handleStep(steps[stepIndex])}
            style={{ marginTop: '1rem' }}
          >
            ✅ Complete Step
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', color: '#00ff99' }}>
          <p>🎉 Dish Complete! You’ve finished your first simulated service.</p>
          <button className={styles.crtButton} onClick={reset} style={{ marginTop: '1rem' }}>
            🔁 Restart Simulation
          </button>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h3>📋 Action Log:</h3>
        <ul>
          {log.map((entry, i) => (
            <li key={i} style={{ fontSize: '0.85rem' }}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(CulinaryGame);