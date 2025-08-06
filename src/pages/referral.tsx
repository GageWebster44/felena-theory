import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import QRCode from 'qrcode.react';
import playSound from '@/utils/playSound';

function ReferralPage() {
export default withGuardianGate(Page);
  const [userId, setUserId] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [inviteCount, setInviteCount] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://felena.app';

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

      const code = profile?.referral_code || user.id.slice(0, 6);
      setReferralCode(code);

      const { data: invites } = await supabase
        .from('referral_logs')
        .select('*')
        .eq('ref_code', code);

      setInviteCount(invites?.length || 0);
      setEarnedXP((invites?.length || 0) * 25); // 25 XP per invite (configurable)
    })();
  }, []);

  const referralLink = `${appUrl}/login?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    playSound('confirm');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🔗 REFERRAL COMMAND</h2>
      <p>Invite others to join Felena. Build your chain. Earn XP from their actions.</p>

      <div className={styles.crtGridContainer}>
        <div className={styles.crtPanelTile}>
          <div className="text-sm">Your Referral Link:</div>
          <input
            value={referralLink}
            readOnly
            className={styles.crtInput}
            style={{ marginBottom: '0.5rem' }}
          />
          <button className={styles.crtButton} onClick={handleCopy}>
            📋 {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <div className={styles.crtPanelTile}>
          <div className="text-sm">Your QR Code:</div>
          <QRCode value={referralLink} size={180} fgColor="#00ff99" bgColor="#000" />
        </div>
      </div>

      <div className="mt-6">
        <h3>📊 Referral Stats</h3>
        <p>🔗 Total Invites: {inviteCount}</p>
        <p>🎁 XP Earned from Invites: {earnedXP}</p>
      </div>

      <div className={styles.scanlines}></div>
    </div>
  );
}