// pages/games/kids/farming.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function FarmingGame() {
  const [step, setStep] = useState(0);

  const steps = [
    '🚜 Clear the land of rocks and debris.',
    '🌾 Plow the field using your tractor.',
    '💧 Irrigate the soil to prepare for planting.',
    '🌱 Plant seeds (corn, soybeans, or wheat).',
    '☀️ Monitor growth: check sunlight, moisture, and soil nutrients.',
    '🧪 Apply fertilizer and prevent pest infestations.',
    '📅 Wait for the right season window and monitor crop maturity.',
    '🌾 Harvest crops using the combine.',
    '🚛 Transport yield to storage or sell at the market.',
    '📊 Record your crop yield and calculate profit.',
    '🔄 Rotate crop type and start next season with better strategy.',
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setStep(0); // Restart season
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🌽 FARMING SIMULATION</h1>
      <p>Learn to operate your own farm from soil prep to selling harvests.</p>

      <div className={styles.crtPanelTile}>
        <h3>Step {step + 1}</h3>
        <p>{steps[step]}</p>
        <button className={styles.crtButton} onClick={handleNext}>
          {step === steps.length - 1 ? '🔄 Restart Season' : '⏭️ Next Step'}
        </button>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#ccc' }}>
        Simulates real-world ag flow: tilling → planting → growth → harvest → economics.
      </div>
    </div>
  );
}

export default withGuardianGate(FarmingGame);