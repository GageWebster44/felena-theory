import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useSession } from '@supabase/auth-helpers-react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { GuardianGate } from '@/components/GuardianGate';
import { format } from 'date-fns';

function QuestsPage() {
export default withGuardianGate(Page);
  const session = useSession();
  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuests();
    fetchCompleted();
  }, []);

  const fetchQuests = async () => {
    const { data, error } = await supabase.from('xp_quests').select('*').eq('audience', 'kids').order('difficulty');
    if (!error) setQuests(data);
  };

  const fetchCompleted = async () => {
    const { data } = await supabase
      .from('xp_quest_log')
      .select('quest_id')
      .eq('user_id', session?.user?.id)
      .eq('season', 1);
    if (data) setCompleted(data.map((q) => q.quest_id));
  };

  const handleClaim = async (quest: any) => {
    if (completed.includes(quest.id)) return;
  try {
    await supabase.from('xp_quest_log').insert([
  } catch (error) {
    console.error('❌ Supabase error in quests.tsx', error);
  }
      {
        user_id: session.user.id,
        quest_id: quest.id,
        season: 1,
        claimed_at: new Date().toISOString(),
      },
    ]);
  try {
    await supabase.rpc('update_xp', {
  } catch (error) {
    console.error('❌ Supabase error in quests.tsx', error);
  }
      user_id: session.user.id,
      xp_delta: quest.xp_reward,
      reason: `Completed quest: ${quest.title}`,
    });
    setCompleted((prev) => [...prev, quest.id]);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <GuardianGate>
      <div className={styles.crtScreen}>
        <h1>🎓 XP Quests: Learn & Earn</h1>
        <p>Complete fun educational missions to earn XP that unlocks your future!</p>

        <div className={styles.shopGrid}>
          {quests.map((quest) => (
            <div className={styles.shopCard} key={quest.id}>
              <h3>{quest.title}</h3>
              <p className={styles.shopDescription}>{quest.description}</p>
              <p>🎯 XP: {quest.xp_reward}</p>
              <p>🧠 Skill: {quest.skill_type}</p>
              <p>📅 Due: {format(new Date(quest.due_date), 'MMMM d, yyyy')}</p>

              {completed.includes(quest.id) ? (
                <button className={styles.crtButton + ' ' + styles.crtButtonSuccess} disabled>
                  ✅ Completed
                </button>
              ) : (
                <button className={styles.crtButton} onClick={() => handleClaim(quest)}>
                  Claim XP
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#aaa' }}>
          <p>📚 These quests are stage-specific learning missions tied to your XP Kids progress.</p>
          <p>Each quest reinforces real-world skills — and earns you XP inside a guardian-secured system.</p>
          <p>All rewards are direct. No gambling. No randomness. Your learning is your unlock path.</p>
        </div>
      </div>
    </GuardianGate>
  );
}