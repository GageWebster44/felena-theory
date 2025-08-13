// pages/games/kids/carpentry.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function CarpentryGame() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("Welcome to the Carpentry Trade Simulator! Let's build a birdhouse.");

  const steps = [
    {
      title: '📏 Measure & Mark Wood',
      description: 'Use a tape measure and pencil to mark your cuts. Accuracy matters!',
    },
    {
      title: '🪚 Cut the Wood',
      description: 'Use a handsaw or circular saw to make clean cuts on the marked lines.',
    },
    {
      title: '🛠 Drill Pilot Holes',
      description: 'Prevent splitting by drilling small pilot holes before screwing pieces together.',
    },
    {
      title: '🔩 Assemble the Pieces',
      description: 'Use screws or nails to join the pieces and create the structure of the birdhouse.',
    },
    {
      title: '🪵 Sand & Finish',
      description: 'Use sandpaper to smooth rough edges, then paint or stain for a protective finish.',
    },
  ];

  const handleStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      setMessage(`✅ Step completed: ${steps[step].title}`);
    } else {
      setMessage('🎉 Project complete! You\'ve built your first birdhouse. +50 XP awarded.');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🪚 Carpentry Skill Builder</h1>
      <p>{message}</p>

      {step < steps.length && (
        <div style={{ marginTop: '2rem' }}>
          <h3>{steps[step].title}</h3>
          <p>{steps[step].description}</p>
          <button className={styles.crtButton} onClick={handleStep}>
            ✅ Complete Step
          </button>
        </div>
      )}

      {step >= steps.length && (
        <p style={{ marginTop: '2rem', color: '#0f0' }}>🎯 XP Added!</p>
      )}
    </div>
  );
}

export default withGuardianGate(CarpentryGame);