import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP } from '@/utils/xpEngine';
import supabase from '@/utils/supabaseClient';

function XP_Crash() {
export default withGuardianGate(Page);
  const [xp, setXP] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [crashed, setCrashed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [wager, setWager] = useState(100);
  const [balance, setBalance] = useState(0);
  const [isVIP, setIsVIP] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp, role')
        .eq('id', user.id)
        .single();

      setXP(profile?.xp || 0);
      setIsVIP(profile?.role === 'admin' || profile?.role === 'developer' || (profile?.xp || 0) >= 5000);
    };

    init();
  }, []);

  useEffect(() => {
    if (!playing || crashed || cashedOut) return;
    const interval = setInterval(() => {
      const next = parseFloat((multiplier + 0.1).toFixed(1));
      if (Math.random() < 0.02 + multiplier / 50) {
        setCrashed(true);
        clearInterval(interval);
      } else {
        setMultiplier(next);
      }
    }, 300);
    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, [playing, multiplier, crashed, cashedOut]);

  const start = async () => {
    const allowed = await hasEnoughXP(wager);
    if (!allowed) return alert('Not enough XP');
    await updateXP(-wager);
    logXP('crash_wager', -wager, `Crash wager: ${wager} XP`);
    setPlaying(true);
    setMultiplier(1);
    setCrashed(false);
    setCashedOut(false);
  };

  const cashOut = async () => {
    if (crashed || cashedOut) return;
    const winnings = Math.floor(wager * multiplier);
    await updateXP(winnings);
    logXP('crash_win', winnings, `Cashed out at ${multiplier}x`);
    setCashedOut(true);
    setBalance(winnings);
  };

  if (!isVIP) {
    return (
      <div className={styles.crtScreen}>
        <h1>⛔ VIP ACCESS ONLY</h1>
        <p>You must be a High Roller (≥5000 XP) or dev/admin to access this mode.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1>💥 XP CRASH</h1>
      <p>Wager and watch the multiplier rise. Cash out before the system crashes.</p>

      <div style={{ fontSize: '2rem', margin: '1rem 0', color: crashed ? 'red' : 'lime' }}>
        {crashed ? '💥 CRASHED' : `${multiplier.toFixed(1)}x`}
      </div>

      {playing && !crashed && !cashedOut && (
        <button className={styles.crtButton} onClick={cashOut}>
          CASH OUT @ {multiplier.toFixed(1)}x
        </button>
      )}

      {!playing && (
        <>
          <input
            type="number"
            value={wager}
            onChange={(e) => setWager(parseInt(e.target.value))}
            className={styles.crtInput}
            placeholder="XP Wager"
          />
          <button className={styles.crtButton} onClick={start}>
            START
          </button>
        </>
      )}

      {cashedOut && (
        <div style={{ color: '#0f0' }}>✅ Cashed Out: +{balance} XP</div>
      )}
      {crashed && !cashedOut && (
        <div style={{ color: 'red' }}>❌ Lost {wager} XP</div>
      )}
    </div>
  );
}