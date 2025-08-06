// pages/games/kids/landscaping.tsx
import { useState } from 'react';
import withGuardianGate from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

function LandscapingGame() {
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const steps = [
    {
      label: '🧭 Step 1: Site Layout',
      action: 'Mark out lawn boundaries with flags and string.',
    },
    {
      label: '🪓 Step 2: Clear the Area',
      action: 'Remove weeds, debris, and level the dirt with a rake.',
    },
    {
      label: '🚿 Step 3: Irrigation Check',
      action: 'Ensure water lines or sprinklers are functional and reach all corners.',
    },
    {
      label: '🌱 Step 4: Seed or Sod Install',
      action: 'Lay sod evenly or apply grass seed in overlapping passes.',
    },
    {
      label: '🧹 Step 5: Final Touch',
      action: 'Edge lawn, sweep paths, and water everything thoroughly.',
    },
  ];

  const handleNext = () => {
    const current = steps[step];
    setLog((prev) => [`✅ ${current.label} – ${current.action}`, ...prev]);
    if (step < steps.length - 1) setStep(step + 1);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🌿 LANDSCAPING SIM</h2>
      <p>Welcome to the field. Learn the basics of laying out and finishing a lawn.</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>{steps[step].label}</h3>
        <p>{steps[step].action}</p>
        <button
          className={styles.crtButton}
          onClick={handleNext}
        >
          {step === steps.length - 1 ? '✅ Finish Simulation' : '📤 Next Step'}
        </button>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h4>📜 Log</h4>
        <ul style={{ fontSize: '0.85rem', color: '#0ff' }}>
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(LandscapingGame);