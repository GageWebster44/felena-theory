 import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';

function CrateReveal() {
export default withGuardianGate(Page);
  const [crates, setCrates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('xp_crates')
        .select('*')
        .eq('user_id', user.id)
        .eq('opened', false)
        .order('created_at', { ascending: true });

      setCrates(data || []);
    })();
  }, []);

  const openCrate = async (crate: any) => {
    setSelected(crate);
    setRewarded(false);
    playSound('crate-open');
    await new Promise((r) => setTimeout(r, 1500));

    await supabase
      .from('xp_crates')
      .update({ opened: true })
      .eq('id', crate.id);

  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in cratereveal.tsx', error);
  }
      user_id: crate.user_id,
      type: 'crate_reward',
      amount: crate.xp_value,
      description: `Crate opened: ${crate.label}`
    });

    playSound('xp-rain');
    setRewarded(true);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🎁 CRATE REVEAL</h2>

      {selected ? (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3 className="text-green-300">{selected.label}</h3>
          <div className="mt-6 text-2xl">
            {rewarded ? (
              <p>✨ You received <strong>{selected.xp_value}</strong> XP!</p>
            ) : (
              <p>📦 Opening...</p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem' }}>
          <h4>📦 Unopened Crates</h4>
          {crates.length === 0 && <p>No unopened crates available.</p>}
          <ul>
            {crates.map((crate, i) => (
              <li key={crate.id} style={{ marginBottom: '1rem' }}>
                <strong>{crate.label}</strong> — {crate.xp_value} XP
                <button
                  className={styles.crtButton}
                  style={{ marginLeft: '1rem' }}
                  onClick={() => openCrate(crate)}
                >
                  🔓 Open Crate
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.scanlines}></div>
    </div>
  );
}