import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const tasks = [
  {
    label: '📏 Measure & Snap Chalk Line',
    detail: 'Mark a straight line across the roof deck to align your first row of shingles.'
  },
  {
    label: '🧰 Lay Underlayment',
    detail: 'Install synthetic or felt underlayment to act as a moisture barrier beneath shingles.'
  },
  {
    label: '🔨 Install Starter Strip',
    detail: 'Nail down the starter course along the eaves to provide wind resistance.'
  },
  {
    label: '🧱 Begin Shingling',
    detail: 'Align shingles with the chalk line and nail according to pattern.'
  },
  {
    label: '🔍 Final Check',
    detail: 'Inspect nail placement, stagger, and water flow direction.'
  }
];

function RoofingSimulator() {
  const [step, setStep] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  const current = tasks[step];

  const handleStep = () => {
    setLog(prev => [...prev, `✅ ${current.label}`]);
    if (step + 1 < tasks.length) {
      setStep(prev => prev + 1);
    } else {
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
      <h1 className="text-green-400 text-xl font-bold">🏠 Roofing Simulator</h1>
      <p className="text-sm text-yellow-300 mb-4">🔧 Simulate basic shingle install and roof prep.</p>

      {!complete ? (
        <div style={{ marginTop: '2rem' }}>
          <h2 className="text-lg text-cyan-300 mb-2">{current.label}</h2>
          <p style={{ marginBottom: '1rem', color: '#ccc' }}>{current.detail}</p>
          <button className={styles.crtButton} onClick={handleStep}>
            {step === tasks.length - 1 ? '✅ Finish Simulation' : 'Next Step'}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <h3 className="text-green-300">🎯 Simulation Complete</h3>
          <p>Nice work! You’ve learned the foundational steps of asphalt shingle installation.</p>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h4 className="text-sm text-gray-400">📓 Task Log:</h4>
        <ul style={{ fontSize: '0.85rem', color: '#0ff' }}>
          {log.map((entry, idx) => (
            <li key={idx}>➡️ {entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(RoofingSimulator);