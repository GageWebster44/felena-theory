 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import styles from '@/styles/crtLaunch.module.css';
import { engineMeta } from './GridMeta';
import triggerXPBurst from '@/utils/triggerXPBurst';
import logXP from '@/utils/logXP';
import supabase from '@/utils/supabaseClient';

function EngineDetail() {
export default withGuardianGate(Page);
  const router = useRouter();
  const { id } = router.query;
  const [engine, setEngine] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (id) {
      const found = engineMeta.find((e) => e.id === id);
      setEngine(found || null);
    }
  }, [id]);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  try {
    const { data } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  } catch (error) {
    console.error('❌ Supabase error in [id].tsx', error);
  }
      setUserRole(data?.role || '');
    };
    fetchRole();
  }, []);

  const handleXPTrigger = async () => {
    triggerXPBurst();
    setFeedback(`✅ XP surge triggered for ${engine.label}`);
    await logXP('engine_test', 0, `Manual test run of ${engine.id}`);
  };

  if (!engine) return null;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <button className={styles.crtButton} onClick={() => router.push('/internal/grid')}>
        ◀ Return to Grid
      </button>

      <h2>{engine.label}</h2>
      <p>🔐 XP Cost: {engine.xpCost}</p>
      <p>📈 ROI: {engine.roi}x</p>
      <p>🎖 Class: {engine.class}</p>

      <section style={{ marginTop: '1rem' }}>
        <h4>Description</h4>
        <p>{engine.description || 'No description available.'}</p>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h4>🧪 Trigger Logic</h4>
        <code>{engine.route}</code>
      </section>

      {userRole === 'admin' || userRole === 'dev' ? (
        <section style={{ marginTop: '2rem' }}>
          <button className={styles.crtButton} onClick={handleXPTrigger}>
            💥 Run Dev Test
          </button>
          {feedback && <p style={{ color: '#0f0' }}>{feedback}</p>}
        </section>
      ) : null}

      <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#888' }}>
        <p>[📊 Simulated ROI Trendline Placeholder]</p>
      </div>
    </div>
  );
}