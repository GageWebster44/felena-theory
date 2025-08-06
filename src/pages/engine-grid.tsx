import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import { logXP } from '@/utils/logXP';
import { triggerXPBurst } from '@/utils/triggerXPBurst';
import playSound from '@/utils/playSound';
import styles from '@/styles/crtLaunch.module.css';
import UnlockModal from '@/components/UnlockModal';

interface Engine {
  id: string;
  name: string;
  class: string;
  roi: number;
  xpCost: number;
  unlocked: boolean;
}

function EngineGrid() {
export default withGuardianGate(Page);
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selected, setSelected] = useState<Engine | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return router.push('/login');

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, devkey')
        .eq('id', user.user.id)
        .single();

      if (!profile) return;

      if (profile.role !== 'felena_vision' && !profile.devkey) {
        router.push('/preorder');
        return;
      }

  try {
    const { data } = await supabase.from('engines').select('*');
  } catch (error) {
    console.error('❌ Supabase error in engine-grid.tsx', error);
  }
      setEngines(data || []);
    };
    load();
  }, []);

  const unlock = async () => {
    if (!selected) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;

  try {
    await supabase.from('engine_unlocks').insert([
  } catch (error) {
    console.error('❌ Supabase error in engine-grid.tsx', error);
  }
      { engine_id: selected.id, user_id: user.user.id }
    ]);

    await logXP('engine_unlock', -selected.xpCost, `Unlocked ${selected.name}`);
    triggerXPBurst();
    playSound('xp-rain');

    setEngines(prev =>
      prev.map(e =>
        e.id === selected.id ? { ...e, unlocked: true } : e
      )
    );
    setModalOpen(false);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>⚙️ ENGINE GRID</h2>
      <p>Browse and unlock available XP-powered autonomous trading engines.</p>

      <div className={styles.overrideGrid}>
        {engines.map((engine) => (
          <div
            key={engine.id}
            className={styles.overrideCard}
            style={{
              opacity: engine.unlocked ? 1 : 0.5,
              borderColor: engine.unlocked ? '#00ff99' : '#ff0044',
              cursor: 'pointer'
            }}
            onClick={() => {
              if (!engine.unlocked) {
                setSelected(engine);
                setModalOpen(true);
              } else {
                location.href = `/engines/${engine.id}`;
              }
            }}
          >
            <h3 style={{ color: '#0ff' }}>{engine.name}</h3>
            <p style={{ color: '#ccc' }}>Class: {engine.class}</p>
            <p style={{ color: '#ccc' }}>ROI: {engine.roi}x</p>
            {!engine.unlocked && (
              <p style={{ color: '#ff0044' }}>🔒 {engine.xpCost} XP to unlock</p>
            )}
            {engine.unlocked && (
              <p style={{ color: '#00ff99' }}>✅ UNLOCKED</p>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <UnlockModal
          visible={modalOpen}
          engineName={selected.name}
          xpCost={selected.xpCost}
          roi={selected.roi}
          onConfirm={unlock}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}