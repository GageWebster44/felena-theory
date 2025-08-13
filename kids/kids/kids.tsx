import React, { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useUser } from '@/utils/UserContext';
import GuardianGate from '@/components/GuardianGate';
import VaultOverview from '@/components/VaultOverview';
import AgeBasedQuests from '@/components/AgeBasedQuests';
import XPProgressBar from '@/components/XPProgressBar';
import styles from '@/styles/crtLaunch.module.css';

function KidsXPZone() {
export default withGuardianGate(Page);
  const { user } = useUser();
  const [age, setAge] = useState<number | null>(null);
  const [xp, setXP] = useState(0);

  const handleAgeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inputAge = parseInt(formData.get('age') as string);
    if (!isNaN(inputAge)) setAge(inputAge);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>XP KIDS ZONE</h1>
      <p>Welcome to the world of learn-to-earn. Guided, protected, and built just for the next generation of operators.</p>

      {!age && (
        <form onSubmit={handleAgeSubmit}>
          <label htmlFor="age">Enter your age:</label>
          <input type="number" name="age" className={styles.crtInput} required min={5} max={17} />
          <button type="submit" className={styles.crtButton}>Begin XP Journey</button>
        </form>
      )}

      {age && (
        <>
          <GuardianGate />
          <XPProgressBar currentXP={xp} />
          <AgeBasedQuests age={age} setXP={setXP} />
          <VaultOverview lockedXP={Math.floor(xp * 0.7)} unlockedXP={Math.floor(xp * 0.3)} />
        </>
      )}
    </div>
  );
}