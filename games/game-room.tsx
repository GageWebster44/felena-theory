import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

const gameList = [
  // 🎰 Slot Games
  { name: 'Sweet XP Bonanza', route: '/games/sweet', type: 'slots', vip: false, preview: '/images/slots/sweet.gif' },
  { name: 'Gates of XPLympus', route: '/games/gates', type: 'slots', vip: false, preview: '/images/slots/gates.gif' },
  { name: 'FireLink Chain', route: '/games/firelink', type: 'slots', vip: false, preview: '/images/slots/firelink.gif' },
  { name: 'Buffalo Rush', route: '/games/buffalo', type: 'slots', vip: false, preview: '/images/slots/buffalo.gif' },
  { name: "Felena's Cantina", route: '/games/cantina', type: 'slots', vip: true, preview: '/images/slots/cantina.gif' },
  { name: 'XP Wheel', route: '/games/wheel', type: 'slots', vip: true, preview: '/images/slots/wheel.gif' },

  // 🎲 Table Games
  { name: 'XP Dice', route: '/games/dice', type: 'table', vip: true, preview: '/images/table/dice.gif' },
  { name: 'XP Cards', route: '/games/cards', type: 'table', vip: true, preview: '/images/table/cards.gif' },
  { name: 'XP Crash', route: '/games/crash', type: 'table', vip: true, preview: '/images/table/crash.gif' },
  { name: 'Heads or Tails', route: '/games/heads-tails', type: 'table', vip: false, preview: '/images/table/coin.gif' },
  { name: 'XP Roulette', route: '/games/roulette', type: 'table', vip: true, preview: '/images/table/roulette.gif' },

  // 🏈 Sportsbook
  { name: 'XP Parlay', route: '/games/parlay', type: 'sports', vip: false, preview: '/images/sports/parlay.gif' },
  { name: 'XP Sportsbook', route: '/games/sports', type: 'sports', vip: false, preview: '/images/sports/sports.gif' },
];

function GameRoom() {
export default withGuardianGate(Page);
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState('');
  const [credentials, setCredentials] = useState('');
  const [xpMap, setXPMap] = useState<Record<string, number>>({});
  const [winStats, setWinStats] = useState<Record<string, { topMin: number; winRate: number }>>({});

  useEffect(() => {
    const init = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, employee_id')
        .eq('id', user.user.id)
        .single();

      setUserRole(profile?.role || '');
      setCredentials(profile?.employee_id || '');

  try {
    const { data: stats } = await supabase.from('game_stats').select('*');
  } catch (error) {
    console.error('❌ Supabase error in game-room.tsx', error);
  }
      const mapped: Record<string, { topMin: number; winRate: number }> = {};
      stats?.forEach(s => {
        mapped[s.route] = { topMin: s.top_win, winRate: s.win_rate };
      });
      setWinStats(mapped);

  try {
    const { data: wallet } = await supabase.from('xp_wallet').select('xp').eq('user_id', user.user.id).single();
  } catch (error) {
    console.error('❌ Supabase error in game-room.tsx', error);
  }
      setXPMap({ current: wallet?.xp || 0 });
    };
    init();
  }, []);

  const filteredGames = filter === 'all' ? gameList : gameList.filter(g => g.type === filter);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🎮 GAME ROOM - XP+</h2>
      <p>Select a game to play. XP required per game may vary. Some require VIP status.</p>

      <div className={styles.filterRow}>
        {['all', 'slots', 'table', 'sports'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={styles.crtButton}
            aria-label={`Filter to show only ${type} games`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.gameList}>
        {filteredGames.map(game => {
          const isVIP = game.vip;
          const isAllowed =
            userRole === 'admin' ||
            userRole === 'developer' ||
            (credentials?.startsWith('EMP-') && credentials.length > 6) ||
            xpMap.current >= 5000;

          return (
            <div key={game.route} className={styles.gameCard}>
              <img src={game.preview} alt={game.name} className={styles.gamePreview} />
              <h3 style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{game.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                Win Rate: {winStats[game.route]?.winRate?.toFixed(1) || 0}%<br />
                Top Win: {winStats[game.route]?.topMin || 0} XP
              </p>
              {!isAllowed && isVIP ? (
                <button className={styles.crtButton} disabled aria-label="VIP access required">
                  🔒 VIP ONLY
                </button>
              ) : (
                <a
                  href={game.route}
                  className={styles.crtButton}
                  aria-label={`Launch ${game.name}`}
                  title={`Play ${game.name}`}
                >
                  ▶️ Play
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}