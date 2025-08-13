import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import hasEnoughXP, { updateXP, logXP, triggerCrateDrop } from '@/utils/xpEngine';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import { motion } from 'framer-motion';
import { useUserXP } from '@/hooks/useUserXP';
import { useUserRole } from '@/hooks/useUserRole';

const symbols = ['🔥', '💣', '💥', '💰', '💎'];
const fireJackpot = '🔥';
const denominations = [10, 25, 50, 100];

function generateGrid(): string[][] {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)])
  );
}

function isFireJackpot(grid: string[][]): boolean {
  return grid.flat().filter((s) => s === fireJackpot).length >= 6;
}

function FirelinkXP() {
export default withGuardianGate(Page);
  const { xp: userXP } = useUserXP();
  const { role } = useUserRole();
  const [grid, setGrid] = useState<string[][]>(generateGrid());
  const [message, setMessage] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [wagerXP, setWagerXP] = useState(25);

  const isVIP = userXP >= 5000 || ['admin', 'developer'].includes(role);

  const handleSpin = async () => {
    if (!isVIP) {
      setMessage('🔒 VIP access required to play.');
      return;
    }

    const allowed = await hasEnoughXP(wagerXP);
    if (!allowed) return setMessage('❌ Not enough XP to spin.');

    setMessage('');
    setSpinning(true);
    await updateXP(-wagerXP);
    logXP('firelink_spin', -wagerXP, `Firelink spin for ${wagerXP} XP`);
    playSound('spin');

    setTimeout(() => {
      const newGrid = generateGrid();
      setGrid(newGrid);

      if (isFireJackpot(newGrid)) {
        const payout = wagerXP * 10;
        updateXP(payout);
        logXP('firelink_win', payout, `🔥 Jackpot! Won ${payout} XP`);
        triggerCrateDrop('firelink');
        setMessage(`🔥 FIRE JACKPOT — Won ${payout} XP!`);
        playSound('xp-rain');
      } else {
        setMessage('💀 No fire jackpot. Try again.');
        playSound('deny');
      }

      setSpinning(false);
    }, 1300);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🔥 Firelink XP</h1>
      <motion.div className={styles.crtGridContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {grid.map((col, i) => (
          <div key={i} className={styles.crtGridItem}>
            {col.map((sym, j) => (
              <motion.span
                key={j}
                style={{ fontSize: '2rem' }}
                animate={{ scale: spinning ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {sym}
              </motion.span>
            ))}
          </div>
        ))}
      </motion.div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ color: '#0f0' }}>Wager:</label>
        <select
          className={styles.crtInput}
          value={wagerXP}
          onChange={(e) => setWagerXP(Number(e.target.value))}
          disabled={spinning}
        >
          {denominations.map((amount) => (
            <option key={amount} value={amount}>
              {amount} XP
            </option>
          ))}
        </select>
      </div>

      <motion.button
        onClick={handleSpin}
        className={styles.crtButton}
        whileTap={{ scale: 0.9 }}
        disabled={spinning}
      >
        {spinning ? 'SPINNING...' : `SPIN ${wagerXP} XP`}
      </motion.button>

      <p style={{ marginTop: '1rem', color: '#0ff' }}>{message}</p>
    </div>
  );
}