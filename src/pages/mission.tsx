import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import supabase from '@/utils/supabaseClient';
import logXP from '@/utils/logXP';
import triggerXPBurst from '@/utils/triggerXPBurst';
import playSound from '@/utils/playSound';

interface Mission {
  id: string;
  name: string;
  description: string;
  xp: number;
  type: 'daily' | 'weekly';
  claimedAt?: string;
}

const missions: Mission[] = [
  { id: 'login', name: 'Daily Login', description: 'Check in to earn XP.', xp: 25, type: 'daily' },
  { id: 'social', name: 'Weekly Share', description: 'Refer a friend or post a share.', xp: 100, type: 'weekly' },
  { id: 'streak', name: '3-Day Streak', description: 'Claim 3 days in a row.', xp: 250, type: 'daily' },
];

function MissionsPage() {
export default withGuardianGate(Page);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  useEffect(() => {
    const loadClaims = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user) return;
      setUserId(user.user.id);

      const { data } = await supabase
        .from('xp_history')
        .select('type, created_at')
        .eq('user_id', user.user.id)
        .like('type', 'mission_%');

      if (data) {
        const claimedMissions = data.map(log => log.type.replace('mission_', ''));
        setClaimed(claimedMissions);
      }
    };

    loadClaims();
  }, []);

  const resetTime = (type: 'daily' | 'weekly') => {
    const now = new Date();
    const reset = new Date();
    if (type === 'daily') {
      reset.setUTCHours(24, 0, 0, 0);
    } else {
      const daysUntilNextMonday = ((1 + 7 - now.getUTCDay()) % 7) || 7;
      reset.setUTCDate(reset.getUTCDate() + daysUntilNextMonday);
      reset.setUTCHours(0, 0, 0, 0);
    }
    return Math.max(0, reset.getTime() - now.getTime());
  };

  const formatCountdown = (ms: number) => {
    const sec = Math.floor(ms / 1000) % 60;
    const min = Math.floor(ms / 1000 / 60) % 60;
    const hrs = Math.floor(ms / 1000 / 60 / 60) % 24;
    const days = Math.floor(ms / 1000 / 60 / 60 / 24);
    return `${days > 0 ? days + 'd ' : ''}${hrs}h ${min}m ${sec}s`;
  };

  const handleClaim = async (mission: Mission) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in mission.tsx', error);
  }
      user_id: user.id,
      type: `mission_${mission.id}`,
      amount: mission.xp,
      description: `${mission.name} mission claimed`
    });

    await logXP(`mission_${mission.id}`, mission.xp, mission.name);
    triggerXPBurst({ amount: mission.xp, label: mission.name });
    playSound('xp-rain');
    setClaimed([...claimed, mission.id]);

    // 🧬 Add Crate Drop for weekly missions
    if (mission.type === 'weekly') {
  try {
    await supabase.from('xp_crates').insert({
  } catch (error) {
    console.error('❌ Supabase error in mission.tsx', error);
  }
        user_id: user.id,
        label: `Weekly Mission Bonus`,
        xp_value: 100,
        source: 'mission',
        opened: false,
      });
    }

    setLoading(false);
  };

  return (
    <div className={styles.crtScreen}>
      <h2>📋 MISSION CONTROL</h2>
      <p>Claimable XP tasks. Resets daily or weekly. Track your streaks and unlocks.</p>

      {missions.map((mission) => {
        const isClaimed = claimed.includes(mission.id);
        const timeLeft = resetTime(mission.type);

        return (
          <div key={mission.id} className={styles.shopItem}>
            <div className={styles.shopItemLabel}>
              <strong>{mission.name}</strong> — {mission.description}
            </div>
            <p style={{ color: '#0f0' }}>{mission.xp} XP • {mission.type.toUpperCase()}</p>
            <button
              className={styles.crtButton}
              disabled={isClaimed || loading}
              onClick={() => handleClaim(mission)}
            >
              {isClaimed ? `⏳ Reset in ${formatCountdown(timeLeft)}` : '✅ CLAIM XP'}
            </button>
          </div>
        );
      })}
    </div>
  );
}