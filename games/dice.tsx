import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import logXP from '@/utils/logXP';
import triggerXPBurst from '@/utils/triggerXPBurst';

function DiceGame() {
export default withGuardianGate(Page);
  const [guess, setGuess] = useState<'high' | 'low' | null>(null);
  const [roll, setRoll] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [xp, setXP] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

  // Fetch XP + Role
  useEffect(() => {
    const fetchUser = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp, role')
        .eq('id', user.user?.id)
        .single();

      setUserRole(profile?.role || '');
      setXP(profile?.xp || 0);
      setUserId(user.user?.id || '');
    };
    fetchUser();
  }, []);

  const isVIP = userRole === 'admin' || userRole === 'developer' || xp >= 5000;

  const rollDice = async () => {
    if (!guess) return;

    const value = Math.floor(Math.random() * 12) + 1;
    setRoll(value);

    const win =
      (guess === 'high' && value > 6) || (guess === 'low' && value <= 6);

    if (win) {
      setMessage(`✅ You guessed ${guess.toUpperCase()} and rolled ${value}. XP WON!`);
      playSound('xp-rain');
      triggerXPBurst();

      await logXP('dice_win', 50, `Guessed ${guess}, rolled ${value}`, userId);
      setXP((prev) => prev + 50);
    } else {
      setMessage(`❌ You guessed ${guess.toUpperCase()} but rolled ${value}.`);
      playSound('deny-glitch');

      await logXP('dice_loss', -25, `Guessed ${guess}, rolled ${value}`, userId);
      setXP((prev) => Math.max(prev - 25, 0));
    }

    setGuess(null);
  };

  // VIP Gating
  if (!isVIP) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h2 className="text-red-500 text-xl">🚫 VIP ACCESS REQUIRED</h2>
        <p>You need 5000+ XP or dev/admin status to play XP Dice.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h2>🎲 XP DICE</h2>
      <p>
        Guess HIGH (🎲 7-12) or LOW (🎲 1-6). Roll to win XP.
        <br />
        <strong>Wager: 25 XP loss / 50 XP win</strong>
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          className={styles.crtButton}
          onClick={() => setGuess('low')}
          disabled={guess === 'low'}
        >
          LOW 🎲
        </button>
        <button
          className={styles.crtButton}
          onClick={() => setGuess('high')}
          disabled={guess === 'high'}
        >
          HIGH 🎲
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          className={styles.crtButton}
          onClick={rollDice}
          disabled={!guess}
        >
          🎲 Roll Dice
        </button>
      </div>

      {roll !== null && (
        <div style={{ fontSize: '1.5rem', marginTop: '1rem' }}>{message}</div>
      )}
    </div>
  );
}