 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import { useRouter } from 'next/router';
import styles from '@/styles/crtLaunch.module.css';

function AgreementPage() {
export default withGuardianGate(Page);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

  try {
    await supabase.from('xp_agreements').insert({
  } catch (error) {
    console.error('❌ Supabase error in agreement.tsx', error);
  }
      user_id: user.id,
      accepted: true,
      timestamp: new Date().toISOString(),
    });

    router.push('/phone-booth');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2 className="text-green-400">📄 FELENA XP SYSTEM AGREEMENT</h2>

      <div className="text-sm text-gray-300 mt-4 space-y-4">
        <p>• XP is a simulated in-app resource. It is not legal currency, but it powers access to services, engines, and performance-based algorithms.</p>

        <p>• Referral XP is earned only when referred users become active and verified. XP gained is based on system activity, not promises of cash value.</p>

        <p>• Cashout is not a withdrawal. XP is routed into trading logic, and profit is made via execution of strategies inside your own linked brokerage account.</p>

        <p>• You acknowledge risk of XP loss through game modes, lottery participation, or staking in unlockable content.</p>

        <p>• Referral trees, jackpots, and leaderboards reset every 90 days to ensure fair and fresh economic cycles.</p>

        <p>• All actions within the Felena System are simulated, logged, and bound to the XP economy which is operator-driven and internally governed.</p>
      </div>

      <div className="mt-6">
        <label className="text-sm text-yellow-400">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mr-2"
          />
          I understand and accept these conditions.
        </label>
      </div>

      <button
        disabled={!accepted || loading}
        onClick={handleAccept}
        className={styles.crtButton + ' mt-4'}
      >
        🔓 Proceed to Phone Booth
      </button>

      <div className={styles.scanlines}></div>
    </div>
  );
}