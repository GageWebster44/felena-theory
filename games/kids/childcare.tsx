// pages/games/kids/childcare.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function ChildcareTraining() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '🧼 Step 1: Clean Hands, Clean Space',
      desc: 'Learn proper handwashing and keeping toys/surfaces safe for infants and toddlers.',
    },
    {
      title: '🍼 Step 2: Bottle & Feeding Basics',
      desc: 'Mix a bottle and identify feeding cues. Babies can’t speak — but they show you when they’re hungry.',
    },
    {
      title: '🧸 Step 3: Safe Play Time',
      desc: 'Pick age-appropriate toys and set up a safe play zone with soft edges and no choking hazards.',
    },
    {
      title: '🛏 Step 4: Nap Time Routine',
      desc: 'Practice swaddling and placing a baby on their back for safe sleep. No blankets, no pillows.',
    },
    {
      title: '📋 Step 5: Parent Check-In',
      desc: 'Simulate a handoff: explain how the baby did, diaper changes, feeding time, and mood.',
    },
  ];

  const next = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prev = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🧑‍🍼 Childcare Assistant Training</h1>
      <p>Learn the basics of watching kids safely and professionally.</p>

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #0ff' }}>
        <h2>{steps[step].title}</h2>
        <p>{steps[step].desc}</p>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button className={styles.crtButton} onClick={prev} disabled={step === 0}>
          ⬅ Back
        </button>
        <button className={styles.crtButton} onClick={next} disabled={step === steps.length - 1}>
          Next ➡
        </button>
      </div>
    </div>
  );
}

export default withGuardianGate(ChildcareTraining);