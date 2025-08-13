// pages/games/kids/drywall.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const steps = [
  {
    label: 'Measure & Cut',
    description: 'Measure wall area and cut drywall sheet to size using T-square and utility knife.',
  },
  {
    label: 'Hang & Screw',
    description: 'Lift drywall to wall studs and screw every 12–16 inches using a drywall drill.',
  },
  {
    label: 'Tape Seams',
    description: 'Apply paper or mesh tape over seams between sheets. Press flat.',
  },
  {
    label: 'Apply Mud (Joint Compound)',
    description: 'Spread thin layer of compound over tape using 6-inch taping knife. Let dry.',
  },
  {
    label: 'Second Coat & Feathering',
    description: 'Apply wider coat of compound with 10" knife, feather edges. Dry fully.',
  },
  {
    label: 'Sand Smooth',
    description: 'Lightly sand all mudded areas with pole sander. Wear mask.',
  },
  {
    label: 'Final Touch + Texture (optional)',
    description: 'Apply skin coat or texture as needed. Prep for paint.',
  },
];

function DrywallSkill() {
  const [stepIndex, setStepIndex] = useState(0);
  const current = steps[stepIndex];

  const handleNext = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🛠 DRYWALL INSTALL SIM</h1>
      <p>Learn the step-by-step process of putting up drywall like a pro.</p>

      <div className={styles.crtPanelTile} style={{ marginTop: '2rem' }}>
        <h3>📌 Step {stepIndex + 1}: {current.label}</h3>
        <p style={{ marginTop: '1rem' }}>{current.description}</p>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <button
          className={styles.crtButton}
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          ⬅ Back
        </button>
        <button
          className={styles.crtButton}
          onClick={handleNext}
          disabled={stepIndex === steps.length - 1}
        >
          Next ➡
        </button>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#9ff' }}>
        💡 Tip: The smoother your joints, the better your final wall finish.
      </p>
    </div>
  );
}

export default withGuardianGate(DrywallSkill);