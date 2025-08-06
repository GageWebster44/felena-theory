// pages/games/kids/engineering.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const steps = [
  '📌 Step 1: Define the problem and identify constraints.',
  '✏️ Step 2: Brainstorm solutions and sketch ideas.',
  '🔧 Step 3: Build a prototype using digital or physical tools.',
  '🧪 Step 4: Build and test the prototype with real-world stress testing.',
  '📈 Step 5: Evaluate results, document feedback, and iterate improvements.',
];

function EngineeringGame() {
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    if (index < steps.length - 1) {
      setIndex(index + 1);
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
      <h1>🛠️ ENGINEERING CHALLENGE</h1>
      <p>Design and refine your first simple machine or structure. Engineering is about iteration!</p>

      <div style={{ marginTop: '2rem', color: '#0ff', fontSize: '1rem' }}>
        {!completed ? (
          <>
            <p>{steps[index]}</p>
            <button
              className={styles.crtButton}
              onClick={nextStep}
              style={{ marginTop: '1rem' }}
            >
              {index === steps.length - 1 ? '✅ Finish Project' : '➡️ Next Step'}
            </button>
          </>
        ) : (
          <p style={{ color: '#00ff99' }}>✅ Project simulation complete. Engineers build the future.</p>
        )}
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#aaa' }}>
        Real-world engineering requires math, drafting, testing, and reporting.
        <br />➡️ You can start with Legos, cardboard, code — anything.
      </div>
    </div>
  );
}

export default withGuardianGate(EngineeringGame);