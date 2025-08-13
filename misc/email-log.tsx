// pages/misc/email-log.tsx
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import withAdminGate from '@/components/withRoleGate'; // HOC that blocks non-admins client-side
import supabase from '@/utils/supabaseClient';          // browser client
import styles from '@/styles/crtLaunch.module.css';

// ---- Types ----
type EmailLog = {
  id: string;
  recipient: string | null;
  subject: string | null;
  sent_by: string | null;      // e.g., 'system' | 'delta' | user email
  link?: string | null;        // optional link we stored with the email
  user_id?: string | null;
  timestamp: string;           // ISO string
};

// ---- Pagination helpers ----
const PAGE_SIZE = 50;

export default withAdminGate(function EmailLogViewer() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedFilter = useDebounce(filter, 250);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  );

  useEffect(() => {
    let isCancelled = false;

    async function fetchLogs() {
      setLoading(true);

      // Build where/or filter for Supabase
      // Searches recipient, subject, sent_by, link, and user_id
      const orFilter =
        debouncedFilter.trim().length > 0
          ? `recipient.ilike.%${debouncedFilter}%,subject.ilike.%${debouncedFilter}%,sent_by.ilike.%${debouncedFilter}%,link.ilike.%${debouncedFilter}%,user_id.ilike.%${debouncedFilter}%`
          : undefined;

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from<EmailLog>('email_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(from, to);

      if (orFilter) query = query.or(orFilter);

      const { data, count, error } = await query;

      if (!isCancelled) {
        if (error) {
          console.error('[email-log] fetch error:', error);
          setLogs([]);
          setTotal(0);
        } else {
          setLogs(data ?? []);
          setTotal(count ?? 0);
        }
        setLoading(false);
      }
    }

    fetchLogs();
    return () => {
      isCancelled = true;
    };
  }, [page, debouncedFilter]);

  function resetAndSearch(v: string) {
    setPage(1);
    setFilter(v);
  }

  return (
    <>
      <Head>
        <title>Felena Theory • Email Logs</title>
        <meta name="description" content="Enter the XP Quantum Grid." />
      </Head>

      <div className={styles.crtFrame}>
        <h1 className={styles.crtTitle}>Outbound Email Logs</h1>

        <div className={styles.crtMenu}>
          <input
            className={styles.crtInput}
            placeholder="Search by email, subject, sender, or user id…"
            value={filter}
            onChange={(e) => resetAndSearch(e.target.value)}
          />
          <div className={styles.crtText} style={{ marginLeft: '1rem' }}>
            {loading ? 'Loading…' : `${total.toLocaleString()} results`}
          </div>
        </div>

        <div className={styles.crtScrollBox}>
          {logs.map((entry) => (
            <pre key={entry.id} className={styles.crtLogBlock}>
{`• To:        ${entry.recipient ?? '—'}
• Subject:   ${entry.subject ?? '—'}
• From:      ${entry.sent_by ?? 'system'}
• Link:      ${entry.link ?? '—'}
• User ID:   ${entry.user_id ?? '—'}
• Timestamp: ${new Date(entry.timestamp).toLocaleString()}`}
            </pre>
          ))}
          {!loading && logs.length === 0 && (
            <p className={styles.crtText}>No matching emails.</p>
          )}
        </div>

        <Pager
          page={page}
          pageCount={pageCount}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
          onFirst={() => setPage(1)}
          onLast={() => setPage(pageCount)}
        />
      </div>
    </>
  );
});

// ---- Small pager control using CRT styles ----
function Pager({
  page,
  pageCount,
  onPrev,
  onNext,
  onFirst,
  onLast,
}: {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
}) {
  return (
    <div className={styles.crtMenu} style={{ marginTop: '1rem' }}>
      <button className={styles.crtButton} onClick={onFirst} disabled={page <= 1}>
        « First
      </button>
      <button className={styles.crtButton} onClick={onPrev} disabled={page <= 1}>
        ‹ Prev
      </button>
      <span className={styles.crtText} style={{ padding: '0 .75rem' }}>
        Page {page} / {pageCount}
      </span>
      <button
        className={styles.crtButton}
        onClick={onNext}
        disabled={page >= pageCount}
      >
        Next ›
      </button>
      <button
        className={styles.crtButton}
        onClick={onLast}
        disabled={page >= pageCount}
      >
        Last »
      </button>
    </div>
  );
}

// ---- simple debounce hook ----
function useDebounce<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// ---- Server-side guard (blocks non-admins at the edge of the route) ----
export { getServerSideProps } from '@/utils/WithRoleGuard';
// ^ If you already have a helper that does an SSR admin check and returns
//   { props: {} } for admins or a redirect for everyone else, re-export it here.
//   If not, ask me and I’ll drop in a ready-made getServerSideProps that uses
//   @supabase/auth-helpers-nextjs to verify session + role === 'admin'.