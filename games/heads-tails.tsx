import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP } from '@/utils/xpEngine';

const choices = ['heads', 'tails'];
const icons = {
  heads: '🪙 HEADS',
  tails: '🪙 TAILS',
};

function HeadsTailsGame() {
export default withGuardianGate(Page);
  const [userChoice, setUserChoice] = useState('heads');
  const [result, setResult] = useState('');
  const [wager, setWager] = useState(25);
  const [message, setMessage] = useState('');
  const [flipping, setFlipping] = useState(false);
  const [xp, setXP] = useState(0);
  const [role, setRole] = useState('');

  // VIP access check
  const isVIP = role === 'admin' || role === 'developer' || xp >= 5000;

  async function flipCoin() {
    const allowed = await hasEnoughXP(wager);
    if (!allowed) return alert('Not enough XP');

    setFlipping(true);
    await updateXP(-wager);
    logXP('coin_wager', wager, `Flipped ${userChoice}`);

    setTimeout(async () => {
      const outcome = choices[Math.floor(Math.random() * 2)];
      setResult(outcome);

      if (outcome === userChoice) {
        const payout = wager * 2;
        await updateXP(payout);
        logXP('coin_win', payout, `Won on ${outcome}`);
        setMessage(`✅ You won! ${icons[outcome]} → +${payout} XP`);
      } else {
        logXP('coin_loss', -wager, `Lost on ${outcome}`);
        setMessage(`❌ You lost. It landed on ${icons[outcome]}`);
      }

      setFlipping(false);
    }, 1200);
  }

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>💠 HEADS OR TAILS</h1>
      <p>Pick a side. 2× payout if you're right.</p>

      {!isVIP ? (
        <p style={{ color: 'red' }}>🚫 VIP ONLY — Requires 5000 XP or admin/dev</p>
      ) : (
        <>
          <select
            value={userChoice}
            onChange={(e) => setUserChoice(e.target.value)}
            className={styles.crtInput}
            disabled={flipping}
          >
            <option value="heads">Heads</option>
            <option value="tails">Tails</option>
          </select>

          <input
            className={styles.crtInput}
            type="number"
            value={wager}
            onChange={(e) => setWager(Number(e.target.value))}
            disabled={flipping}
          />

          <button
            className={styles.crtButton}
            onClick={flipCoin}
            disabled={flipping}
          >
            {flipping ? '🌀 FLIPPING...' : '🎲 FLIP COIN'}
          </button>
        </>
      )}

      {result && (
        <div style={{ marginTop: '1rem', color: result === userChoice ? '#0f0' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
}