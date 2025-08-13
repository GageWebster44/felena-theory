// pages/account/payments/wallet/keycard.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';

import withGuardianGate from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

type Profile = {
  id: string;
  alias?: string;
  username?: string;
  role?: string;
  status?: string;
  xp?: number;
  referral_code?: string;
};

type CertView = { cert_type: string };
type AuditRow = { action: string };

function KeycardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [connects, setConnects] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [tier, setTier] = useState<string>('Tier 0: Unranked');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Derived referral link (stable once profile loaded)
  const referralLink = useMemo(() => {
    const code = profile?.referral_code || '';
    const base = process.env.NEXT_PUBLIC_SITE_URL || '';
    return code ? `${base}/auth?ref=${code}` : '';
  }, [profile?.referral_code]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      // 0) User session
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      if (!user) {
        router.push('/login');
        return;
      }
      const userId = user.id;

      // 1) Check onboarding
      const { data: onboarding, error: obErr } = await supabase
        .from('user_onboarding')
        .select('completed')
        .eq('user_id', userId)
        .single();
      if (obErr) console.error('✖ keycard.tsx onboarding fetch:', obErr);
      if (!onboarding?.completed) {
        router.push('/onboard');
        return;
      }

      // 2) Parallel fetches
      const [
        { data: prof, error: profErr },
        { data: refs, error: refsErr },
        { data: views, error: viewsErr },
        { data: audits, error: auditErr },
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).single<Profile>(),
        supabase.from('referrals').select('id').eq('referrer_id', userId),
        supabase.from('cert_views').select('cert_type').eq('user_id', userId),
        supabase.from('audit_logs').select('action').ilike('action', `%${userId}%`),
      ]);

      if (profErr) console.error('✖ keycard.tsx profile fetch:', profErr);
      if (refsErr) console.error('✖ keycard.tsx referrals fetch:', refsErr);
      if (viewsErr) console.error('✖ keycard.tsx cert_views fetch:', viewsErr);
      if (auditErr) console.error('✖ keycard.tsx audit_logs fetch:', auditErr);

      if (!mounted) return;

      setProfile(prof || null);
      setConnects(refs?.length || 0);

      // 3) Badges (and background upserts)
      const viewedTypes = (views || []).map((v: CertView) => v.cert_type);
      const newBadges: string[] = [];

      if (viewedTypes.includes('keycard') && viewedTypes.includes('transcript')) {
        newBadges.push('📜 Fully Verified');
        // fire and forget
        supabase
          .from('user_badges')
          .upsert({
            user_id: userId,
            label: '📜 Fully Verified',
            source: 'EchoMind',
            timestamp: new Date().toISOString(),
          })
          .then(({ error }) => error && console.error('✖ upsert Fully Verified badge:', error));
      }
      if (prof?.status === 'frozen') {
        newBadges.push('🧊 Frozen');
        supabase
          .from('user_badges')
          .upsert({
            user_id: userId,
            label: '🧊 Frozen',
            source: 'EchoMind',
            timestamp: new Date().toISOString(),
          })
          .then(({ error }) => error && console.error('✖ upsert Frozen badge:', error));
      }
      setBadges(newBadges);

      // 4) Risk flags
      const risk = (audits || [])
        .filter((a: AuditRow) => a.action.includes('⚠️'))
        .map((a) => a.action);
      setFlags(risk);

      // 5) Tier + done
      setTier(getTierFromXP(prof?.xp || 0));
      setLoading(false);

      // 6) One‑time auto PDF
      if (prof?.id && !sessionStorage.getItem('keycardPdfDownloaded')) {
        const a = document.createElement('a');
        a.href = `/api/keycard-pdf?user_id=${prof.id}`;
        a.download = `Operator-Keycard-${prof.id}.pdf`;
        a.click();
        sessionStorage.setItem('keycardPdfDownloaded', 'true');
      }
    })();

    // refresh every 10s
    const id = setInterval(() => {
      // fire-and-forget refresh of connects & flags (cheap)
      (async () => {
        const { data: sessionData } = await supabase.auth.getUser();
        const userId = sessionData?.user?.id;
        if (!userId) return;

        const [{ data: refs }, { data: audits }] = await Promise.all([
          supabase.from('referrals').select('id').eq('referrer_id', userId),
          supabase.from('audit_logs').select('action').ilike('action', `%${userId}%`),
        ]);

        setConnects(refs?.length || 0);
        const risk = (audits || [])
          .filter((a: AuditRow) => a.action.includes('⚠️'))
          .map((a) => a.action);
        setFlags(risk);
      })();
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [router]);

  function getTierFromXP(xp: number): string {
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
  }

  function copy(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function downloadTranscript() {
    if (!profile?.id) return;
    await supabase
      .from('cert_views')
      .insert({
        user_id: profile.id,
        cert_type: 'transcript',
        viewed_at: new Date().toISOString(),
      })
      .then(({ error }) => error && console.error('✖ insert cert_view transcript:', error));
    window.open(`/api/operator-transcript?user_id=${profile.id}`, '_blank');
  }

  if (loading || !profile) {
    return (
      <div className={styles.crtScreen}>
        <h2>🔄 Loading Keycard...</h2>
        <div className={styles.scanlines} />
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <Head>
        <title>Operator Keycard – Felena Theory</title>
        <meta
          name="description"
          content="View your XP, role, alias, tier, and referral identity inside the Felena Grid."
        />
      </Head>

      <h2>🧬 OPERATOR KEYCARD</h2>
      <p>This digital ID links your XP, role, and referral history.</p>

      <div className={styles.crtGridResponsive} style={{ marginTop: '2rem' }}>
        {/* Left card */}
        <div style={{ border: '1px solid #0ff', padding: '1rem', borderRadius: 8 }}>
          <p>
            <strong>🆔 Alias:</strong> {profile.alias || profile.username || 'N/A'}
          </p>
          <p>
            <strong>💠 XP:</strong> {Number(profile.xp || 0).toLocaleString()} XP
          </p>
          <p>
            <strong>🔓 Role:</strong> {profile.role || 'public'}
          </p>
          <p>
            <strong>🏆 Tier:</strong> {tier}
          </p>
          <p>
            <strong>🔗 Referral Code:</strong> {profile.referral_code || 'N/A'}
          </p>
          <p>
            <strong>👥 Connects:</strong> {connects}
          </p>

          {flags.length > 0 && (
            <div style={{ marginTop: '.5rem', color: '#ffa' }}>
              ⚠️ {flags.length} audit flag(s) detected.{' '}
              <Link href="/audit-dashboard">Review Logs</Link>
            </div>
          )}

          {badges.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>🏅 Keycard Badges:</strong>
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  display: 'flex',
                  gap: '.75rem',
                  flexWrap: 'wrap',
                }}
              >
                {badges.map((b, i) => {
                  const slug = b.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
                  return (
                    <li key={`${slug}_${i}`} title={b} style={{ textAlign: 'center' }}>
                      <img
                        src={`/badges/${slug}.png`}
                        alt={b}
                        style={{ width: 48, height: 48 }}
                      />
                      <div style={{ fontSize: '.75rem', marginTop: '.25rem' }}>{b}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <button
              className={styles.crtButton}
              onClick={() => copy(profile.referral_code || '')}
            >
              📎 {copied ? 'Copied!' : 'Copy Referral Code'}
            </button>
            <button className={styles.crtButton} onClick={() => copy(referralLink)}>
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
        </div>

        {/* Right QR */}
        <div style={{ textAlign: 'center' }}>
          <QRCode value={referralLink || 'https://felena.app'} size={128} />
          <p className="text-xs mt-2 text-green-400">Scan to join via this operator</p>
          {referralLink && (
            <p className="text-xs mt-1 text-gray-400 italic" style={{ wordBreak: 'break-all' }}>
              {referralLink}
            </p>
          )}
        </div>
      </div>

      <div className="text-yellow-400 mt-4 text-sm italic">
        🧬 This keycard is your encrypted identity inside the Felena Grid. Share wisely.
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}

export default withGuardianGate(KeycardPage);