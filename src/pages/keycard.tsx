// pages/keycard.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';
import QRCode from 'qrcode.react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default withGuardianGate(function KeycardPage() {
  const [profile, setProfile] = useState<any>({});
  const [connects, setConnects] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tier, setTier] = useState('Observer');
  const [flags, setFlags] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    const userId = user.id;

  try {
    const { data: onboarding } = await supabase.from('user_onboarding').select('completed').eq('user_id', userId).single();
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
    if (!onboarding?.completed) return router.push('/onboard');

  try {
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
    setProfile(profile || {});

  try {
    const { data: referrals } = await supabase.from('referrals').select('id').eq('referrer_id', userId);
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
    setConnects(referrals?.length || 0);

  try {
    const { data: views } = await supabase.from('cert_views').select('cert_type').eq('user_id', userId);
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
    const viewed = views?.map(v => v.cert_type) || [];
    if (viewed.includes('keycard') && viewed.includes('transcript')) {
  try {
    await supabase.from('user_badges').upsert({
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
        user_id: userId,
        label: '📜 Fully Verified',
        source: 'EchoMind',
        timestamp: new Date().toISOString()
      });
    }

    if (profile?.status === 'frozen') {
  try {
    await supabase.from('user_badges').upsert({
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
        user_id: userId,
        label: '🧊 Frozen',
        source: 'EchoMind',
        timestamp: new Date().toISOString()
      });
    }

    const badgeList = [];
    if (profile?.status === 'frozen') badgeList.push('🧊 Frozen');
    if (viewed.includes('keycard') && viewed.includes('transcript')) badgeList.push('📜 Fully Verified');
    setBadges(badgeList);

  try {
    const { data: audits } = await supabase.from('audit_logs').select('action').ilike('action', `%${userId}%`);
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
    const riskFlags = audits?.filter(a => a.action.includes('⚠️')).map(a => a.action) || [];
    setFlags(riskFlags);

    setTier(getTierFromXP(profile?.xp || 0));
    setLoading(false);

    if (!sessionStorage.getItem('pdfDownloaded')) {
      const a = document.createElement('a');
      a.href = `/api/keycard-pdf?user_id=${profile.id}`;
      a.download = `Operator-Keycard-${profile.id}.pdf`;
      a.click();
      sessionStorage.setItem('pdfDownloaded', 'true');
    }
  };

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

  const copyReferral = () => {
    const code = profile.referral_code;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth?ref=${profile.referral_code}`;

  const copyFullLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadTranscript = async () => {
  try {
    await supabase.from('cert_views').insert({
  } catch (error) {
    console.error('❌ Supabase error in keycard.tsx', error);
  }
      user_id: profile.id,
      cert_type: 'transcript',
      viewed_at: new Date().toISOString()
    });
    window.open(`/api/operator-transcript?user_id=${profile.id}`, '_blank');
  };

  if (loading) {
    return <div className={styles.crtScreen}><h2>🔄 Loading Keycard...</h2></div>;
  }

  return (
    <div className={styles.crtScreen}>
      <Head>
        <title>Operator Keycard – Felena Theory</title>
        <meta name="description" content="View your XP, role, alias, tier, and referral identity inside the Felena Grid." />
      </Head>

      <h2>🧬 OPERATOR KEYCARD</h2>
      <p>This digital ID links your XP, role, and referral history.</p>

      <div className={styles.crtGridResponsive} style={{ marginTop: '2rem' }}>
        <div style={{ border: '1px solid #0ff', padding: '1rem', borderRadius: '8px' }}>
          <p><strong>🆔 Alias:</strong> {profile.alias || profile.username || 'N/A'}</p>
          <p><strong>💠 XP:</strong> {profile.xp?.toLocaleString()} XP</p>
          <p><strong>🔓 Role:</strong> {profile.role || 'public'}</p>
          <p><strong>🏆 Tier:</strong> {tier}</p>
          <p><strong>🔗 Referral Code:</strong> {profile.referral_code || 'N/A'}</p>
          <p><strong>👥 Connects:</strong> {connects}</p>

          {flags.length > 0 && (
            <div style={{ marginTop: '0.5rem', color: '#ffa' }}>
              ⚠️ {flags.length} audit flag(s) detected. <Link href="/audit-dashboard">Review Logs</Link>
            </div>
          )}

          {badges.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>🏅 Keycard Badges:</strong></p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.75rem' }}>
                {badges.map((b, i) => {
                  const slug = b.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
                  return (
                    <li key={i} title={b} style={{ textAlign: 'center' }}>
                      <img src={`/badges/${slug}.png`} alt={b} style={{ width: '48px', height: '48px' }} />
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{b}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <button className={styles.crtButton} onClick={copyReferral}>
            📎 {copied ? 'Copied!' : 'Copy Referral Code'}
          </button>
          <button className={styles.crtButton} onClick={copyFullLink}>
            🔗 {copied ? 'Link Copied!' : 'Copy Referral Link'}
          </button>
          <button className={styles.crtButton} onClick={downloadTranscript}>
            📜 Download Transcript
          </button>
          <a
            href={`/api/keycard-pdf?user_id=${profile.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.crtButton}
          >
            🧾 Download Operator Keycard (PDF)
          </a>
          <Link href="/invite-claim" className={styles.crtButton}>
            🎟️ Claim Manual Invite
          </Link>
        </div>

        <div style={{ textAlign: 'center' }}>
          <QRCode value={referralLink} size={128} />
          <p className="text-xs mt-2 text-green-400">Scan to join via this operator</p>
          <p className="text-xs mt-1 text-gray-400 italic">{referralLink}</p>
        </div>
      </div>

      <div className="text-yellow-400 mt-4 text-sm italic">
        🧬 This keycard is your encrypted identity inside the Felena Grid. Share wisely.
      </div>

      <div className={styles.scanlines} />
    </div>
  );
});