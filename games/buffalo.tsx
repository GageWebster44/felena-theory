import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP, triggerCrateDrop } from '@/utils/xpEngine';
import playSound from '@/utils/playSound';
import { motion } from 'framer-motion';

// 🎰 Buffalo Symbol Set
const symbols = ['🦬', '🦬', '🦬', '🦬', '🦬', '🦅', '🦅', '🦅', '🐺', '🐺', '🌄', '🌄', 'A', 'K', 'Q', 'J', '10', '9'];
const multipliers = [2, 3, 5]; // Used for wild logic if needed

function BuffaloXP() {
export default withGuardianGate(Page);
  const [reels, setReels] = useState<string[][]>(generateReels());
  const [message, setMessage] = useState('');
  const [isSpinning, setSpinning] = useState(false);
  const [wagerXP, setWagerXP] = useState(25);

  function generateReels(): string[][] {
    return Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)])
    );
  }

  async function handleSpin() {
    const allowed = await hasEnoughXP(wagerXP);
    if (!allowed) return alert('Not enough XP to spin.');
    await updateXP(-wagerXP);
    logXP('buffalo_spin', -wagerXP, `Buffalo spin for ${wagerXP} XP`);
    playSound('spin');

    setSpinning(true);
    setMessage('');

    setTimeout(() => {
      const newReels = generateReels();
      setReels(newReels);
      const flat = newReels.flat();
      const freq: Record<string, number> = {};

      flat.forEach((s) => {
        freq[s] = (freq[s] || 0) + 1;
      });

      const topSymbol = Object.keys(freq).find((s) => freq[s] >= 5);

      if (topSymbol) {
        const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
        const payout = wagerXP * multiplier;
        updateXP(payout);
        logXP('buffalo_win', payout, `Matched ${topSymbol} x${multiplier} — Won ${payout} XP`);
        setMessage(`🎉 JACKPOT! ${topSymbol} x${multiplier} — Won ${payout} XP!`);

        if (payout >= 250) triggerCrateDrop('buffalo');
        playSound('xp-win');
      } else {
        setMessage('💨 No winning combo. Try again.');
        playSound('deny-glitch');
      }

      setSpinning(false);
    }, 1200);
  }

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🦬 Buffalo XP Spin</h1>
      <motion.div className={styles.crtGridContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {reels.map((col, i) => (
          <div key={i} className={styles.crtGridItem}>
            {col.map((sym, j) => (
              <motion.span
                key={j}
                style={{ fontSize: '2rem' }}
                animate={{ scale: isSpinning ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.25 }}
              >
                {sym}
              </motion.span>
            ))}
          </div>
        ))}
      </motion.div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ color: '#0f0' }}>Wager: </label>
        <select
          className={styles.crtInput}
          value={wagerXP}
          onChange={(e) => setWagerXP(Number(e.target.value))}
          disabled={isSpinning}
        >
          {[25, 50, 100, 250, 500].map((amount) => (
            <option key={amount} value={amount}>{amount} XP</option>
          ))}
        </select>

        <motion.button
          onClick={handleSpin}
          className={styles.crtButton}
          whileTap={{ scale: 0.9 }}
          disabled={isSpinning}
        >
          🎰 {isSpinning ? 'SPINNING...' : `SPIN ${wagerXP} XP`}
        </motion.button>
      </div>

      {message && <p style={{ marginTop: '1rem', color: '#0ff' }}>{message}</p>}
    </div>
  );
}