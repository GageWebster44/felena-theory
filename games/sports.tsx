import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { hasEnoughXP, updateXP, logXP } from '@/utils/xpEngine';
import supabase from '@/utils/supabaseClient';

const mockGames = [
  { id: 1, name: 'Raiders vs Titans', favorite: 'Raiders' },
  { id: 2, name: 'Steelers vs Jets', favorite: 'Steelers' },
  { id: 3, name: 'Bulls vs Lakers', favorite: 'Lakers' }
];

function XPSportsbook() {
export default withGuardianGate(Page);
  const [bets, setBets] = useState<{ [key: number]: string }>({});
  const [wager, setWager] = useState(50);
  const [message, setMessage] = useState('');
  const [xp, setXP] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const { data: wallet } = await supabase
        .from('xp_wallet')
        .select('xp')
        .eq('user_id', user.id)
        .single();

      setUserRole(profile?.role || '');
      setXP(wallet?.xp || 0);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const isVIP = userRole === 'admin' || userRole === 'developer' || xp >= 5000;

  const handleBet = (gameId: number, team: string) => {
    setBets(prev => ({ ...prev, [gameId]: team }));
  };

  const submitBets = async () => {
    const totalWager = Object.keys(bets).length * wager;
    const allowed = await hasEnoughXP(totalWager);
    if (!allowed) return alert('Not enough XP');

    await updateXP(-totalWager);
    logXP('sports_bet', -totalWager, 'Submitted Sportsbook picks');

    let totalWon = 0;
    mockGames.forEach((g) => {
      if (bets[g.id] === g.favorite) {
        const win = wager * 2;
        totalWon += win;
        logXP('sports_win', win, `Won on ${g.name}`);
      }
    });

    if (totalWon > 0) {
      await updateXP(totalWon);
      setMessage(`✅ You won a total of ${totalWon} XP!`);
    } else {
      setMessage('❌ All picks lost. Better luck next time.');
    }
  };

  if (loading) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h2>Loading access...</h2>
      </div>
    );
  }

  if (!isVIP) {
    return (
      <div className={styles.crtScreen}>
        <h2 className="text-red-500">🚫 VIP ACCESS REQUIRED</h2>
        <p>You need at least 5,000 XP or dev/admin credentials to use the Sportsbook.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1>🏈 XP SPORTSBOOK</h1>
      <p>Pick a team for each matchup. Win 2x XP per correct bet.</p>

      {mockGames.map((g) => (
        <div key={g.id} style={{ marginBottom: '1rem' }}>
          <p>{g.name}</p>
          <button
            className={styles.crtButton}
            onClick={() => handleBet(g.id, g.name.split(' vs ')[0])}
          >
            {g.name.split(' vs ')[0]}
          </button>
          <button
            className={styles.crtButton}
            onClick={() => handleBet(g.id, g.name.split(' vs ')[1])}
          >
            {g.name.split(' vs ')[1]}
          </button>
        </div>
      ))}

      <input
        className={styles.crtInput}
        type="number"
        value={wager}
        onChange={(e) => setWager(Number(e.target.value))}
      />

      <button
        onClick={submitBets}
        className={styles.crtButton}
        disabled={Object.keys(bets).length !== mockGames.length}
      >
        SUBMIT PICKS
      </button>

      {message && (
        <p style={{ marginTop: '1rem', color: '#0f0' }}>{message}</p>
      )}
    </div>
  );
}