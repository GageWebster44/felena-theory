import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';

function AdminBadges() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [badges, setBadges] = useState<string[]>([]);
  const [newBadge, setNewBadge] = useState('');

  useEffect(() => {
    if (query.length < 3) return;
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, alias, xp')
        .ilike('alias', `%${query}%`);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, [query]);

  const loadBadges = async (user_id: string) => {
    setSelected(user_id);
    const { data } = await supabase
      .from('user_badges')
      .select('label')
      .eq('user_id', user_id);
    setBadges(data?.map(b => b.label) || []);
  };

  const grantBadge = async () => {
    if (!selected || !newBadge.trim()) return;

    const badgeRef = Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g. A7421

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-badges.tsx', error);
  }
      user_id: selected,
      xp: 0,
      type: 'badge',
      reason: `Granted badge: ${newBadge.trim()} (via system grant — ref #${badgeRef})`,
      timestamp: new Date().toISOString()
    });

  try {
    await supabase.from('user_badges').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-badges.tsx', error);
  }
      user_id: selected,
      label: newBadge.trim(),
      source: 'admin',
      timestamp: new Date().toISOString()
    });

    setNewBadge('');
    loadBadges(selected);
  };

  const revokeBadge = async (label: string) => {
  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-badges.tsx', error);
  }
      user_id: selected,
      xp: 0,
      type: 'badge',
      reason: `Revoked badge: ${label}`,
      timestamp: new Date().toISOString()
    });

  try {
    await supabase.from('user_badges')
  } catch (error) {
    console.error('❌ Supabase error in admin-badges.tsx', error);
  }
      .delete()
      .eq('user_id', selected)
      .eq('label', label);

    loadBadges(selected);
  };

  return (
    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>🎯 Admin Badge Control</h1>

      <div className={styles.crtMenu}>
        <input
          className={styles.crtInput}
          placeholder="Search alias..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {results.map((u, i) => (
        <div key={i} className={styles.crtCard}>
          <p><strong>{u.alias}</strong> — {u.xp.toLocaleString()} XP</p>
          <button className={styles.crtButton} onClick={() => loadBadges(u.id)}>
            🎟 Manage Badges
          </button>
        </div>
      ))}

      {selected && (
        <div className={styles.crtCard}>
          <h2>🧾 Badge Management</h2>
          <ul style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            listStyle: 'none',
            padding: 0,
            marginBottom: '1rem'
          }}>
            {badges.map((b, i) => {
              const slug = b.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
              return (
                <li key={i} style={{ textAlign: 'center' }}>
                  <img src={`/badges/${slug}.png`} alt={b} style={{ width: '48px', height: '48px' }} />
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{b}</div>
                  <button className={styles.crtButton} onClick={() => revokeBadge(b)}>
                    ❌ Revoke
                  </button>
                </li>
              );
            })}
          </ul>

          <input
            className={styles.crtInput}
            placeholder="New badge label..."
            value={newBadge}
            onChange={e => setNewBadge(e.target.value)}
          />
          <button className={styles.crtButton} onClick={grantBadge}>
            ➕ Grant Badge
          </button>
        </div>
      )}
    </div>
  );
}

export default withAdminGate(AdminBadges);