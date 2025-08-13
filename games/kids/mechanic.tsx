// pages/games/kids/mechanic.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const mechanicSteps = [
  {
    label: 'Step 1: Vehicle Intake',
    detail: 'Log vehicle symptoms, check engine light, and service codes.',
  },
  {
    label: 'Step 2: Diagnostic Test',
    detail: 'Use a diagnostic tool to scan the onboard computer (OBD-II).',
  },
  {
    label: 'Step 3: Mechanical Inspection',
    detail: 'Visually inspect belts, fluids, brakes, and hoses for wear.',
  },
  {
    label: 'Step 4: Repair Task',
    detail: 'Simulate a part replacement (e.g., swap a battery, change spark plugs).',
  },
  {
    label: 'Step 5: System Reset & Test Drive',
    detail: 'Clear service codes and verify fix with a simulated road test.',
  },
];

function MechanicSim() {
  const [step, setStep] = useState(0);
  const current = mechanicSteps[step];

  const next = () => setStep((prev) => (prev + 1) % mechanicSteps.length);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🔧 Mechanic Simulator</h1>
      <p>Learn the basic process of automotive diagnosis and repair.</p>

      <div className={styles.crtPanelTile} style={{ marginTop: '2rem' }}>
        <h3>{current.label}</h3>
        <p style={{ marginTop: '0.5rem' }}>{current.detail}</p>
        <button onClick={next} className={styles.crtButton} style={{ marginTop: '1rem' }}>
          {step === mechanicSteps.length - 1 ? '✅ Complete Simulation' : '🔁 Next Step'}
        </button>
      </div>
    </div>
  );
}

export default withGuardianGate(MechanicSim);