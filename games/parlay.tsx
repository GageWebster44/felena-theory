import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP } from '@/utils/xpEngine';
import useUserXP from '@/hooks/useUserXP';
import { useRouter } from 'next/router';

const mockGames = [
  { id: 1, name: 'Raiders vs Titans', favorite: 'Raiders' },
  { id: 2, name: 'Steelers vs Jets', favorite: 'Steelers' },
  { id: 3, name: 'Bulls vs Lakers', favorite: 'Lakers' },
];

function XPParlayGame() {
export default withGuardianGate(Page);
  const [picks, setPicks] = useState<{ [key: number]: string }>({});
  const [wager, setWager] = useState(100);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { xp } = useUserXP();
  const router = useRouter();

  const handlePick = (gameId: number, team: string) => {
    setPicks((prev) => ({ ...prev, [gameId]: team }));
  };

  const submitParlay = async () => {
    if (Object.keys(picks).length < mockGames.length) return alert('📋 Pick all outcomes');
    const allowed = await hasEnoughXP(wager);
    if (!allowed) return alert('❌ Not enough XP');

    await updateXP(-wager);
    logXP('parlay_wager', -wager, `Submitted Parlay Bet`);

    const allCorrect = mockGames.every((g) => picks[g.id] === g.favorite);
    if (allCorrect) {
      const payout = wager * 5;
      await updateXP(payout);
      logXP('parlay_win', payout, `Parlay HIT! ${payout} XP awarded`);
      setMessage(`✅ PARLAY HIT! +${payout} XP`);
    } else {
      setMessage(`❌ Parlay failed. Better luck next time.`);
    }

    setSubmitted(true);
  };

  // VIP access check
  if (xp < 5000) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h2>🎯 XP PARLAY</h2>
        <p style={{ color: 'red' }}>🔒 VIP Access Required (Min 5000 XP)</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1>🎯 XP PARLAY</h1>
      <p>Pick all winners correctly to <strong>5x</strong> your XP. Miss one, lose it all.</p>

      <div>
        {mockGames.map((g) => (
          <div key={g.id} style={{ marginBottom: '1rem' }}>
            <p>{g.name}</p>
            <button
              className={styles.crtButton}
              onClick={() => handlePick(g.id, g.name.split(' vs ')[0])}
              disabled={submitted}
            >
              {g.name.split(' vs ')[0]}
            </button>
            <button
              className={styles.crtButton}
              onClick={() => handlePick(g.id, g.name.split(' vs ')[1])}
              disabled={submitted}
            >
              {g.name.split(' vs ')[1]}
            </button>
          </div>
        ))}
      </div>

      <input
        className={styles.crtInput}
        type="number"
        value={wager}
        onChange={(e) => setWager(Number(e.target.value))}
        disabled={submitted}
      />

      <button
        onClick={submitParlay}
        className={styles.crtButton}
        disabled={submitted}
      >
        SUBMIT PARLAY
      </button>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}