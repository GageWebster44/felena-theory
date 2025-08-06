// pages/games/kids/truck-driver.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function TruckDriverGame() {
  const [step, setStep] = useState<'intro' | 'checklist' | 'route' | 'drive'>('intro');
  const [log, setLog] = useState<string[]>([]);

  const advance = (next: typeof step) => setStep(next);

  const logAction = (msg: string) => {
    setLog((prev) => [`✅ ${msg}`, ...prev.slice(0, 8)]);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🚛 SIM: TRUCK DRIVER</h1>
      <p>Step into the world of long-haul logistics and commercial driving.</p>

      {step === 'intro' && (
        <div style={{ marginTop: '1rem' }}>
          <p>🕕 You're a Class A CDL driver for a national freight company. It’s 6:00 AM, and your shift is starting.</p>
          <button onClick={() => advance('checklist')} className={styles.crtButton}>
            Start Pre-Trip Checklist
          </button>
        </div>
      )}

      {step === 'checklist' && (
        <div style={{ marginTop: '1rem' }}>
          <p>✅ Select each step before driving:</p>
          <div className={styles.crtGridResponsive}>
            <button onClick={() => logAction('Checked air brakes')} className={styles.crtButton}>Check Brakes</button>
            <button onClick={() => logAction('Verified load securement')} className={styles.crtButton}>Secure Load</button>
            <button onClick={() => logAction('Completed tire pressure inspection')} className={styles.crtButton}>Inspect Tires</button>
            <button onClick={() => logAction('Mirrors adjusted for visibility')} className={styles.crtButton}>Adjust Mirrors</button>
          </div>
          <button onClick={() => advance('route')} className={styles.crtButton} style={{ marginTop: '1rem' }}>
            Next: Plan Route
          </button>
        </div>
      )}

      {step === 'route' && (
        <div style={{ marginTop: '1rem' }}>
          <p>🗺 Pick your route:</p>
          <div className={styles.crtGridResponsive}>
            <button onClick={() => { logAction('Chose I-80 Westbound'); advance('drive'); }} className={styles.crtButton}>
              I-80 (Urban)
            </button>
            <button onClick={() => { logAction('Chose Highway 30 (rural)'); advance('drive'); }} className={styles.crtButton}>
              Hwy 30 (Rural)
            </button>
          </div>
        </div>
      )}

      {step === 'drive' && (
        <div style={{ marginTop: '1rem' }}>
          <p>🛣 You're on the road. Simulate an action:</p>
          <div className={styles.crtGridResponsive}>
            <button onClick={() => logAction('Took a 30-min rest break')} className={styles.crtButton}>Take Break</button>
            <button onClick={() => logAction('Checked in at a weigh station')} className={styles.crtButton}>Weigh Station</button>
            <button onClick={() => logAction('Delivered freight on time')} className={styles.crtButton}>Complete Delivery</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 className="text-green-400 text-sm">📜 Action Log:</h3>
        <ul style={{ fontSize: '0.85rem', color: '#0ff' }}>
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(TruckDriverGame);