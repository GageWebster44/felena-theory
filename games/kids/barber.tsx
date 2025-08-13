// pages/games/kids/barber.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';
import playSound from '@/utils/playSound';

const steps = [
  { id: 1, task: 'Sanitize tools', correct: 'Clippers' },
  { id: 2, task: 'Shape up sides', correct: 'Razor' },
  { id: 3, task: 'Fade the back', correct: 'Clippers' },
  { id: 4, task: 'Trim top', correct: 'Scissors' },
  { id: 5, task: 'Detail beard line', correct: 'Razor' }
];

const tools = ['Clippers', 'Scissors', 'Comb', 'Razor'];

function BarberGame() {
  const [currentStep, setCurrentStep] = useState(0);
  const [xp, setXP] = useState(0);
  const [message, setMessage] = useState('');

  const handleChoice = (tool: string) => {
    const step = steps[currentStep];
    if (tool === step.correct) {
      playSound('xp-rain');
      setXP((prev) => prev + 10);
      setMessage(`✅ Correct tool: +10 XP`);
    } else {
      setMessage(`❌ Wrong tool. Try again.`);
    }

    setTimeout(() => {
      setMessage('');
      if (currentStep + 1 < steps.length) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setMessage('🎯 Cut complete! Client satisfied. XP Banked.');
      }
    }, 1200);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className="text-green-400 text-xl font-bold mb-2">💈 Barber XP Challenge</h1>
      <p className="text-sm mb-4">✂️ Complete a clean professional fade using the right tools in sequence.</p>

      {currentStep < steps.length && (
        <div>
          <p className="text-cyan-300 mb-2">🔧 Step {currentStep + 1}: {steps[currentStep].task}</p>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((tool) => (
              <button
                key={tool}
                className={styles.crtButton}
                onClick={() => handleChoice(tool)}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="mt-4 text-yellow-300">{message}</p>
      )}

      <div className="mt-6 text-sm text-green-200">
        Total XP Earned: <strong>{xp}</strong>
      </div>
    </div>
  );
}

export default withGuardianGate(BarberGame);