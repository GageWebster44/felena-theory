// pages/xp-test.tsx
import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import { triggerXPBurst } from '@/utils/triggerXPBurst';
import logXP from '@/utils/logXP';

function XPTestPage() {
export default withGuardianGate(Page);
  const [xpAmount, setXPAmount] = useState(10);
  const [label, setLabel] = useState('Manual Test');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const fetchUser = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (user?.user?.id) setUserId(user.user.id);
  };

  const handleInject = async () => {
    await fetchUser();
    if (!userId) return setMessage('Missing user ID');

    const { error } = await supabase.rpc('add_xp', {
      uid: userId,
      amount: xpAmount,
    });

    if (!error) {
      await logXP('manual', xpAmount, label);
      triggerXPBurst();
      playSound('xp-grant');
      setMessage(`✅ Injected ${xpAmount} XP for '${label}'`);
    } else {
      setMessage('❌ Injection failed');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🧪 XP Injection Test</h1>
      <div className={styles.crtMenu}>
        <input
          className={styles.crtInput}
          type="number"
          value={xpAmount}
          onChange={(e) => setXPAmount(parseInt(e.target.value))}
          placeholder="XP Amount"
        />
        <input
          className={styles.crtInput}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="XP Label"
        />
        <button onClick={handleInject} className={styles.crtButton}>🚀 Inject XP</button>
        {message && <p style={{ marginTop: '1rem', color: '#0f0' }}>{message}</p>}
      </div>
      <div className={styles.scanlines}></div>
    </div>
  );
}