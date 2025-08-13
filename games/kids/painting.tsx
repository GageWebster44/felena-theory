// pages/games/kids/painting.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const paintingSteps = [
  'Select paint color and prepare materials.',
  'Tape off edges and cover nearby surfaces.',
  'Stir the paint thoroughly.',
  'Cut in edges using an angled brush.',
  'Roll paint onto the surface evenly.',
  'Let dry and apply a second coat if needed.',
  'Remove tape carefully and clean up.',
];

function PaintingSim() {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    if (step < paintingSteps.length - 1) {
      setStep(step + 1);
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
      <h1>🎨 Painting Simulation</h1>
      <p>Follow each step to simulate prepping and painting a surface professionally.</p>

      {!completed ? (
        <div style={{ marginTop: '2rem' }}>
          <strong>Step {step + 1}:</strong> {paintingSteps[step]}
          <div>
            <button className={styles.crtButton} onClick={nextStep} style={{ marginTop: '1rem' }}>
              {step === paintingSteps.length - 1 ? 'Finish Project' : 'Next Step'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ color: '#0f0', marginTop: '2rem' }}>
          ✅ Painting Complete! Great job following prep and finish steps like a pro.
        </div>
      )}
    </div>
  );
}

export default withGuardianGate(PaintingSim);