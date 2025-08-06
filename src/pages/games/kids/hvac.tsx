// pages/games/kids/hvac.tsx
import { useState } from 'react';
import withGuardianGate from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

function HVACSim() {
  const [step, setStep] = useState(0);
  const [diagnosis, setDiagnosis] = useState('');
  const [result, setResult] = useState('');

  const reset = () => {
    setStep(0);
    setDiagnosis('');
    setResult('');
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🛠 HVAC DIAGNOSTIC SIM</h1>
      <p>🧊 Interactive intro to heating, ventilation, and air conditioning troubleshooting.</p>

      {step === 0 && (
        <div>
          <p>👉 Step 1: Check the thermostat.</p>
          <button className={styles.crtButton} onClick={handleNext}>Thermostat is set correctly ✅</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <p>👉 Step 2: Inspect air filter condition.</p>
          <button className={styles.crtButton} onClick={handleNext}>Filter is clean ✅</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>👉 Step 3: Check outdoor unit.</p>
          <button className={styles.crtButton} onClick={handleNext}>Unit has power and is running ✅</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p>👉 Step 4: Diagnose system issue.</p>
          <select
            className={styles.crtInput}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
          >
            <option value="">-- Select Diagnosis --</option>
            <option value="low_refrigerant">Low Refrigerant</option>
            <option value="faulty_thermostat">Faulty Thermostat</option>
            <option value="dirty_filter">Dirty Filter</option>
            <option value="bad_compressor">Bad Compressor</option>
          </select>
          <button
            className={styles.crtButton}
            onClick={handleNext}
            disabled={!diagnosis}
          >
            Submit Diagnosis
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>📋 Results</h2>
          {diagnosis === 'low_refrigerant' ? (
            <p style={{ color: '#0f0' }}>✅ Correct! Low refrigerant was the issue. Good work, technician.</p>
          ) : (
            <p style={{ color: '#f00' }}>❌ Incorrect. The real problem was low refrigerant. Review the clues again.</p>
          )}
          <button className={styles.crtButton} onClick={reset}>🔁 Restart</button>
        </div>
      )}
    </div>
  );
}

export default withGuardianGate(HVACSim);