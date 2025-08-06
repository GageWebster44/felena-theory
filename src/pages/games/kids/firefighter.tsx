// pages/games/kids/firefighter.tsx
import React, { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function FirefighterGame() {
  const [step, setStep] = useState(0);

  const tasks = [
    {
      label: '👨‍🚒 Suit Up',
      description: 'Put on your firefighter gear: jacket, helmet, gloves, and boots.',
    },
    {
      label: '🧯 Check Equipment',
      description: 'Inspect hoses, oxygen tanks, axes, and radio before the shift.',
    },
    {
      label: '🚨 Respond to Call',
      description: 'Drive to the emergency scene, navigating traffic safely.',
    },
    {
      label: '🪓 Breach Entry',
      description: 'Use your axe to clear a safe entry through smoke or locked doors.',
    },
    {
      label: '🔥 Attack the Fire',
      description: 'Deploy hose, control the water pressure, and aim at fire base.',
    },
    {
      label: '🚑 Search and Rescue',
      description: 'Sweep the structure room by room to find and evacuate victims.',
    },
    {
      label: '💧 Hydrate and Report',
      description: 'After fire is out, document incident and hydrate before next task.',
    },
  ];

  const handleNext = () => {
    if (step < tasks.length - 1) {
      setStep(step + 1);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🔥 FIREFIGHTER SIM</h2>
      <p>Step into the boots of a first responder and handle high-pressure calls with precision.</p>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #f00',
          borderRadius: '8px',
        }}
      >
        <h2>{tasks[step].label}</h2>
        <p>{tasks[step].description}</p>
        {step < tasks.length - 1 ? (
          <button className={styles.crtButton} onClick={handleNext} style={{ marginTop: '1rem' }}>
            NEXT STEP
          </button>
        ) : (
          <p style={{ color: '#0f0', marginTop: '1rem' }}>
            ✅ Mission complete. You’ve completed your first simulation!
          </p>
        )}
      </div>
    </div>
  );
}

export default withGuardianGate(FirefighterGame);