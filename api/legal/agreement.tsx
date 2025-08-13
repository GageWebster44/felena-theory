// src/pages/api/legal/agreement.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

// Bump when the terms text materially changes
const AGREEMENT_VERSION = '1.0.0';
const UPDATED_AT = 'August 10, 2025';

/** Reusable: check if current user has accepted the current version */
export function useAgreementAccepted(version: string = AGREEMENT_VERSION) {
  const [accepted, setAccepted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (!uid) {
          if (!cancelled) setAccepted(false);
          return;
        }
        const { data, error: dbErr } = await supabase
          .from('xp_agreements')
          .select('accepted, version')
          .eq('user_id', uid)
          .single();

        if (dbErr) {
          if (!cancelled) setError(dbErr.message);
        } else {
          if (!cancelled) setAccepted(Boolean(data?.accepted) && data?.version === version);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Agreement check failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { accepted, loading, error };
}

function AgreementPage() {
  const router = useRouter();

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load logged-in user id
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        setUserId(data?.user?.id || '');
      } catch (e) {
        console.error('[agreement.tsx] auth error:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAccept = async () => {
    setError('');
    setSaved(false);

    if (!accepted) {
      setError('Please confirm you understand and accept these conditions.');
      return;
    }
    if (!userId) {
      setError('Sign in required. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      // 1) Convenience upsert for fast UI/middleware checks
      try {
        const payload = {
          user_id: userId,
          accepted: true,
          version: AGREEMENT_VERSION,
          updated_at: new Date().toISOString(),
        };
        const { error: dbErr } = await supabase
          .from('xp_agreements')
          .upsert(payload, { onConflict: 'user_id' });
        if (dbErr) throw dbErr;
      } catch (e) {
        console.warn('[agreement.tsx] xp_agreements upsert warning:', e);
      }

      // 2) Immutable receipt + outbox email (fire-and-forget)
      try {
        await fetch('/api/legal/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: AGREEMENT_VERSION,
            whenISO: new Date().toISOString(),
          }),
        }).catch(() => {});
      } catch {}

      setSaved(true);
      router.push('/phone-booth');
    } catch (err: any) {
      console.error('[agreement.tsx] save error:', err);
      setError('Unable to save agreement right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Felena XP System Agreement • Felena Theory</title>
        <meta
          name="description"
          content="Acknowledge and accept the Felena XP System Agreement."
        />
        <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.crtScreen}>
        <header className={styles.crtShell}>
          <div className={styles.crtHeader}>
            <span className={styles.crtTag}>Felena Theory</span>
            <span className={styles.crtStatus}>
              <span className="mr-3">FELENA XP SYSTEM AGREEMENT</span>
              <span>Status:</span> <span>ONLINE</span>
            </span>
          </div>
        </header>

        <main className={styles.crtMain}>
          <h2 className="text-green-400 font-bold pt-2">FELENA XP SYSTEM AGREEMENT</h2>

          <div className="text-sm text-gray-300 mt-4 space-y-3">
            <p>
              <strong>XP is a simulated in‑app resource.</strong> It is not legal currency, not a
              token, and not exchangeable for fiat or crypto. XP powers access to services, engines,
              tiers, crates, filters, games, and performance‑based algorithms inside Felena Theory.
            </p>
            <p>
              <strong>No purchase for the right to recruit.</strong> Referral XP is earned only when
              referred users become active and verified. XP gain is based on system activity, not
              promises of cash value or returns.
            </p>
            <p>
              <strong>Cashout is not a withdrawal.</strong> Where available, cashout refers to internal
              routing of XP through simulated trading logic and in‑grid mechanics (e.g., engine outcomes)
              and may require compliant brokerage connections where applicable. No guarantees are made.
            </p>
            <p>
              <strong>Risk disclosure.</strong> You acknowledge risk of XP loss through game modes,
              lottery participation, staking in unlockable content, or engine outcomes. Do not
              participate if you cannot afford to lose XP.
            </p>
            <p>
              <strong>QRUplink seasons.</strong> The <em>QRUplink flow chain</em> (referral network
              positions) resets every 90 days for fairness. <strong>Your XP tiers and current XP do NOT
              reset</strong> and continue forward across seasons; only the QRUplink flow chain resets.
            </p>
            <p>
              <strong>Fair play; enforcement.</strong> Leaderboards, jackpots, and seasonal rewards
              are simulated, logged, and apply only within the Felena XP grid. Cheating, exploitation,
              or automating prohibited actions is forbidden and may lead to account sanctions.
            </p>

            <h3 className="mt-6 font-bold text-yellow-400">Legal shields (condensed)</h3>
            <p>
              <strong>No warranties.</strong> The platform is provided “as‑is,” with no express or
              implied warranties, including merchantability or fitness for a particular purpose.
            </p>
            <p>
              <strong>Limitation of liability.</strong> To the maximum extent permitted by law, total
              liability is limited to the amount you paid to Felena in the prior 12 months (often $0
              for XP utility access). No indirect, incidental, or consequential damages.
            </p>
            <p>
              <strong>Indemnification.</strong> You agree to indemnify and hold harmless Felena
              Holdings LLC and its officers, employees, and partners from claims arising out of your
              use, content, or violation of these terms.
            </p>
            <p>
              <strong>Binding arbitration; venue lock.</strong> Any dispute will be resolved exclusively
              by binding arbitration in the State of Iowa, on an individual basis (no class actions),
              except where non‑waivable law requires otherwise. Iowa law governs, and you consent to
              jurisdiction and venue there.
            </p>
            <p>
              <strong>No reliance; entire agreement.</strong> You are not relying on any statement
              outside the Terms of Use and this Agreement. Together, they comprise the entire agreement
              between you and Felena Theory.
            </p>

            <p>
              Continue only if you understand and agree to the{' '}
              <Link href="/terms" className="underline text-cyan-300">
                Terms of Use
              </Link>{' '}
              and the acknowledgements above. Last revised {UPDATED_AT}.
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm text-yellow-400 flex items-center gap-2">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="accent-cyan-400"
              />
              I understand and accept these conditions.
            </label>

            {error ? <p className="text-red-400 mt-2">{error}</p> : null}
            {saved ? <p className="text-green-400 mt-2">Acknowledgement saved.</p> : null}

            <button
              disabled={loading || !accepted}
              onClick={handleAccept}
              className={styles.crtButton + ' mt-4'}
            >
              {loading ? 'Saving…' : 'Proceed to Phone Booth'}
            </button>
          </div>
        </main>

        <div className={styles.scanlines} />
      </div>
    </>
  );
}

export default withGuardianGate ? withGuardianGate(AgreementPage) : AgreementPage;