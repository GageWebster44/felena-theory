import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { hasEnoughXP, updateXP, logXP, triggerCrateDrop } from '@/utils/xpEngine';
import styles from '@/styles/crtLaunch.module.css';
import { motion } from 'framer-motion';
import supabase from '@/utils/supabaseClient';

const gatesSymbols = ['⚡', '💎', '🔥', '🍇', '💰', '👑'];
const gatesPayouts = {
  '⚡': 2,
  '💎': 4,
  '🔥': 6,
  '🍇': 8,
  '💰': 10,
  '👑': 20,
};

const denominations = [10, 25, 50, 100];

function GatesXP() {
export default withGuardianGate(Page);
  const [grid, setGrid] = useState<string[][]>(generateGrid());
  const [message, setMessage] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [wagerXP, setWagerXP] = useState(25);
  const [userXP, setUserXP] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [isVIP, setIsVIP] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp, role')
        .eq('id', user.user.id)
        .single();
      setUserXP(profile?.xp || 0);
      setUserRole(profile?.role || '');
      setIsVIP(profile?.xp >= 5000);
    };
    loadProfile();
  }, []);

  function generateGrid(): string[][] {
    return Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () => gatesSymbols[Math.floor(Math.random() * gatesSymbols.length)])
    );
  }

  function findTopSymbol(grid: string[][]): { symbol: string; count: number } | null {
    const flat = grid.flat();
    const counts: Record<string, number> = {};
    flat.forEach((s) => (counts[s] = (counts[s] || 0) + 1));
    const top = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a));
    return { symbol: top[0], count: top[1] };
  }

  const handleSpin = async () => {
    const allowed = await hasEnoughXP(wagerXP);
    if (!allowed) return setMessage('❌ Not enough XP to spin.');

    setSpinning(true);
    await updateXP(-wagerXP);
    logXP('gates_spin', -wagerXP, `Gates spin for ${wagerXP} XP`);
    setMessage('🎰 Spinning...');
    const newGrid = generateGrid();
    setGrid(newGrid);

    setTimeout(async () => {
      const top = findTopSymbol(newGrid);
      if (top && top.count >= 5) {
        const multiplier = gatesPayouts[top.symbol] || 1;
        const payout = wagerXP * multiplier;
        await updateXP(payout);
        logXP('gates_win', payout, `Matched ${top.symbol} x${top.count} – Earned ${payout} XP`);
        setMessage(`💥 JACKPOT! ${top.symbol} x${top.count} = ${payout} XP`);
        if (payout >= 250) await triggerCrateDrop('gates');
      } else {
        setMessage('❌ No win. Try again.');
        playSound('deny');
      }
      setSpinning(false);
    }, 1200);
  };

  if (userRole !== 'admin' && userRole !== 'developer' && !isVIP) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h2>VIP ONLY</h2>
        <p>You must have at least 5000 XP to play Gates of XPlymupus.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1>⚡ Gates of XPlymupus</h1>
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
        <label style={{ color: '#0ff' }}>Wager: </label>
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
        {spinning ? 'SPINNING...' : `SPIN (${wagerXP} XP)`}
      </motion.button>

      <p style={{ marginTop: '1rem', color: '#0ff' }}>{message}</p>
    </div>
  );
}