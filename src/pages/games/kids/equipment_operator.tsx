// pages/games/kids/equipment-operator.tsx
import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

const tasks = [
  {
    step: 'Choose Your Equipment',
    detail: 'Pick between bulldozer, excavator, or skid loader for your mission.',
    choices: ['Bulldozer', 'Excavator', 'Skid Loader'],
  },
  {
    step: 'Startup & Inspection',
    detail: 'Perform a walk-around, check fluid levels, and start the machine.',
    choices: ['Start Engine', 'Check Fluids', 'Inspect Tracks'],
  },
  {
    step: 'Basic Maneuvers',
    detail: 'Practice moving forward, backward, and rotating the cab.',
    choices: ['Move Forward', 'Rotate Cab', 'Lower Blade'],
  },
  {
    step: 'Complete the Mission',
    detail: 'Use your equipment to move dirt, stack pallets, or dig a trench.',
    choices: ['Move Dirt', 'Dig Trench', 'Stack Materials'],
  },
  {
    step: 'Shut Down & Park',
    detail: 'Return the machine, shut it off, and record your work.',
    choices: ['Shut Down', 'Log Hours', 'Secure Machine'],
  },
];

function EquipmentOperatorSim() {
  const [index, setIndex] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const current = tasks[index];

  const handleChoice = (choice: string) => {
    setLog((prev) => [...prev, `✅ ${current.step}: ${choice}`]);
    setIndex((prev) => Math.min(prev + 1, tasks.length - 1));
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🚜 EQUIPMENT OPERATOR SIM</h1>
      <p>Learn how to safely operate heavy equipment in construction settings.</p>

      <div style={{ marginTop: '2rem' }}>
        <h2 className="text-xl text-green-400">Step {index + 1}: {current.step}</h2>
        <p className="text-sm text-gray-300">{current.detail}</p>
      </div>

      <div className={styles.crtGridResponsive} style={{ marginTop: '1rem' }}>
        {current.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => handleChoice(c)}
            className={styles.crtButton}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 className="text-green-400 text-sm">🧾 Simulation Log:</h3>
        <ul style={{ fontSize: '0.85rem', color: '#0ff' }}>
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(EquipmentOperatorSim);