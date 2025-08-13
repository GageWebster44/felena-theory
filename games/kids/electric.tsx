// pages/games/kids/electric.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const steps = [
  '⚠️ Safety Check: Turn off the breaker and verify power is off.',
  '🧰 Tools Ready: Wire stripper, screwdriver, voltage tester, electrical tape.',
  '✂️ Strip Wires: Carefully strip 1/2 inch of insulation from each wire end.',
  '🔌 Connect Wires: Match black to black (hot), white to white (neutral), green to ground.',
  '🔩 Tighten Screws: Secure wires to terminals with screwdriver. No loose strands.',
  '📦 Install Device: Mount the outlet/switch into the electrical box.',
  '✅ Restore Power: Turn breaker back on and test your connection.',
];

function ElectricInstaller() {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < steps.length - 1) {
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
      <h1>⚡ ELECTRICAL SIM ⚡ DIY WIRING TRAINING</h1>
      <p>Learn to wire a basic outlet. Safety is top priority. Always verify power is off.</p>

      <div
        style={{
          marginTop: '2rem',
          background: '#111',
          padding: '1rem',
          border: '1px solid #0ff',
        }}
      >
        <h3>➡️ STEP {step + 1}</h3>
        <p style={{ fontSize: '1.2rem', color: '#0ff' }}>{steps[step]}</p>
        <button
          onClick={handleNext}
          className={styles.crtButton}
          style={{ marginTop: '1rem' }}
        >
          {step === steps.length - 1 ? '✅ Complete Training' : '➡️ Next Step'}
        </button>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#888' }}>
        ⚠️ Always consult a licensed electrician before attempting real-world work.
      </div>
    </div>
  );
}

export default withGuardianGate(ElectricInstaller);