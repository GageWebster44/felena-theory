// pages/games/kids/cosmetology.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function CosmetologyGame() {
  const initialSteps = [
    '🧼 Sanitize all tools and your workstation.',
    '🗣️ Consult with the client about their hair/skin/nail needs.',
    '🚿 Wash and prep hair for styling or treatment.',
    '✂️ Perform the requested cut, style, or service.',
    '📝 Present results and explain aftercare or next appointment.'
  ];

  const [step, setStep] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  const next = () => {
    if (step < initialSteps.length - 1) {
      setLog((prev) => [...prev, `✅ ${initialSteps[step]}`]);
      setStep(step + 1);
    } else {
      setLog((prev) => [...prev, `✅ ${initialSteps[step]} 🎉 Service complete!`]);
      setComplete(true);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>💇 COSMETOLOGY SIM</h1>
      <p>Simulate a full beauty appointment. Follow each step carefully.</p>

      {!complete && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Step {step + 1}:</h3>
          <p>{initialSteps[step]}</p>
          <button
            onClick={next}
            className={styles.crtButton}
            style={{ marginTop: '1rem' }}
          >
            ✅ Complete Step
          </button>
        </div>
      )}

      {complete && (
        <div style={{ marginTop: '2rem', color: '#0f0' }}>
          <h3>🎉 Service complete!</h3>
          <p>✨ Great job providing professional client care.</p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h4>📜 Action Log:</h4>
        <ul style={{ fontSize: '0.9rem' }}>
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(CosmetologyGame);