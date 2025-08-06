// pages/crate-viewer.tsx
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';

interface Crate {
  id: string;
  user_id: string;
  label: string;
  xp_value: number;
  source: string;
  opened: boolean;
  created_at: string;
  opened_at?: string;
}

function CrateViewerPage() {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [filter, setFilter] = useState('');
  const [onlyUnopened, setOnlyUnopened] = useState(false);

  useEffect(() => {
    fetchCrates();
  }, []);

  const fetchCrates = async () => {
  try {
    const { data } = await supabase.from('xp_crates').select('*').order('created_at', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in crate-viewer.tsx', error);
  }
    setCrates(data || []);
  };

  const filtered = crates.filter(crate => {
    const matchesFilter =
      crate.label.toLowerCase().includes(filter.toLowerCase()) ||
      crate.user_id.toLowerCase().includes(filter.toLowerCase()) ||
      crate.source.toLowerCase().includes(filter.toLowerCase());
    const matchesOpen = onlyUnopened ? !crate.opened : true;
    return matchesFilter && matchesOpen;
  });

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📦 Crate Viewer</h2>
      <p>Admin utility to inspect crate logs and history by user, source, or label.</p>

      <div className={styles.crtMenu}>
        <input
          className={styles.crtInput}
          placeholder="Search by label, user, or source..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={onlyUnopened}
            onChange={() => setOnlyUnopened(!onlyUnopened)}
          />
          Show only unopened
        </label>
      </div>

      <div className={styles.crtScrollBox}>
        {filtered.length === 0 ? (
          <p className={styles.crtText}>📭 No crates match your query.</p>
        ) : (
          filtered.map((crate, i) => (
            <div key={i} className={styles.crtCard}>
              <p><strong>📦 Label:</strong> {crate.label}</p>
              <p><strong>🧑 User:</strong> {crate.user_id}</p>
              <p><strong>💠 XP Value:</strong> {crate.xp_value}</p>
              <p><strong>🎯 Source:</strong> {crate.source}</p>
              <p><strong>🔓 Status:</strong> {crate.opened ? '✅ Opened' : '🔒 Unopened'}</p>
              <p style={{ fontSize: '0.75rem' }}>🕒 Created: {new Date(crate.created_at).toLocaleString()}</p>
              {crate.opened_at && <p style={{ fontSize: '0.75rem' }}>📅 Opened: {new Date(crate.opened_at).toLocaleString()}</p>}
            </div>
          ))
        )}
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}

export default withAdminGate(CrateViewerPage);