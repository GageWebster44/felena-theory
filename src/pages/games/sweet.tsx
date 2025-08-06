import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP, triggerCrateDrop } from '@/utils/xpEngine';
import playSound from '@/utils/playSound';
import { motion } from 'framer-motion';

const candySymbols = ['🍓', '🍇', '🍎', '🍌', '🍒', '🍬', '🍭', '🍋'];
const denominations = [10, 25, 50, 100];

function SweetXPBonanza() {
export default withGuardianGate(Page);
  const [grid, setGrid] = useState<string[][]>(generateGrid());
  const [message, setMessage] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [wagerXP, setWagerXP] = useState(25);
  const [userRole, setUserRole] = useState('public'); // Replace with actual role hook if available
  const [xpBalance, setXPBalance] = useState(0); // Optional live XP wallet tracking

  const generateGrid = (): string[][] => {
    return Array.from({ length: 6 }, () =>
      Array.from({ length: 5 }, () => candySymbols[Math.floor(Math.random() * candySymbols.length)])
    );
  };

  const countMatches = (symbol: string): number => {
    return grid.flat().filter(cell => cell === symbol).length;
  };

  const handleSpin = async () => {
    const baseXP = wagerXP * 2;
    const allowed = await hasEnoughXP(wagerXP);
    if (!allowed) return setMessage('❌ Not enough XP to play.');

    setSpinning(true);
    await updateXP(-wagerXP);
    logXP('sweet_spin', -wagerXP, `Sweet XP Bonanza spin for ${wagerXP} XP`);
    playSound('spin');

    setTimeout(async () => {
      const newGrid = generateGrid();
      setGrid(newGrid);
      const allSymbols = newGrid.flat();
      const winSymbol = candySymbols.find(sym => countMatches(sym) >= 8);

      if (winSymbol) {
        const bonusMultiplier = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 2 : 1;
        const rewardXP = baseXP * bonusMultiplier;
        await updateXP(rewardXP);
        logXP('sweet_win', rewardXP, `Matched ${winSymbol} ×${bonusMultiplier} = ${rewardXP} XP`);
        setMessage(`🎉 Matched ${winSymbol} ×${bonusMultiplier} = Earned ${rewardXP} XP!`);
        if (rewardXP >= 250) await triggerCrateDrop('sweet');
      } else {
        setMessage('❌ No match – try again.');
        playSound('deny');
      }

      setSpinning(false);
    }, 1200);
  };

  const isVIP = userRole === 'admin' || userRole === 'developer' || xpBalance >= 5000;

  if (!isVIP) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h1>Sweet XP Bonanza</h1>
        <p>🔒 VIP Access Required (5000+ XP or elevated role)</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1>🍬 Sweet XP Bonanza</h1>
      <motion.div
        className={styles.crtGridContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {grid.map((row, rIdx) => (
          <div key={rIdx} className={styles.crtGridItem}>
            {row.map((cell, cIdx) => (
              <motion.span
                key={cIdx}
                style={{ fontSize: '2rem' }}
                animate={{ scale: spinning ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {cell}
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
          disabled={spinning}
        >
          {denominations.map((amount) => (
            <option key={amount} value={amount}>{amount} XP</option>
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

      <p style={{ marginTop: '1rem', color: '#0f0' }}>{message}</p>
    </div>
  );
}