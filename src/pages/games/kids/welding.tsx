// pages/games/kids/welding.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const weldingSteps = [
  'Put on safety gear (gloves, helmet, jacket)',
  'Inspect and clean metal surfaces to remove rust and oil',
  'Clamp metal pieces securely in position',
  'Select welding rod and set machine amperage',
  'Strike arc and begin welding along seam',
  'Maintain correct angle and distance while welding',
  'Let the weld cool, then clean with wire brush',
  'Inspect weld for consistency and structural integrity',
];

function WeldingSim() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    if (step < weldingSteps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🔥 Welding Simulation</h1>
      <p>Follow the steps to complete a beginner weld setup and finish.</p>

      {!completed ? (
        <div style={{ marginTop: '2rem' }}>
          <p>
            <strong>Step {step + 1}:</strong> {weldingSteps[step]}
          </p>
          <button onClick={nextStep} className={styles.crtButton}>
            {step < weldingSteps.length - 1 ? 'Next Step' : 'Finish Weld'}
          </button>
        </div>
      ) : (
        <div style={{ color: '#0f0', marginTop: '2rem' }}>
          ✅ Weld Complete! Great job following the safety and technique steps.
        </div>
      )}
    </div>
  );
}

export default withGuardianGate(WeldingSim);