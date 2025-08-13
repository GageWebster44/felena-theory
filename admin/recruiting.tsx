import { useEffect, useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import supabase from '@/utils/supabaseClient';
import withRoleGuard from '@/utils/WithRoleGuard';
import { saveAs } from 'file-saver';

interface Candidate {
  id: string;
  alias: string;
  xp: number;
  engines: number;
  referrals: number;
  status: string;
}

function RecruitingPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userRole, setUserRole] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [sortKey, setSortKey] = useState<'xp' | 'engines' | 'referrals'>('xp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const load = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setUserRole(profile?.role || '');

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, alias, xp, devCandidateStatus');

      if (!profiles) return;

      const enhanced = await Promise.all(
        profiles.map(async (p) => {
          const { data: engines } = await supabase
            .from('unlocked_engines')
            .select('id')
            .eq('user_id', p.id);

          const { data: referrals } = await supabase
            .from('referrals')
            .select('id')
            .eq('referrer_id', p.id);

          return {
            id: p.id,
            alias: p.alias,
            xp: p.xp,
            engines: engines?.length || 0,
            referrals: referrals?.length || 0,
            status: p.devCandidateStatus || 'none',
          };
        })
      );

      const filtered = enhanced.filter((u) => u.xp >= 100000);
      setCandidates(filtered);
    };
    load();
  }, []);

  const promote = async (id: string) => {
    await supabase
      .from('user_profiles')
      .update({ devCandidateStatus: 'approved' })
      .eq('id', id);

    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
    );

  try {
    await supabase.from('email_queue').insert({
  } catch (error) {
    console.error('❌ Supabase error in recruiting.tsx', error);
  }
      to: id,
      subject: '📈 Promotion Approved!',
      body: 'You have been promoted inside Felena Theory. Welcome to the dev path.',
    });
  };

  const exportCSV = () => {
    const rows = [
      ['Alias', 'XP', 'Engines', 'Referrals', 'Status'],
      ...candidates.map((c) => [c.alias, c.xp, c.engines, c.referrals, c.status]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'dev_candidates.csv');
  };

  const applyFilter = (c: Candidate) => {
    if (filter === 'approved') return c.status === 'approved';
    if (filter === 'pending') return c.status !== 'approved';
    return true;
  };

  const applySort = (list: Candidate[]) => {
    return [...list].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  };

  const filteredCandidates = applySort(candidates.filter(applyFilter));

  const avgXP =
    candidates.reduce((sum, c) => sum + c.xp, 0) / candidates.length || 0;
  const avgReferrals =
    candidates.reduce((sum, c) => sum + c.referrals, 0) / candidates.length || 0;
  const engineRate =
    Math.round(
      (candidates.filter((c) => c.engines > 0).length / candidates.length) * 100
    ) || 0;
  const conversionRate =
    Math.round(
      (candidates.filter((c) => c.status === 'approved').length /
        candidates.length) *
        100
    ) || 0;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📡 DEV RECRUITING TRACKER</h2>
      <p>Operators who reached 100,000+ XP and are eligible for internal promotion.</p>

      <button onClick={exportCSV} className={styles.crtButton} style={{ margin: '1rem 0' }}>
        📤 Export Candidates as CSV
      </button>

      <div style={{ marginTop: '1rem' }}>
        <label>📂 Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="approved">Approved Only</option>
          <option value="pending">Pending Only</option>
        </select>

        <label style={{ marginLeft: '1rem' }}>🔢 Sort by:</label>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)}>
          <option value="xp">XP</option>
          <option value="engines">Engines</option>
          <option value="referrals">Referrals</option>
        </select>
        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
        </button>
      </div>

      <table style={{ width: '100%', marginTop: '2rem', borderBottom: '1px solid #0ff' }}>
        <thead>
          <tr>
            <th>🆔 Alias</th>
            <th>📊 XP</th>
            <th>⚙️ Engines</th>
            <th>🧲 Referrals</th>
            <th>Status</th>
            {userRole === 'admin' || userRole === 'dev' ? <th>📈 Promote</th> : null}
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map((c) => (
            <tr key={c.id}>
              <td>{c.alias}</td>
              <td>{c.xp.toLocaleString()}</td>
              <td>{c.engines}</td>
              <td>{c.referrals}</td>
              <td>
                {c.status === 'approved' ? (
                  <span style={{ color: '#0f0' }}>✅ Approved</span>
                ) : (
                  <span style={{ color: '#0ff' }}>⏳ Pending</span>
                )}
              </td>
              {userRole === 'admin' || userRole === 'dev' ? (
                <td>
                  {c.status !== 'approved' && (
                    <button
                      className={styles.crtButton}
                      onClick={() => promote(c.id)}
                    >
                      Promote
                    </button>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '3rem' }}>
        <h3>📊 Promotion Funnel Analytics</h3>
        <p>👥 Total Candidates: {candidates.length}</p>
        <p>✅ Approved: {candidates.filter((c) => c.status === 'approved').length}</p>
        <p>⏳ Pending: {candidates.filter((c) => c.status !== 'approved').length}</p>
        <p>🧠 Avg XP: {Math.round(avgXP).toLocaleString()} XP</p>
        <p>🧲 Avg Referrals: {avgReferrals.toFixed(1)}</p>
        <p>⚙️ Engine Unlock Rate: {engineRate}%</p>
        <p>📈 Conversion Rate: {conversionRate}%</p>
      </div>
    </div>
  );
}

export default withRoleGuard(RecruitingPage, ['admin', 'dev']);