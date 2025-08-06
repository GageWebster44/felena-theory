import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/guardian-gate';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';

const scenarios = [
  {
    id: 1,
    task: 'Check ID at the entrance',
    correctAction: 'check_id',
    description: 'A person walks up to the gate. What do you do?',
    options: ['Let them pass', 'Check ID', 'Call backup'],
  },
  {
    id: 2,
    task: 'Respond to door alarm',
    correctAction: 'investigate',
    description: 'An alarm triggers from the back door. What’s your response?',
    options: ['Ignore it', 'Investigate', 'Sound lockdown'],
  },
  {
    id: 3,
    task: 'Monitor suspicious package',
    correctAction: 'alert_team',
    description: 'You notice an unattended bag near the elevator.',
    options: ['Move the bag', 'Alert team', 'Ignore it'],
  },
];

function SecurityGame() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);

  const handleAction = (choice: string) => {
    const scenario = scenarios[step];
    const isCorrect =
      choice.toLowerCase().replace(/\s/g, '_') === scenario.correctAction;
    playSound(isCorrect ? 'confirm' : 'deny');

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setMessage('✅ Correct response.');
    } else {
      setMessage('❌ Incorrect action. Try to think like a professional guard.');
    }

    setTimeout(() => {
      setMessage('');
      setStep((prev) => prev + 1);
    }, 2000);
  };

  if (step >= scenarios.length) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h1 className="text-green-400 text-xl">🛡 SECURITY SIM COMPLETE</h1>
        <p className="text-lg">Final Score: {score} / {scenarios.length}</p>
        <p>Well done! You’ve practiced key safety decision making.</p>
      </div>
    );
  }

  const current = scenarios[step];

  return (
    <div className={styles.crtScreen}>
      <h1 className="text-green-300 text-xl">🔒 SECURITY GUARD SIMULATOR</h1>
      <p className="text-sm text-yellow-300">Simulation {step + 1} of {scenarios.length}</p>

      <div className="mt-4 mb-2 text-white">
        <strong>{current.task}</strong>
        <p className="text-gray-300 mt-2">{current.description}</p>
      </div>

      <div className={styles.crtGridResponsive}>
        {current.options.map((opt, idx) => (
          <button key={idx} className={styles.crtButton} onClick={() => handleAction(opt)}>
            {opt}
          </button>
        ))}
      </div>

      {message && <p className="text-cyan-400 mt-4">{message}</p>}
    </div>
  );
}

export default withGuardianGate(SecurityGame);