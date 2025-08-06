import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import logXP from '@/utils/logXP';
import triggerXPBurst from '@/utils/triggerXPBurst';
import playSound from '@/utils/playSound';
import { format } from 'date-fns';

interface Quest {
  id: string;
  title: string;
  description: string;
  skill_type: string;
  audience: string;
  xp_reward: number;
  due_date: string;
  crate_reward?: string;
}

function QuestEnginePage() {
export default withGuardianGate(Page);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchQuests();
    fetchCompleted();
  }, []);

  const fetchQuests = async () => {
  try {
    const { data } = await supabase.from('xp_quests').select('*').order('due_date', { ascending: true });
  } catch (error) {
    console.error('❌ Supabase error in quest_engine.tsx', error);
  }
    setQuests(data || []);
  };

  const fetchCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase
      .from('xp_quest_log')
      .select('quest_id')
      .eq('user_id', user.id)
      .eq('season', 1);

    setCompleted(data?.map(q => q.quest_id) || []);
  };

  const handleClaim = async (quest: Quest) => {
    setLoading(true);

  try {
    await supabase.from('xp_quest_log').insert([
  } catch (error) {
    console.error('❌ Supabase error in quest_engine.tsx', error);
  }
      {
        user_id: userId,
        quest_id: quest.id,
        season: 1,
        claimed_at: new Date().toISOString(),
      },
    ]);

  try {
    await supabase.rpc('update_xp', {
  } catch (error) {
    console.error('❌ Supabase error in quest_engine.tsx', error);
  }
      user_id: userId,
      xp_delta: quest.xp_reward,
      reason: `Quest: ${quest.title}`,
    });

    await logXP('quest_claim', quest.xp_reward, `Completed: ${quest.title}`);
    triggerXPBurst({ amount: quest.xp_reward, label: quest.title });
    playSound('xp-rain');

    if (quest.crate_reward) {
  try {
    await supabase.from('xp_crates').insert({
  } catch (error) {
    console.error('❌ Supabase error in quest_engine.tsx', error);
  }
        user_id: userId,
        label: quest.crate_reward,
        xp_value: Math.round(quest.xp_reward / 2),
        source: 'quest',
        opened: false,
      });
    }

    setCompleted([...completed, quest.id]);
    setLoading(false);
  };

  const filtered = filter === 'all' ? quests : quests.filter(q => q.audience === filter);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🧠 QUEST ENGINE</h2>
      <p>Real-time XP quest editor + claim panel for all live tasks in the system.</p>

      <div style={{ marginTop: '1rem' }}>
        <label>🎯 Filter by audience: </label>
        <select
          className={styles.crtInput}
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="all">All</option>
          <option value="kids">Kids</option>
          <option value="public">Public</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div className={styles.shopGrid}>
        {filtered.map((q) => (
          <div key={q.id} className={styles.shopCard}>
            <h3>{q.title}</h3>
            <p>{q.description}</p>
            <p className="text-sm text-cyan-400">🎓 {q.skill_type} • {q.audience}</p>
            <p className="text-sm text-yellow-300">📅 Due: {format(new Date(q.due_date), 'MMMM d, yyyy')}</p>
            <p className="text-green-400 font-bold">+{q.xp_reward} XP</p>

            {completed.includes(q.id) ? (
              <p style={{ color: '#999' }}>✅ Already Claimed</p>
            ) : (
              <button
                className={styles.crtButton}
                onClick={() => handleClaim(q)}
                disabled={loading}
              >
                ✅ Claim XP
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}