// pages/profile.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';
import Link from 'next/link';

export default withGuardianGate(function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [connects, setConnects] = useState<number>(0);
  const [engines, setEngines] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [crates, setCrates] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [nextBadge, setNextBadge] = useState<{ label: string, current: number, goal: number } | null>(null);
  const [flags, setFlags] = useState<string[]>([]);
  const [tier, setTier] = useState('Tier 0: Unranked');
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const getTierFromXP = (xp: number) => {
    if (xp >= 100000) return 'Tier 17: Quantum Prime';
    if (xp >= 75000) return 'Tier 16: Ascendant';
    if (xp >= 50000) return 'Tier 15: Visionary';
    if (xp >= 25000) return 'Tier 14: Sentinel';
    if (xp >= 20000) return 'Tier 13: High Commander';
    if (xp >= 15000) return 'Tier 12: Override Alpha';
    if (xp >= 10000) return 'Tier 11: Legendary';
    if (xp >= 5000) return 'Tier 10: Operative';
    if (xp >= 2500) return 'Tier 9: Architect';
    if (xp >= 1000) return 'Tier 8: Algorithmist';
    if (xp >= 500) return 'Tier 7: Signal Carrier';
    if (xp >= 250) return 'Tier 6: Hackpoint';
    if (xp >= 100) return 'Tier 5: Initiate';
    if (xp >= 50) return 'Tier 4: Recruit';
    if (xp >= 20) return 'Tier 3: Uplinked';
    if (xp >= 10) return 'Tier 2: Accepted';
    if (xp >= 5) return 'Tier 1: Observer';
    return 'Tier 0: Unranked';
  };

  const loadProfile = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return router.push('/login');
    const userId = user.user.id;

    const { data: onboarding } = await supabase
      .from('user_onboarding')
      .select('completed')
      .eq('user_id', userId)
      .single();
    if (!onboarding?.completed) return router.push('/onboard');

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!userProfile) return;
    setProfile(userProfile);
    setTier(getTierFromXP(userProfile.xp || 0));

    const { data: refList } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', userId);
    setConnects(refList?.length || 0);

    const { data: unlocked } = await supabase
      .from('unlocked_engines')
      .select('id')
      .eq('user_id', userId);
    setEngines(unlocked?.length || 0);

    const { data: crateList } = await supabase
      .from('xp_crates')
      .select('id')
      .eq('user_id', userId);
    setCrates(crateList?.length || 0);

    const userBadges: string[] = [];
    const role = userProfile.role || 'public';
    if (role === 'admin' || role === 'developer') userBadges.push('💻 Dev Badge');
    if (refList?.length >= 5) userBadges.push('🔗 Connect Commander');
    if (crateList?.length >= 3) userBadges.push('📦 Crate Collector');
    if (userProfile.missions_claimed ?? 0 >= 10) userBadges.push('🎯 Mission Veteran');
    if (unlocked?.length >= 10) userBadges.push('🧠 Grid Explorer');

    const { data: views } = await supabase
      .from('cert_views')
      .select('cert_type')
      .eq('user_id', userId);
    const viewed = views?.map(v => v.cert_type) || [];
    if (viewed.includes('keycard') && viewed.includes('transcript')) {
      userBadges.push('📜 Fully Verified');
    }

    if (userProfile.status === 'frozen') {
      userBadges.push('🧊 Frozen');
    }

    setBadges(userBadges);

    const ladder = [
      { label: '🔗 Connect Commander', current: refList?.length || 0, goal: 5 },
      { label: '📦 Crate Collector', current: crateList?.length || 0, goal: 3 },
      { label: '🎯 Mission Veteran', current: userProfile.missions_claimed ?? 0, goal: 10 },
      { label: '🧠 Grid Explorer', current: unlocked?.length || 0, goal: 10 }
    ];
    const next = ladder.find(b => !userBadges.includes(b.label));
    if (next) setNextBadge(next);

    const { data: audits } = await supabase
      .from('audit_logs')
      .select('action')
      .ilike('action', `%${userId}%`);
    const riskFlags = audits?.filter(a => a.action.includes('⚠️')).map(a => a.action) || [];
    setFlags(riskFlags);

    setLoading(false);
  };

  if (loading) {
    return <div className={styles.crtScreen}><h2>🔄 Loading Operator Profile...</h2></div>;
  }

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🧬 Operator Profile</h2>
      <p><strong>🆔 Alias:</strong> {profile.username || 'N/A'}</p>
      <p><strong>🔓 Role:</strong> {profile.role || 'N/A'}{' '}
        <span style={{ color: profile.role === 'admin' ? '#f00' : profile.role === 'developer' ? '#0ff' : '#ccc' }}>
          ({profile.role || 'public'})
        </span>
      </p>
      <p><strong>💠 XP Balance:</strong> {profile.xp?.toLocaleString() ?? '0'} XP</p>
      <p><strong>🏆 Tier:</strong> {tier}</p>
      <p><strong>⚙️ Unlocked Engines:</strong> {engines}</p>
      <p><strong>🔗 Total Connects:</strong> {connects}</p>
      <p><strong>📦 Crates Unlocked:</strong> {crates}</p>

      {flags.length > 0 && (
        <p style={{ marginTop: '0.5rem', color: '#ffa' }}>
          ⚠️ {flags.length} audit flag(s) detected. <Link href="/audit-dashboard">Review Logs</Link>
        </p>
      )}

      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🏅 Badges earned:</span>
          <a href="/badges" className={styles.crtButton} style={{ fontSize: '0.75rem' }}>🔍 View All</a>
        </h3>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', listStyle: 'none', padding: 0 }}>
          {badges.length > 0 ? badges.map((b, i) => {
            const slug = b.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
            return (
              <li key={i} title={b} style={{ textAlign: 'center' }}>
                <img src={`/badges/${slug}.png`} alt={b} style={{ width: '48px', height: '48px' }} />
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{b}</div>
              </li>
            );
          }) : <p>🚫 No badges earned yet.</p>}
        </ul>
      </div>

      {nextBadge && (
        <div style={{ marginTop: '2rem' }}>
          <h3 className="text-green-400">🧬 Next Tier: {nextBadge.label}</h3>
          <p className="text-sm text-gray-400">{nextBadge.current} / {nextBadge.goal} — {nextBadge.goal - nextBadge.current} to go</p>
          <div style={{ background: '#111', border: '1px solid #0f0', height: '10px', width: '100%', borderRadius: '6px', marginTop: '4px' }}>
            <div style={{ background: '#0f0', height: '100%', width: `${Math.min((nextBadge.current / nextBadge.goal) * 100, 100)}%`, transition: 'width 0.4s ease-in-out' }}></div>
          </div>
        </div>
      )}

      <div className={styles.scanlines}></div>
    </div>
  );
});