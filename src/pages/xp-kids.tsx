import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { getXPBreakdown, getUserAge } from '@/utils/xpEngine';
import Link from 'next/link';

function XPKids() {
export default withGuardianGate(Page);
  const [age, setAge] = useState<number | null>(null);
  const [lockedXP, setLockedXP] = useState(0);
  const [freeXP, setFreeXP] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { locked, free } = await getXPBreakdown();
      const userAge = await getUserAge();
      setAge(userAge);
      setLockedXP(locked);
      setFreeXP(free);
      setTotalXP(locked + free);
    };
    fetchData();
  }, []);

  const renderStageContent = () => {
    if (age === null || age >= 18) return null;

    if (age <= 8) {
      return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

        <>
          <h3>🧠 Stage 1: Early Learner (Ages 5–8)</h3>
          <ul>
            <li>📖 Press-to-learn reading and number games</li>
            <li>🧩 Strategy-based challenges with no gambling or randomness</li>
            <li>🌾 Tap-to-plant educational farming tasks</li>
            <li>🎨 Coloring, patterns, logic matching – earn XP for interaction</li>
            <li>🎁 Crates unlocked only through verified educational play</li>
          </ul>
        </>
      );
    }

    if (age <= 13) {
      return (
        <>
          <h3>🛠 Stage 2: Skill Builder (Ages 9–13)</h3>
          <ul>
            <li>🔌 Trade simulation minigames – wiring, plumbing, construction basics</li>
            <li>🧱 Build-a-job pathways – learn how real-world work operates</li>
            <li>🎓 Interactive quizzes and dynamic levels for career discovery</li>
            <li>💼 Career XP Core: Simulate tasks from multiple trades, not locked to one skill</li>
            <li>🎯 Learn-to-Earn Job Fair Mode: Beat skill stages and earn XP with progress</li>
          </ul>
        </>
      );
    }

    if (age < 18) {
      return (
        <>
          <h3>💻 Stage 3: Career Mode Academy (Ages 14–17)</h3>
          <ul>
            <li>🎮 XP Career Modes styled after popular game mechanics</li>
            <li>🏗 Task-driven progression systems – checklist of real-world skills</li>
            <li>🧮 Learn code, budgeting, UX, project workflow, and automation</li>
            <li>💼 Simulated workplaces with XP ranks and performance metrics</li>
            <li>🧬 Felena Academy prepares users to become real developers and operators</li>
          </ul>
        </>
      );
    }
  };

  return (
    <div className={styles.crtScreen}>
      <h2>👶 XP FOR KIDS</h2>
      <p>
        Welcome to the XP Kids Zone – earn XP through educational games and real-life learning.
        Your progress is secured by a vault until you're of age.
      </p>

      {age !== null && age < 18 ? (
        <>
          <div className={styles.crtPanelTitle}>
            <div className={styles.titleLabel}>🔒 Locked XP</div>
            <div style={{ fontSize: '1.5rem', color: '#ff0044' }}>{lockedXP} XP</div>
            <p>This portion is secured and saved until you're legally of age.</p>
          </div>

          <div className={styles.crtPanelTitle}>
            <div className={styles.titleLabel}>🆓 Free XP</div>
            <div style={{ fontSize: '1.5rem', color: '#00fff9' }}>{freeXP} XP</div>
            <p>You can use this XP now in games and starter unlocks.</p>
          </div>

          <div className={styles.crtPanelTitle}>
            <div className={styles.titleLabel}>📚 Learn & Earn Zones</div>
            <ul style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
              <li>🌾 <Link href="/edufarm">XP Farming</Link> – Grow crops & learn vocabulary/math</li>
              <li>🧠 <Link href="/xp-quiz">XP Quiz</Link> – Answer challenges to earn XP</li>
              <li>🎯 <Link href="/quests">Missions</Link> – Complete skill quests by age group</li>
            </ul>
          </div>

          <div className={styles.crtPanelTitle}>
            <div className={styles.titleLabel}>🎓 Age Stage</div>
            {renderStageContent()}
          </div>

          <p>
            <strong>Total XP Earned:</strong>{' '}
            <span style={{ color: '#0ff', fontSize: '0.9rem' }}>{totalXP} XP</span>
          </p>

          <div style={{ marginTop: '1rem', color: '#888' }}>
            <ul>
              <li>
                🧠 <strong>Note:</strong> 70% of your XP is locked in a secure vault. You'll unlock it when you're legally of age.
              </li>
              <li>
                This zone helps kids contribute early through real learning — not just games. You are never a mule. XP belongs to you.
              </li>
            </ul>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#aaa' }}>
            <p>📣 Parents are now training their kids from a young age to become professional athletes — all because of NIL deals.</p>
            <p>No child controls their genetics. But they <strong>can</strong> absorb real-world information that will change their future.</p>
            <p>The public school system has failed repeatedly to teach visual, engaging demonstrations of useful life skills — outside the outdated "high school to college" pipeline where families spend thousands just to sit and listen to things you could’ve learned online… for free.</p>
            <p>If you don’t believe that’s true — look at this app. Every mechanic. Every reward system. Every strategy. Built from scratch by a former concrete worker.</p>
            <p>Because <strong>book smarts and real-world perception</strong> are two completely different things.</p>
            <p>Most people won’t believe this kind of system could exist… even when the proof is right in front of them.</p>
            <p>That’s why we built it anyway.</p>
          </div>
        </>
      ) : (
        <>
          <p>You are verified as 18 or older. All XP is now unlocked and usable.</p>
          <p>
            <strong>Total XP:</strong>{' '}
            <span style={{ color: '#0ff', fontSize: '0.9rem' }}>{totalXP} XP</span>
          </p>
        </>
      )}
    </div>
  );
}