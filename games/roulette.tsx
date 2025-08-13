import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP } from '@/utils/xpEngine';

const numbers = ['0', '00', ...Array.from({ length: 36 }, (_, i) => i + 1)];
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

function XPRoulette() {
export default withGuardianGate(Page);
  const [betType, setBetType] = useState('red');
  const [wager, setWager] = useState(100);
  const [result, setResult] = useState<string | number | null>(null);
  const [message, setMessage] = useState('');
  const [spinning, setSpinning] = useState(false);

  const spin = async () => {
    const allowed = await hasEnoughXP(wager);
    if (!allowed) return alert('Not enough XP');

    setSpinning(true);
    await updateXP(-wager);
    logXP('roulette_wager', -wager, `Bet ${wager} XP on ${betType}`);
    
    setTimeout(async () => {
      const landed = numbers[Math.floor(Math.random() * numbers.length)];
      setResult(landed);

      let win = false;
      if (typeof landed === 'number') {
        if (betType === 'red') win = redNumbers.has(landed);
        else if (betType === 'black') win = !redNumbers.has(landed);
        else if (betType === 'even') win = landed % 2 === 0;
        else if (betType === 'odd') win = landed % 2 === 1;
      } else {
        win = false; // 0 or 00
      }

      if (win) {
        const payout = wager * 2;
        await updateXP(payout);
        logXP('roulette_win', payout, `Won on ${betType} → ${landed}`);
        setMessage(`✅ Landed on ${landed}. You won ${payout} XP!`);
      } else {
        setMessage(`❌ Landed on ${landed}. You lost ${wager} XP.`);
      }

      setSpinning(false);
    }, 2000);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🎰 XP ROULETTE (American)</h1>
      <p>
        Wager on red, black, even, or odd. American rules include <b>0</b> and <b>00</b>.
      </p>

      <select
        className={styles.crtInput}
        value={betType}
        onChange={(e) => setBetType(e.target.value)}
        disabled={spinning}
      >
        <option value="red">Red</option>
        <option value="black">Black</option>
        <option value="even">Even</option>
        <option value="odd">Odd</option>
      </select>

      <input
        className={styles.crtInput}
        type="number"
        value={wager}
        onChange={(e) => setWager(Number(e.target.value))}
        disabled={spinning}
      />

      <button
        onClick={spin}
        className={styles.crtButton}
        disabled={spinning}
      >
        {spinning ? 'SPINNING...' : 'SPIN'}
      </button>

      {message && (
        <p style={{ marginTop: '1rem', color: '#0f0' }}>{message}</p>
      )}
    </div>
  );
}