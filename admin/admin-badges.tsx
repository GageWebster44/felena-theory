// pages/admin/admin-badges.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import withAdminGate from '@/components/withRoleGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

type ProfileRow = {
  id: string;
  alias: string | null;
  xp?: number | null;
};

type BadgeRow = {
  label: string;
};

function AdminBadges() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [selectedUser, setSelectedUser] = useState<ProfileRow | null>(null);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [newBadge, setNewBadge] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  // debounce input
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, alias, xp')
        .ilike('alias', `%${query}%`)
        .limit(25);
      if (error) {
        console.error('Supabase error in admin-badges search:', error);
        setResults([]);
      } else {
        setResults(data ?? []);
      }
      setLoading(false);
    }, 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadBadges = async (user: ProfileRow) => {
    setSelectedUser(user);
    const { data, error } = await supabase
      .from('user_badges')
      .select('label')
      .eq('user_id', user.id)
      .order('label', { ascending: true });

    if (error) {
      console.error('Supabase error in admin-badges loadBadges:', error);
      setBadges([]);
      return;
    }
    setBadges((data ?? []).map((d) => ({ label: d.label })));
  };

  const grantBadge = async () => {
    if (!selectedUser || !newBadge.trim()) return;
    setBusy(true);
    const label = newBadge.trim();

    // log intent to xp_log (non-blocking)
    try {
      await supabase.from('xp_log').insert({
        user_id: selectedUser.id,
        type: 'badge',
        reason: `Granted badge: ${label} (via admin)`,
        timestamp: new Date().toISOString(),
        season: 1,
        amount: 0,
      });
    } catch (err) {
      console.error('Supabase error in admin-badges.tsx (xp_log grant):', err);
    }

    // upsert badge
    try {
      await supabase.from('user_badges').upsert(
        {
          user_id: selectedUser.id,
          label,
          source: 'admin',
          timestamp: new Date().toISOString(),
        },
        { onConflict: 'user_id,label' }
      );
    } catch (err) {
      console.error('Supabase error in admin-badges.tsx (upsert badge):', err);
    }

    // refresh
    await loadBadges(selectedUser);
    setNewBadge('');
    setBusy(false);
  };

  const revokeBadge = async (label: string) => {
    if (!selectedUser) return;
    setBusy(true);

    // log
    try {
      await supabase.from('xp_log').insert({
        user_id: selectedUser.id,
        type: 'badge',
        reason: `Revoked badge: ${label}`,
        timestamp: new Date().toISOString(),
        season: 1,
        amount: 0,
      });
    } catch (err) {
      console.error('Supabase error in admin-badges.tsx (xp_log revoke):', err);
    }

    // delete
    try {
      await supabase
        .from('user_badges')
        .delete()
        .eq('user_id', selectedUser.id)
        .eq('label', label);
    } catch (err) {
      console.error('Supabase error in admin-badges.tsx (delete badge):', err);
    }

    // refresh
    await loadBadges(selectedUser);
    setBusy(false);
  };

  const resultHeader = useMemo(
    () =>
      results.length
        ? `Results (${results.length})`
        : query && !loading
        ? 'No matches'
        : 'Search by alias…',
    [results.length, query, loading]
  );

  return (
    <>
      <Head>
        <title>Felena Theory</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <div className={styles.crtFrame}>
        <h1 className={styles.crtTitle}>Admin Badge Control</h1>

        <div className={styles.crtMenu}>
          <input
            className={styles.crtInput}
            placeholder="Search alias…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading && <p className={styles.crtText}>Loading…</p>}

        <div className={styles.crtScrollBox}>
          <h2 className={styles.crtTitleSmall}>{resultHeader}</h2>
          <div className={styles.crtGrid}>
            {results.map((u) => (
              <div key={u.id} className={styles.crtCard}>
                <p>
                  <strong>@{u.alias ?? '—'}</strong> —{' '}
                  {Number(u.xp ?? 0).toLocaleString()} XP
                </p>
                <button
                  className={styles.crtButton}
                  onClick={() => loadBadges(u)}
                  disabled={busy}
                >
                  Manage Badges
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedUser && (
          <div className={styles.crtCard} style={{ marginTop: '1rem' }}>
            <h2 className={styles.crtTitleSmall}>
              Badge Management — @{selectedUser.alias ?? '—'}
            </h2>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              {badges.map((b) => {
                const slug = b.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '_')
                  .replace(/^_+|_+$/g, '');
                return (
                  <li key={slug}>
                    <div style={{ textAlign: 'center' }}>
                      {/* If you have public/images/badges/<slug>.png this will render it */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/badges/${slug}.png`}
                        alt={b.label}
                        width={64}
                        height={64}
                        style={{ display: 'block', margin: '0 auto 0.25rem' }}
                      />
                      <div style={{ fontSize: '0.8rem' }}>{b.label}</div>
                      <button
                        className={styles.crtButton}
                        onClick={() => revokeBadge(b.label)}
                        disabled={busy}
                        style={{ marginTop: '0.25rem' }}
                      >
                        Revoke
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div style={{ marginTop: '1rem' }}>
              <input
                className={styles.crtInput}
                placeholder="New badge label…"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
              />
              <button
                className={styles.crtButton}
                onClick={grantBadge}
                disabled={busy || !newBadge.trim()}
                style={{ marginLeft: '0.5rem' }}
              >
                Grant Badge
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default withAdminGate(AdminBadges);