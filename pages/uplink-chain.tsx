 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function UplinkChain() {
export default withGuardianGate(Page);
  const [userId, setUserId] = useState('');
  const [connectCode, setConnectCode] = useState('');
  const [chain, setChain] = useState<any[]>([]);
  const [seasonEnd, setSeasonEnd] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch connect code
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('connect_code')
        .eq('id', user.id)
        .single();

      setConnectCode(profile?.connect_code || '');

      // Fetch current season's connects
      const { data: connects } = await supabase
        .from('referral_logs')
        .select('referred_user_id, created_at, is_paying')
        .eq('referrer_id', user.id);

      setChain(connects || []);

      // Calculate end of current quarter
      const now = new Date();
      const qEnd = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0);
      setSeasonEnd(qEnd.toLocaleDateString());
    })();
  }, []);

  const calculateXP = (index: number, isIndirect = false) => {
    if (isIndirect) return 10;
    return [5, 10, 20, 40, 100][index] || 100;
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🧠 XP UPLINK CHAIN</h2>
      <p><strong>Your Connect Code:</strong> {connectCode}</p>
      <p><strong>Season Ends:</strong> {seasonEnd}</p>

      <p style={{ marginTop: '1rem' }}>
        🔁 Chain resets quarterly. All XP flows upward. Share your connect code now to maximize earnings.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <h3>🔗 Downlink Connections</h3>
        {chain.length > 0 ? (
          <ul>
            {chain.map((r, i) => (
              <li key={i}>
                {r.referred_user_id.slice(0, 6)} ➝ Joined {new Date(r.created_at).toLocaleDateString()} = +{calculateXP(i, r.is_paying === false)} XP
              </li>
            ))}
          </ul>
        ) : (
          <p>⚠️ No active connects this season.</p>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📈 XP Cascade Simulation</h3>
        <p className="text-sm text-green-300">
          Direct connects earn scaled XP (5 → 10 → 20 → 40 → 100).<br />
          Indirect connects (their uplinks) earn +10 XP each.
        </p>
        <p className="text-xs text-gray-400 italic mt-2">
          Every uplink resets every 3 months. Build deep chains. Stay above the breach line.
        </p>
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}