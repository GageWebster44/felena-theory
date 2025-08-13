// pages/badges.tsx
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import withGuardianGate from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

import supabase from '@/utils/supabaseClient';
import badgeList from '@/data/badgeList'; // [{ label: string, desc?: string }...]

type HolderMap = Record<string, number>;

type ProfileRow = {
  id: string;
  role: string | null;
};

function BadgesPage() {
  const [holders, setHolders] = useState<HolderMap>({});
  const [role, setRole] = useState<string>('public');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);

        // who am I? (for admin actions)
        const { data: ures } = await supabase.auth.getUser();
        const uid = ures.user?.id;
        if (uid) {
          const { data: prof } = await supabase
            .from<ProfileRow>('user_profiles')
            .select('id, role')
            .eq('id', uid)
            .single();
          if (prof?.role) setRole(prof.role);
        }

        // count holders per badge
        const { data, error } = await supabase
          .from('user_badges')
          .select('label');
        if (error) throw error;

        const map: HolderMap = {};
        (data ?? []).forEach((row: { label: string }) => {
          map[row.label] = (map[row.label] ?? 0) + 1;
        });
        setHolders(map);
      } catch (e: any) {
        console.error('badges.tsx load error', e);
        setErr(e?.message ?? 'Failed to load badges');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return badgeList;
    return badgeList.filter(b =>
      [b.label, b.desc ?? ''].join(' ').toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <Head>
        <title>Felena Theory — Badges</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <div className={styles.crtScreen}>
        <h1 className={styles.crtTitle}>🏅 All Available Badges</h1>

        <div className={styles.crtMenu} style={{ marginTop: '0.75rem' }}>
          <input
            className={styles.crtInput}
            placeholder="Filter badges…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 420 }}
          />
          <span className={styles.crtText} style={{ marginLeft: '1rem' }}>
            Showing {filtered.length} / {badgeList.length}
          </span>
        </div>

        {loading && (
          <div className={styles.crtText} style={{ marginTop: '1rem' }}>
            Loading badge index…
          </div>
        )}

        {err && (
          <div
            className={styles.crtCard}
            style={{ marginTop: '1rem', border: '1px solid #ff5555' }}
          >
            <p className={styles.crtText} style={{ color: '#ff8888' }}>
              ⚠️ {err}
            </p>
          </div>
        )}

        {!loading && !err && (
          <div className={styles.crtGridResponsive} style={{ marginTop: '1rem' }}>
            {filtered.map((badge) => {
              const slug = badge.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_|_$/g, '');
              const count = holders[badge.label] ?? 0;

              return (
                <div key={badge.label} className={styles.crtCard}>
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={`/badges/${slug}.png`}
                      alt={badge.label}
                      style={{ width: 64, height: 64 }}
                    />
                  </div>
                  <h3
                    className={styles.crtText}
                    style={{ fontWeight: 600, marginTop: '0.5rem' }}
                  >
                    {badge.label}
                  </h3>
                  {badge.desc && (
                    <p className={styles.crtText} style={{ opacity: 0.9 }}>
                      {badge.desc}
                    </p>
                  )}
                  <p className={styles.crtText} style={{ marginTop: '0.5rem' }}>
                    Held by <strong>{count}</strong> user{count === 1 ? '' : 's'}
                  </p>

                  {role === 'admin' && (
                    <div className={styles.crtMenu} style={{ marginTop: '0.75rem' }}>
                      <Link
                        href={{ pathname: '/admin/badges/grant', query: { label: badge.label } }}
                        className={styles.crtButton}
                      >
                        ➕ Grant
                      </Link>
                      <Link
                        href={{ pathname: '/admin/badges/revoke', query: { label: badge.label } }}
                        className={styles.crtButton}
                      >
                        ➖ Revoke
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.scanlines} />
      </div>
    </>
  );
}

export default withGuardianGate(BadgesPage);