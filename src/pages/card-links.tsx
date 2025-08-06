// pages/card-links.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { CSVLink } from 'react-csv';
import Fuse from 'fuse.js';

function CardLinksPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const load = async () => {
  try {
    const { data } = await supabase.from('card_links').select('*').order('linked_at', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in card-links.tsx', error);
  }
      setLinks(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter
    ? new Fuse(links, {
        keys: ['email'],
        threshold: 0.3
      }).search(filter).map(r => r.item)
    : links;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>💳 Card Link Log</h1>
      <p className={styles.crtText}>Timestamped record of users who initiated payment activation.</p>

      <div className={styles.crtMenu}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by email..."
          className={styles.crtInput}
        />
        <CSVLink data={links} filename="card_links_export.csv" className={styles.crtButton}>
          📤 Export CSV
        </CSVLink>
      </div>

      {loading ? <p>Loading...</p> : (
        <ul className={styles.crtScrollBox} style={{ listStyle: 'none', padding: 0 }}>
          {filtered.map((entry, i) => (
            <li key={i} style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#0f0' }}>🔗 {entry.email}</p>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>⏱️ {new Date(entry.linked_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAdminGate(CardLinksPage);