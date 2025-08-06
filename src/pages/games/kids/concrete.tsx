// pages/games/kids/concrete.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function ConcreteGame() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');

  const steps = [
    'Add concrete to the form – begin pouring directly from the truck.',
    'Move the mud – spread the concrete across the form using a shovel or rake.',
    'Check the slump – classify as Wet, Ideal, or Dry for optimal slope.',
    'Begin finishing – use a bull float or trowel for smooth edges and surface.',
    'Final smoothing – apply detail smoothing with hand trowels and edge tools.'
  ];

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      setMessage(steps[step + 1]);
    } else {
      setMessage('✅ All steps complete! Your slab is set.');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🧱 CONCRETE FINISHING SIM</h2>
      <p>Learn the core steps of pouring and finishing concrete.</p>

      <div className="mt-4 text-lg text-green-300">
        <p>{steps[step]}</p>
      </div>

      <button
        className={styles.crtButton}
        onClick={next}
        style={{ marginTop: '2rem' }}
      >
        {step < steps.length - 1 ? '▶️ Next Step' : '🔁 Restart'}
      </button>

      {message && <p className="mt-4 text-cyan-400">{message}</p>}
    </div>
  );
}

export default withGuardianGate(ConcreteGame);