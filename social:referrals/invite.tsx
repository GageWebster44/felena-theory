import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import logXP from '@/utils/logXP';

function InvitePage() {
export default withGuardianGate(Page);
  const [refCode, setRefCode] = useState('');
  const [connects, setConnects] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('public');
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('referral_code, role')
        .eq('id', user.id)
        .single();

      setRefCode(profile?.referral_code || '');
      setUserRole(profile?.role || 'public');

      const { data: rawConnects } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: true });

      setConnects(rawConnects || []);

      const { data: top } = await supabase
        .from('referrals')
        .select('referrer_id, count: referred_user_id')
        .group('referrer_id')
        .order('count', { ascending: false });

      setLeaderboard(top || []);

      const paying = rawConnects.filter(r => r.is_paying);
      const xpTotal = paying.reduce((acc, r) => acc + calculateXPReward(1, userRole), 0);
      const rate = paying.length / Math.max(rawConnects.length, 1);
      setSummary(`You've connected ${rawConnects.length} users, ${paying.length} became paying (conversion rate: ${Math.round(rate * 100)}%) and earned ${xpTotal} XP`);
    };

    init();
  }, []);

  const calculateXPReward = (index: number, role: string) => {
    if (role === 'admin' || role === 'dev') return 1000;
    const xpSteps = [5, 10, 20, 40];
    return xpSteps[Math.min(index, 4)] || 100;
  };

  const claimReferralXP = async () => {
    const now = new Date();
    const month = now.getMonth();
    const verified = connects.filter(r => r.is_paying && new Date(r.created_at).getMonth() === month);

    for (let i = 0; i < verified.length; i++) {
      const r = verified[i];
      const reward = calculateXPReward(i, userRole);

      const { data: existing } = await supabase
        .from('xp_history')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'referral')
        .eq('description', `Referral bonus for ${r.referred_user_id}`);

      if (!existing || existing.length === 0) {
  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in invite.tsx', error);
  }
          user_id: userId,
          type: 'referral',
          amount: reward,
          description: `Referral bonus for ${r.referred_user_id}`,
        });
        await logXP('referral_reward', reward, `Referral bonus for ${r.referred_user_id}`);
      }
    }

    // Milestone crate logic
    const totalConnects = connects.filter(r => r.is_paying).length;
    const milestoneTiers = [5, 10, 25, 50];

    for (let tier of milestoneTiers) {
      const { data: exists } = await supabase
        .from('xp_crates')
        .select('id')
        .eq('user_id', userId)
        .eq('label', `Referral Crate Tier ${tier}`);

      if (!exists || exists.length === 0) {
        if (totalConnects >= tier) {
  try {
    await supabase.from('xp_crates').insert({
  } catch (error) {
    console.error('❌ Supabase error in invite.tsx', error);
  }
            user_id: userId,
            xp_value: tier * 10,
            label: `Referral Crate Tier ${tier}`,
            source: 'referral_milestone',
            opened: false,
          });
        }
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refCode);
    alert('Referral code copied!');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📨 INVITE PANEL</h2>
      <p>Your connect code: <strong>{refCode}</strong> <button onClick={copyToClipboard}>📋 Copy Code</button></p>
      <button onClick={claimReferralXP} className={styles.crtButton} style={{ marginTop: '1rem' }}>
        🎁 Claim Referral XP
      </button>
      {summary && <p style={{ color: '#0f0', marginTop: '1rem' }}>{summary}</p>}

      <div style={{ marginTop: '2rem' }}>
        <h3>🧑 Active Connects</h3>
        {connects.length > 0 ? (
          <ul>
            {connects.map((r, i) => (
              <li key={i}>
                {r.referred_user_id.slice(0, 6)} {r.is_paying && <>🟢 Paying +{calculateXPReward(i, userRole)} XP</>}
              </li>
            ))}
          </ul>
        ) : <p>🔴 No active connects yet.</p>}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>🔗 Uplink Chains</h3>
        {connects.length > 0 ? (
          <ul>
            {connects.map((r, i) => (
              <li key={i}>{r.referred_user_id.slice(0, 6)} {r.is_paying && <>🟢</>}</li>
            ))}
          </ul>
        ) : <p>🔴 No chain branches yet.</p>}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📊 Connect Leaderboards</h3>
        <ul>
          {leaderboard.map((r, i) => (
            <li key={i}>{r.referrer_id.slice(0, 6)}: {r.count} connects</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#aaa' }}>
        <p>🎁 Referral XP is calculated monthly. Public users earn scaled rewards: 5, 10, 20, 40, 100+ XP. Devs and Admins earn 1000 XP flat per verified referral.</p>
        <p>📦 Crate bonuses are triggered at 5, 10, 25, and 50 verified referrals. They appear in your XP Crate Center.</p>
        <p>🔗 This system supports multi-chain quantum links. You are rewarded based on chain depth and paying status.</p>
        <p>🧠 Tip: The most powerful XP chain growth comes from early trust and layered strategy. Invite wisely.</p>
      </div>
    </div>
  );
}