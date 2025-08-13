import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function UplinkChainPage() {
export default withGuardianGate(Page);
  const [userId, setUserId] = useState('');
  const [refCode, setRefCode] = useState('');
  const [chain, setChain] = useState<any[]>([]);
  const [seasonEnd, setSeasonEnd] = useState<string>('');
  const [lotteryPower, setLotteryPower] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();
      setRefCode(profile?.referral_code || '');

      const { data: referrals } = await supabase
        .from('referral_logs')
        .select('referred_user_id, created_at, is_paying')
        .eq('referrer_id', user.id);
      setChain(referrals || []);

      setLotteryPower((referrals || []).filter((r) => r.is_paying).length * 0.1);

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
      <h2>🔗 UPLINK CHAIN</h2>
      <p><strong>Your Connect Code:</strong> {refCode}</p>
      <p><strong>Chain Resets:</strong> {seasonEnd}</p>
      <p><strong>📈 Bonus Lottery Power:</strong> +{(lotteryPower * 100).toFixed(0)}%</p>

      <p className="mt-4">
        XP flows upward. Every confirmed connect adds momentum to your uplink chain. Maximize before reset.
      </p>

      <div className="mt-6">
        <h3>📶 Active Chain Connections</h3>
        {chain.length > 0 ? (
          <ul>
            {chain.map((r, i) => (
              <li key={i}>
                {r.referred_user_id.slice(0, 6)} – Joined {new Date(r.created_at).toLocaleDateString()} +{calculateXP(i, !r.is_paying)} XP
              </li>
            ))}
          </ul>
        ) : (
          <p>📭 No active uplinks this season.</p>
        )}
      </div>

      <div className="mt-8">
        <h3>📊 Chain Flow Simulation</h3>
        <p className="text-sm text-green-300">
          Direct uplinks earn: 5 → 10 → 20 → 40 → 100 XP<br />
          Indirect uplinks grant +10 XP each. All XP climbs upward.
        </p>
        <p className="text-xs text-gray-400 italic mt-2">
          Rebuild your chain quarterly. Stronger chains unlock higher tiers and crate bonuses.
        </p>
      </div>

      <div className="mt-10">
        <h3>🧭 Visual Chain Map (Prototype)</h3>
        <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: '#111', padding: '1rem', border: '1px dashed #0f0' }}>
          <pre>
{refCode}
└─▶ {chain.map((r) => r.referred_user_id.slice(0, 6)).join('\n    └─▶ ')}
          </pre>
        </div>
      </div>
    </div>
  );
}