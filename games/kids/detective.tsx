// pages/games/kids/detective.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const clues = [
  { clue: 'Footprints outside the broken window', correct: true },
  { clue: 'Coffee cup on the table', correct: false },
  { clue: 'Missing laptop', correct: true },
  { clue: 'Open fridge', correct: false },
  { clue: 'Security camera disabled', correct: true },
];

function DetectiveGame() {
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  const handleSelect = (clue: string) => {
    if (selected.includes(clue)) return;
    setSelected([...selected, clue]);
  };

  const solveCase = () => {
    const correctClues = clues.filter(c => c.correct).map(c => c.clue);
    const incorrectClues = clues.filter(c => !c.correct).map(c => c.clue);

    const foundAll = correctClues.every(c => selected.includes(c));
    const noExtras = selected.filter(c => incorrectClues.includes(c)).length === 0;

    if (foundAll && noExtras) {
      setResult('✅ Case Solved! Great detective work.');
    } else {
      setResult('❌ Case Incomplete or Incorrect. Try again.');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🕵️ DETECTIVE TRAINING</h1>
      <p>Scan the scene and identify clues. Solve the case by selecting correct evidence.</p>

      <ul style={{ marginTop: '1.5rem' }}>
        {clues.map((c, i) => (
          <li key={i} style={{ marginBottom: '0.5rem' }}>
            <button
              className={styles.crtButton}
              style={{
                backgroundColor: selected.includes(c.clue) ? '#00ff99' : undefined,
              }}
              onClick={() => handleSelect(c.clue)}
            >
              {c.clue}
            </button>
          </li>
        ))}
      </ul>

      <button
        className={styles.crtButton}
        onClick={solveCase}
        style={{ marginTop: '2rem' }}
      >
        🧠 Solve Case
      </button>

      {result && (
        <p
          style={{
            marginTop: '1rem',
            color: result.includes('❌') ? '#f00' : '#0f0',
          }}
        >
          {result}
        </p>
      )}
    </div>
  );
}

export default withGuardianGate(DetectiveGame);