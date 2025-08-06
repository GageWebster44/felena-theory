import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import triggerXPBurst from '@/utils/triggerXPBurst';
import { logXP, hasEnoughXP, updateXP } from '@/utils/xpEngine';

const cantinaSymbols = ['🍷', '🥃', '💀', '🐎', '🎩', '🔫', '🎰'];

function getRandomSymbol() {
  return cantinaSymbols[Math.floor(Math.random() * cantinaSymbols.length)];
}

function FelenaCantina() {
export default withGuardianGate(Page);
  const [reels, setReels] = useState(['❓', '❓', '❓']);
  const [message, setMessage] = useState('');
  const [wager, setWager] = useState(25);
  const [spinning, setSpinning] = useState(false);
  const [isVIP, setIsVIP] = useState(false);

  // Check VIP access
  useEffect(() => {
    const checkVIP = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
      const { data: wallet } = await supabase
        .from('xp_wallet')
        .select('xp')
        .eq('user_id', userData.user.id)
        .single();

      const role = profile?.role || '';
      const xp = wallet?.xp || 0;
      setIsVIP(role === 'admin' || role === 'developer' || xp >= 5000);
    };

    checkVIP();
  }, []);

  const spin = async () => {
    const allowed = await hasEnoughXP(wager);
    if (!allowed) return alert('Not enough XP!');

    const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    setReels(result);
    setSpinning(true);
    setMessage('');

    playSound('spin');
    await updateXP(-wager);
    await logXP('cantina_spin', -wager, `Cantina spin wagered ${wager} XP`);
    await new Promise((r) => setTimeout(r, 1200));

    const win = result.every((s) => s === result[0]);

    if (win) {
      const reward = wager * 3;
      triggerXPBurst();
      await updateXP(reward);
      await logXP('cantina_win', reward, `Matched 3 ${result[0]} for ${reward} XP`);
      setMessage(`🎯 JACKPOT! 3x ${result[0]} = +${reward} XP`);
      playSound('win-chime');
    } else {
      setMessage(`❌ Missed. Try again, gunslinger!`);
      await logXP('cantina_loss', -15, `No match: ${result.join(', ')}`);
      playSound('deny-glitch');
    }

    setSpinning(false);
  };

  if (!isVIP) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h2>🔒 VIP ACCESS ONLY</h2>
        <p>
          You must have at least <strong>5,000 XP</strong> or be an <strong>admin/developer</strong> to access Felena's Cantina.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h2>🍸 FELENA’S CANTINA</h2>
      <p>Classic Wild West XP slot. Match 3 saloon symbols to win XP.</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '2.5rem', margin: '2rem 0' }}>
        {reels.map((icon, i) => (
          <div key={i} className={styles.gameCard}>{icon}</div>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label style={{ color: '#0ff' }}>Wager: </label>
        <select
          className={styles.crtInput}
          value={wager}
          onChange={(e) => setWager(Number(e.target.value))}
          disabled={spinning}
        >
          {[25, 50, 100, 250].map((amt) => (
            <option key={amt} value={amt}>{amt} XP</option>
          ))}
        </select>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className={styles.crtButton}
        style={{ marginTop: '2rem' }}
      >
        🎰 SPIN
      </button>

      {message && (
        <div className={styles.successNote} style={{ marginTop: '1rem' }}>
          {message}
        </div>
      )}
    </div>
  );
}