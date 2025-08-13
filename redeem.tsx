// pages/redeem.tsx
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import { triggerXPBurst } from '@/utils/triggerXPBurst';
import XPRewardModal from '@/components/XPRewardModal';

function RedeemPage() {
export default withGuardianGate(Page);
  const [redeemableXP, setRedeemableXP] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchXP = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from('user_profiles')
        .select('xp')
        .eq('id', user.id)
        .single();

      setRedeemableXP(data?.xp || 0);
      setLoading(false);
    };

    fetchXP();
  }, []);

  const confirmRedeem = async () => {
    playSound('xp-redeem');
    triggerXPBurst();

  try {
    await supabase.from('xp_redemptions').insert({
  } catch (error) {
    console.error('❌ Supabase error in redeem.tsx', error);
  }
      user_id: userId,
      amount: redeemableXP,
      timestamp: new Date().toISOString(),
    });

    await supabase
      .from('user_profiles')
      .update({ xp: 0 })
      .eq('id', userId);

    setModalOpen(true);
    setConfirmed(true);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🧾 REDEEM XP</h1>

      {loading ? (
        <p>🔄 Loading XP...</p>
      ) : confirmed ? (
        <p style={{ color: '#0f0' }}>✅ Redemption processed!</p>
      ) : (
        <>
          <p>Your XP balance is redeemable through participating operators.</p>
          <p>
            <strong>💸 Available XP:</strong>{' '}
            {redeemableXP.toLocaleString()} XP
          </p>

          <button
            className={styles.crtButton}
            onClick={confirmRedeem}
          >
            🎯 Confirm XP Redemption
          </button>
        </>
      )}

      {modalOpen && (
        <XPRewardModal
          xp={redeemableXP}
          onClose={() => setModalOpen(false)}
          label="XP Redemption Successful"
        />
      )}
    </div>
  );
}