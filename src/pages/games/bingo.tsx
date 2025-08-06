import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP } from '@/utils/xpEngine';

function generateBingoCard() {
  const card: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const col = [];
    while (col.length < 5) {
      const min = i * 15 + 1;
      const max = i * 15 + 15;
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!col.includes(num)) col.push(num);
    }
    card.push(col);
  }
  card[2][2] = 0; // Free space
  return card;
}

function getBingoLetter(index: number) {
  return ['B','I','N','G','O'][index];
}

function XPBingo() {
export default withGuardianGate(Page);
  const [card, setCard] = useState(generateBingoCard());
  const [called, setCalled] = useState<number[]>([]);
  const [wager, setWager] = useState(100);
  const [message, setMessage] = useState('');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (playing && called.length < 20) {
      const timeout = setTimeout(() => {
        let newNum;
        do {
          newNum = Math.floor(Math.random() * 75) + 1;
        } while (called.includes(newNum));
        setCalled([...called, newNum]);
      }, 1000);
      return () => clearTimeout(timeout);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    }
  }, [called, playing]);

  const start = async () => {
    const allowed = await hasEnoughXP(wager);
    if (!allowed) return alert('Not enough XP');
    await updateXP(-wager);
    logXP('bingo_start', -wager, 'Entered Bingo Draw');
    setPlaying(true);
    setCalled([]);
    setCard(generateBingoCard());
    setMessage('Drawing numbers...');
  };

  const checkWin = () => {
    const marked = card.map((col) => col.map((num) => num === 0 || called.includes(num)));
    const hasRow = marked.some(row => row.every(val => val));
    const hasCol = marked[0].some((_, col) => marked.every(row => row[col]));
    const diag1 = [0,1,2,3,4].every(i => marked[i][i]);
    const diag2 = [0,1,2,3,4].every(i => marked[i][4-i]);

    if (hasRow || hasCol || diag1 || diag2) {
      const reward = wager * 5;
      updateXP(reward);
      logXP('bingo_win', reward, 'Bingo Win!');
      setMessage(`🎉 BINGO! You won ${reward} XP!`);
      setPlaying(false);
    } else {
      setMessage(`📡 Called ${called.length} numbers. Keep going...`);
    }
  };

  return (
    <div className={styles.crtScreen}>
      <h1>🎱 XP BINGO</h1>
      <p>Get a full row, column, or diagonal to win. 5× payout if you hit BINGO!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {card.map((col, ci) => (
          col.map((num, ri) => (
            <div key={ci + '-' + ri} className={styles.gameCard} style={{ background: num === 0 || called.includes(num) ? '#0f0' : '#111' }}>
              {num === 0 ? '★' : num}
            </div>
          ))
        ))}
      </div>

      {!playing && (
        <>
          <input
            type="number"
            value={wager}
            onChange={(e) => setWager(Number(e.target.value))}
            className={styles.crtInput}
          />
          <button onClick={start} className={styles.crtButton}>
            PLAY
          </button>
        </>
      )}

      {playing && (
        <>
          <button className={styles.crtButton} onClick={checkWin}>CHECK</button>
          <p style={{ marginTop: '1rem' }}>{message}</p>
        </>
      )}
    </div>
  );
}