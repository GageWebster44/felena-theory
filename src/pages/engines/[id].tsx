import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import { logXP } from '@/utils/logXP';
import { triggerXPBurst } from '@/utils/triggerXPBurst';
import playSound from '@/utils/playSound';
import styles from '@/styles/crtLaunch.module.css';

interface Engine {
  id: string;
  name: string;
  class: 'Mini' | 'Minor' | 'Major' | 'Mega' | 'Max';
  roi: number;
  unlocked: boolean;
  description: string;
}

function EngineDetail() {
export default withGuardianGate(Page);
  const router = useRouter();
  const { id } = router.query;
  const [engine, setEngine] = useState<Engine | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
  try {
    const { data } = await supabase.from('engines').select('*').eq('id', id).single();
  } catch (error) {
    console.error('❌ Supabase error in [id].tsx', error);
  }
      if (data) setEngine(data);

      const { data: user } = await supabase.auth.getUser();
  try {
    const res = await supabase.from('engine_unlocks').select('*')
  } catch (error) {
    console.error('❌ Supabase error in [id].tsx', error);
  }
        .eq('engine_id', id).eq('user_id', user?.user?.id).single();
      if (res.data) setUnlocked(true);
    };
    load();
  }, [id]);

  const unlock = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user || !engine) return;

  try {
    await supabase.from('engine_unlocks').insert({
  } catch (error) {
    console.error('❌ Supabase error in [id].tsx', error);
  }
      user_id: user.user.id,
      engine_id: engine.id
    });

    await logXP('engine_unlock', engine.roi, `Unlocked ${engine.name}`);
    playSound('xp-rain');
    triggerXPBurst();
    setMessage(`✅ ${engine.name} unlocked!`);
    setUnlocked(true);
  };

  if (!engine) return <div className={styles.crtScreen}>Loading engine...</div>;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🔓 Engine Profile</h2>
      <p><strong>Name:</strong> {engine.name}</p>
      <p><strong>Class:</strong> {engine.class}</p>
      <p><strong>Simulated ROI:</strong> {engine.roi}x</p>
      <p><strong>Description:</strong> {engine.description}</p>

      {unlocked ? (
        <div>✅ Engine already unlocked.</div>
      ) : (
        <button onClick={unlock} className={styles.crtButton}>
          🚀 Unlock Engine
        </button>
      )}

      {message && <div className={styles.successNote}>{message}</div>}
    </div>
  );
}