import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import { updateXP, logXP } from '@/utils/xpEngine';

const segments = [
  { label: '💥 0 XP', value: 0 },
  { label: '🎉 10 XP', value: 10 },
  { label: '🎉 25 XP', value: 25 },
  { label: '🎉 50 XP', value: 50 },
  { label: '💎 100 XP', value: 100 },
];

function XPWheelGame() {
export default withGuardianGate(Page);
  const [spinResult, setSpinResult] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [reward, setReward] = useState(0);
  const [xpBalance, setXPBalance] = useState(0); // Replace with live wallet check
  const [userRole, setUserRole] = useState('public'); // Replace with actual hook

  const isVIP = userRole === 'admin' || userRole === 'developer' || xpBalance >= 5000;

  useEffect(() => {
    setXPBalance(6200); // mock value
    setUserRole('public');
  }, []);

  const spinWheel = async () => {
    setSpinning(true);
    setSpinResult('');
    setReward(0);
    playSound('click');

    setTimeout(async () => {
      const chosen = segments[Math.floor(Math.random() * segments.length)];
      setSpinResult(chosen.label);
      setReward(chosen.value);

      if (chosen.value > 0) {
        await updateXP(chosen.value);
        playSound('xp-win');
        logXP('wheel_win', chosen.value, `Won ${chosen.label}`);
      } else {
        playSound('deny-glitch');
        logXP('wheel_fail', 0, `No XP awarded`);
      }

      setSpinning(false);
    }, 1500);
  };

  if (!isVIP) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h1>XP WHEEL</h1>
        <p>🔒 VIP Only – Must have 5000+ XP or Dev/Admin role to spin.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1>🎡 XP WHEEL</h1>
      <p>Spin for a chance at XP drops. Only one shot per spin.</p>

      <div style={{ fontSize: '4rem', margin: '2rem 0' }}>
        {spinResult}
      </div>

      <button
        className={styles.crtButton}
        onClick={spinWheel}
        disabled={spinning}
      >
        {spinning ? 'SPINNING...' : '🎯 SPIN THE WHEEL'}
      </button>

      {reward > 0 && (
        <p style={{ color: 'lime', marginTop: '1rem' }}>
          ✅ +{reward} XP earned
        </p>
      )}

      {reward === 0 && spinResult && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          ❌ No XP this round.
        </p>
      )}
    </div>
  );
}