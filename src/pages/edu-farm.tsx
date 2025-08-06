import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { updateXP, logXP, getUserAge } from '@/utils/xpEngine';

const stages = ['Seed Planted 🌱', 'Watered 💧', 'Grown 🌿', 'Harvested 🌾'];
const tips = [
  'Plants grow with care—so do minds. 🌱',
  'Stay consistent! Water your plant daily. 💧',
  'Growth takes time—patience builds wisdom. 🌿',
  'You did it! Harvest time! 🌾'
];

function EduFarmXP() {
export default withGuardianGate(Page);
  const [stage, setStage] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [message, setMessage] = useState('');
  const [tip, setTip] = useState(tips[0]);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    const fetchAge = async () => {
      const a = await getUserAge();
      setAge(a);
    };
    fetchAge();
  }, []);

  const advanceStage = async () => {
    if (cooldown || stage >= stages.length - 1) return;

    setCooldown(true);
    setTimeout(() => setCooldown(false), 2500);

    const xpGain = stage === stages.length - 2 ? 10 : 3;
    const newStage = stage + 1;

    setStage(newStage);
    await updateXP(xpGain);
    await logXP(`edu-farm`, xpGain, `Advanced to "${stages[newStage]}"`);

    setMessage(`✅ ${stages[newStage]}! You earned ${xpGain} XP.`);
    setTip(tips[newStage] || 'Keep going! More learning ahead.');
  };

  const renderStageModules = () => {
    if (age === null) return null;
    if (age <= 8) {
      return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

        <>
          <h3>🧠 Stage 1: Early Learner</h3>
          <ul>
            <li>🎨 Press-to-play matching and shapes</li>
            <li>🔤 Learn colors, numbers, and letters through repetition</li>
            <li>🌱 Earn XP by tapping and interacting</li>
          </ul>
        </>
      );
    }
    if (age <= 13) {
      return (
        <>
          <h3>🛠 Stage 2: Trade Simulation Core</h3>
          <ul>
            <li>🔌 Wire circuits in sandbox training zones</li>
            <li>🚧 Smooth concrete, assemble pipe grids</li>
            <li>💼 Career playground with leveling XP unlocks</li>
          </ul>
        </>
      );
    }
    if (age < 18) {
      return (
        <>
          <h3>💻 Stage 3: Career Mode Academy</h3>
          <ul>
            <li>🧮 Logic programming games</li>
            <li>🗂 Real-world project simulations and builds</li>
            <li>📊 Career XP tracker with goal ladder</li>
          </ul>
        </>
      );
    }
    return null;
  };

  return (
    <div className={styles.crtScreen}>
      <h1>🌾 Learn-to-Earn: XP Farming Garden</h1>
      <p>Complete learning stages to grow your plant and earn XP toward your future!</p>

      <div className={styles.shopGrid}>
        <div className={styles.shopCard}>
          <h2>🧑‍🌾 Current Growth Stage:</h2>
          <p style={{ fontSize: '1.5rem', color: '#0ff' }}>{stages[stage]}</p>
          <p style={{ fontSize: '1rem', color: '#aaa' }}>{tip}</p>

          <button
            onClick={advanceStage}
            disabled={cooldown || stage === stages.length - 1}
            className={styles.crtButton}
          >
            {cooldown
              ? '⏳ Processing...'
              : stage === stages.length - 1
              ? '✅ Fully Grown'
              : 'Advance Stage'}
          </button>

          {message && (
            <p style={{ color: '#0f0', marginTop: '1rem' }}>{message}</p>
          )}
        </div>

        <div className={styles.shopCard}>
          <h2>🎓 Why it matters</h2>
          <ul style={{ paddingLeft: '1rem', lineHeight: '1.5' }}>
            <li>Each stage simulates discipline, focus, and care.</li>
            <li>XP earned goes into a vault for your real-world future.</li>
            <li>Unlock new educational games as you grow older.</li>
            <li>This is how learning builds wealth. 📈</li>
          </ul>

          <div style={{ marginTop: '1.5rem' }}>{renderStageModules()}</div>
        </div>
      </div>
    </div>
  );
}