// pages/engines/quest_engine.tsx
import Head from 'next/head';
import { useEffect, useState } from 'react';

import withGuardianGate from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';

import styles from '@/styles/crtLaunch.module.css';

// Optional helpers (keep if you have these utilities)
import { logXP } from '@/utils/logXP'; // no-op if you decide to remove
import triggerXPBurst from '@/utils/triggerXPBurst';
import playSound from '@/utils/playSound';
import { format } from 'date-fns';

type Audience = 'kids' | 'public' | 'operators' | 'all';

interface Quest {
  id: string;
  title: string;
  description: string;
  skill_type: string;
  audience: Audience | string;
  xp_reward: number;
  due_date: string | null;
  crate_reward?: string | null;
}

function QuestEnginePage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Audience | 'all'>('all');
  const [userId, setUserId] = useState<string>('');

  // Initial load: who am I + quests + what I've completed
  useEffect(() => {
    (async () => {
      await fetchUser();
      await fetchQuests();
      await fetchCompleted();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) setUserId(data.user.id);
  }

  async function fetchQuests() {
    try {
      const { data, error } = await supabase
        .from('xp_quests')
        .select<Quest>('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      setQuests(data || []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✖ Supabase error in quest_engine.tsx (fetchQuests):', error);
    }
  }

  async function fetchCompleted() {
    try {
      if (!userId) {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user?.id) setUserId(u.user.id);
      }
      const uid = userId || (await supabase.auth.getUser()).data?.user?.id || '';
      if (!uid) return;

      const { data, error } = await supabase
        .from('xp_quest_log')
        .select('quest_id')
        .eq('user_id', uid);

      if (error) throw error;

      setCompleted((data || []).map((r: any) => r.quest_id));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✖ Supabase error in quest_engine.tsx (fetchCompleted):', error);
    }
  }

  async function handleClaim(q: Quest) {
    if (!userId) return;
    if (completed.includes(q.id)) return;

    setLoading(true);
    try {
      // 1) Write quest log
      const { error: logErr } = await supabase.from('xp_quest_log').insert({
        user_id: userId,
        quest_id: q.id,
        season: 1,
        claimed_at: new Date().toISOString(),
      });
      if (logErr) throw logErr;

      // 2) Update XP (RPC preferred so DB owns validation)
      const reason = `quest_claim: ${q.title}`;
      const { error: rpcErr } = await supabase.rpc('update_xp', {
        uid: userId,
        xp_delta: q.xp_reward,
        reason,
      });
      if (rpcErr) throw rpcErr;

      // Optional UI niceties
      try {
        await logXP?.('quest_claim', q.xp_reward, `Completed: ${q.title}`);
      } catch {
        /* ignore if helper not present */
      }
      triggerXPBurst?.({ amount: q.xp_reward, label: q.title });
      playSound?.('xp-rain');

      // 3) Optional crate reward
      if (q.crate_reward) {
        const { error: crateErr } = await supabase.from('xp_crates').insert({
          user_id: userId,
          label: q.crate_reward,
          xp_value: Math.round(q.xp_reward / 2),
          source: 'quest',
          opened: false,
        });
        if (crateErr) throw crateErr;
      }

      // Update local state
      setCompleted((prev) => [...new Set([...prev, q.id])]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('✖ Supabase error in quest_engine.tsx (handleClaim):', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    filter === 'all'
      ? quests
      : quests.filter((q) => String(q.audience).toLowerCase() === filter);

  return (
    <>
      <Head>
        <title>Felena Theory</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <div className={styles.crtScreen}>
        <h2>🎯 QUEST ENGINE</h2>
        <p>Real‑time XP quest editor + claim panel for all live tasks in the system.</p>

        <div style={{ marginTop: '1rem' }}>
          <label> Filter by audience: </label>
          <select
            className={styles.crtInput}
            onChange={(e) => setFilter(e.target.value as Audience | 'all')}
            value={filter}
          >
            <option value="all">All</option>
            <option value="kids">Kids</option>
            <option value="public">Public</option>
            <option value="operators">Operators</option>
          </select>
        </div>

        <div className="grid" style={{ marginTop: '1rem' }}>
          {filtered.map((q) => {
            const isClaimed = completed.includes(q.id);
            const due =
              q.due_date ? format(new Date(q.due_date), 'MMM d, yyyy') : '—';

            return (
              <div key={q.id} className={styles.shopCard}>
                <h3>{q.title}</h3>
                <p className="text-sm text-cyan-400">
                  {q.skill_type} · {String(q.audience)}
                </p>
                <p className="text-xs text-yellow-300">
                  Due: <strong>{due}</strong>
                </p>
                <p className="text-green-400 font-bold">{q.xp_reward} XP</p>

                {isClaimed ? (
                  <p style={{ color: '#999', marginTop: '.5rem' }}>✔ Already Claimed</p>
                ) : (
                  <button
                    className={styles.crtButton}
                    onClick={() => handleClaim(q)}
                    disabled={loading}
                    style={{ marginTop: '.5rem' }}
                  >
                    ✔ Claim XP
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default withGuardianGate(QuestEnginePage);