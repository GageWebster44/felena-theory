import { useEffect, useState, useContext } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { UserXPContext } from './_app';
import HUDFrame from '@/components/HUDFrame';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '@/styles/crtLaunch.module.css';

function DAOVotePage() {
export default withGuardianGate(Page);
  const [proposals, setProposals] = useState<any[]>([]);
  const [votes, setVotes] = useState<Record<string, any[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const { userXP } = useContext(UserXPContext);
  const TIER_MIN_XP = 1000;

  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const load = async () => {
      const { data: props } = await supabase
        .from('dao_proposals')
        .select('*')
        .order('created_at', { ascending: false });
      setProposals(props || []);

  try {
    const { data: voteLogs } = await supabase.from('dao_votes').select('*');
  } catch (error) {
    console.error('❌ Supabase error in dao-vote.tsx', error);
  }
      const grouped: Record<string, any[]> = {};
      voteLogs?.forEach((v) => {
        grouped[v.proposal_id] = [...(grouped[v.proposal_id] || []), v];
      });
      setVotes(grouped);
    };
    load();
  }, []);

  const handleVote = async (proposalId: string, choice: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

  try {
    await supabase.from('dao_votes').insert({
  } catch (error) {
    console.error('❌ Supabase error in dao-vote.tsx', error);
  }
      user_id: user.id,
      proposal_id: proposalId,
      choice,
    });

    setMessage(`✅ Vote recorded for ${choice}`);
    setSelected(null);
  };

  const formatVotes = (logs: any[]) => {
    const tally: Record<string, number> = {};
    logs?.forEach((v) => {
      tally[v.choice] = (tally[v.choice] || 0) + 1;
    });
    return Object.entries(tally).map(([name, value]) => ({ name, value }));
  };

  if (userXP < TIER_MIN_XP) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <HUDFrame>
        <div style={{ padding: '3rem', fontFamily: 'Orbitron', color: '#ff4444' }}>
          <h1>🛑 ACCESS DENIED</h1>
          <p>You need at least 1,000 XP to vote in DAO proposals.</p>
        </div>
      </HUDFrame>
    );
  }

  return (
    <HUDFrame>
      <div className={styles.crtScreen}>
        <h1>📊 DAO PROPOSAL VOTE PANEL</h1>
        <p>Tier 2+ operators may vote once per proposal. Votes are immutable.</p>

        {message && <p style={{ color: '#0f0' }}>{message}</p>}

        {proposals.map((p) => (
          <div key={p.id} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #0ff' }}>
            <h2 style={{ color: '#00ffff' }}>#{p.id}: {p.title}</h2>
            <p>{p.description}</p>
            <div style={{ marginTop: '0.5rem' }}>
              {selected === p.id ? (
                <>
                  <button className={styles.crtButton} onClick={() => handleVote(p.id, 'YES')}>✅ YES</button>
                  <button className={styles.crtButton} onClick={() => handleVote(p.id, 'NO')}>❌ NO</button>
                </>
              ) : (
                <button className={styles.crtButton} onClick={() => setSelected(p.id)}>Cast Vote</button>
              )}
            </div>

            {/* Chart */}
            <div style={{ height: '200px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatVotes(votes[p.id] || [])}>
                  <XAxis dataKey="name" stroke="#0ff" />
                  <YAxis stroke="#0ff" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00ff99" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </HUDFrame>
  );
}