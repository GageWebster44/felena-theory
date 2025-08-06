import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';

interface SeasonConfig {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  xp_multiplier: number;
  notes: string;
}

function AdminSeasonXP() {
  const [seasons, setSeasons] = useState<SeasonConfig[]>([]);
  const [label, setLabel] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
  try {
    const { data } = await supabase.from('season_config').select('*').order('start_date', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in admin-season.tsx', error);
  }
    setSeasons(data || []);
  };

  const saveSeason = async () => {
    setLoading(true);
  try {
    await supabase.from('season_config').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-season.tsx', error);
  }
      label,
      start_date: start,
      end_date: end,
      xp_multiplier: multiplier,
      notes
    });
    setLabel('');
    setStart('');
    setEnd('');
    setMultiplier(1);
    setNotes('');
    await fetchSeasons();
    setLoading(false);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>📆 Seasonal XP Control</h1>
      <p className={styles.crtText}>Configure multipliers and bonus events per season.</p>

      <div className={styles.crtMenu}>
        <input
          className={styles.crtInput}
          placeholder="Season Label (e.g. Season 4: Override Protocol)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className={styles.crtInput}
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          className={styles.crtInput}
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <input
          className={styles.crtInput}
          type="number"
          step="0.1"
          value={multiplier}
          onChange={(e) => setMultiplier(parseFloat(e.target.value))}
        />
        <textarea
          className={styles.crtInput}
          rows={3}
          placeholder="Notes (e.g. Includes 2x mission XP, bonus crate unlocks)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button onClick={saveSeason} className={styles.crtButton} disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Season'}
        </button>
      </div>

      <div className={styles.crtScrollBox} style={{ marginTop: '2rem' }}>
        <h2 className={styles.crtTitle}>🗂️ Season Log</h2>
        {seasons.map((s, i) => (
          <div key={i} className={styles.crtCard}>
            <p><strong>📛 Label:</strong> {s.label}</p>
            <p><strong>📅 Range:</strong> {s.start_date} → {s.end_date}</p>
            <p><strong>⚡ Multiplier:</strong> {s.xp_multiplier}x</p>
            <p><strong>📝 Notes:</strong> {s.notes}</p>
          </div>
        ))}
      </div>

      <div className={styles.scanlines}></div>
    </div>
  );
}

export default withAdminGate(AdminSeasonXP);