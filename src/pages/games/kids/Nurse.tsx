// pages/games/kids/nurse.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function NurseSim() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);

  const steps = [
    'Sanitize hands and wear gloves',
    'Check patient vitals (heart rate, temp, blood pressure)',
    'Document observations',
    'Administer medication or assist doctor',
    'Ensure comfort and safety, log final notes'
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      setMessage(`✅ Task completed. Proceed to next.`);
    } else {
      setComplete(true);
      setMessage(`🎉 You've completed the nursing simulation!`);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🩺 Nurse Assistant Sim</h1>
      <p>Follow each clinical step in the correct order to complete a basic nursing shift.</p>

      <div className={styles.crtPanelTile} style={{ marginTop: '2rem' }}>
        <h2 className="text-lg">Step {step + 1}</h2>
        <p className="text-green-300">{steps[step]}</p>

        {!complete && (
          <button onClick={handleNext} className={styles.crtButton} style={{ marginTop: '1rem' }}>
            Next Step
          </button>
        )}

        {message && (
          <p style={{ color: '#0ff', marginTop: '1rem' }}>{message}</p>
        )}
      </div>

      {complete && (
        <div style={{ marginTop: '2rem', color: '#0f0' }}>
          <p>🎓 You've completed the intro nursing scenario. Great job caring for the patient!</p>
        </div>
      )}
    </div>
  );
}

export default withGuardianGate(NurseSim);