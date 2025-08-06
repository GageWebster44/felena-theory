import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';
import { generateUserPDF } from '@/utils/export-user-pdf';

function UserAuditPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [xpLogs, setXpLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const fetchData = async () => {
    if (!user_id) return;
    setLoading(true);

    const [xp, audit, referral, redeem, prof, flagCheck] = await Promise.all([
      supabase.from('xp_log').select('*').eq('user_id', user_id).order('timestamp', { ascending: false }),
      supabase.from('audit_logs').select('*').ilike('action', `%${user_id}%`).order('timestamp', { ascending: false }),
      supabase.from('referral_logs').select('*').or(`referrer_email.eq.${user_id},referred_email.eq.${user_id}`).order('timestamp', { ascending: false }),
      supabase.from('xp_redemptions').select('*').eq('user_id', user_id).order('timestamp', { ascending: false }),
      supabase.from('user_profiles').select('*').eq('id', user_id).single(),
      supabase.from('audit_logs').select('*').ilike('action', `%Flagged user ${user_id}%`)
    ]);

    const logs = xp.data || [];
    const highXP = logs.filter(l => l.xp >= 1000);
    const spikes = logs.filter((l, i) => i > 0 && l.xp > 3 * logs[i - 1].xp);
    const repeatReasons = {};
    logs.forEach(l => {
      repeatReasons[l.reason] = (repeatReasons[l.reason] || 0) + 1;
    });
    const repeated = Object.entries(repeatReasons).filter(([_, count]) => count >= 3);
    const scoreCalc = highXP.length * 2 + repeated.length + spikes.length;

    setXpLogs(logs);
    setAuditLogs(audit.data || []);
    setReferrals(referral.data || []);
    setRedemptions(redeem.data || []);
    setProfile(prof.data || null);
    setScore(scoreCalc);
    setFlagged((flagCheck.data || []).length > 0);
    setLoading(false);
  };

  const handlePDF = async () => {
    const pdfBlob = await generateUserPDF({
      id: user_id as string,
      alias: profile?.alias || 'N/A',
      role: profile?.role || '—',
      xp: profile?.xp || 0,
      locked_xp: profile?.locked_xp || 0,
      echomindScore: score,
      logs: xpLogs.map(l => ({ timestamp: l.timestamp, xp: l.xp, reason: l.reason })),
      redemptions: redemptions.map(r => ({ timestamp: r.timestamp, redeemed_xp: r.redeemed_xp, payout_status: r.payout_status })),
      referrals: referrals.map(ref => ({ timestamp: ref.timestamp, referrer_email: ref.referrer_email, referred_email: ref.referred_email }))
    });

    const { data, error } = await supabase.storage.from('audit_exports').upload(`user-${user_id}-audit.pdf`, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in [user_id].tsx', error);
  }
      user_id: 'archivus',
      action: `PDF export generated and stored for user ${user_id}`,
      timestamp: new Date().toISOString()
    });

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in [user_id].tsx', error);
  }
      user_id: 'delta',
      action: `Email sent to admin regarding PDF audit for user ${user_id}`,
      timestamp: new Date().toISOString()
    });
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in [user_id].tsx', error);
  }
      user_id: 'archivus',
      action: `PDF export generated for user ${user_id}`,
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchData();
  }, [user_id]);

  return (
    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Operator Audit: {user_id}</h1>

      {loading ? <p className={styles.crtText}>Loading...</p> : (
        <>
          {profile && (
            <pre className={styles.crtText}>
              Alias: {profile.alias}{'\n'}XP: {profile.xp}{'\n'}Locked XP: {profile.locked_xp || 0}{'\n'}Role: {profile.role || '—'}{score !== null ? `\nEchoMind Score: ${score}` : ''}{flagged ? '\nStatus: ⚠️ Flagged' : ''}
            </pre>
          )}

          <div className={styles.crtMenu}>
            <button onClick={handlePDF} className={styles.crtButton}>📄 Export Audit PDF</button>
          </div>

          <h2 className={styles.crtTitle}>XP Log</h2>
          <div className={styles.crtScrollBox}>
            {xpLogs.map((log, i) => (
              <pre key={i} className={styles.crtLogBlock}>
                {log.timestamp} — +{log.xp} XP — {log.reason}
              </pre>
            ))}
          </div>

          <h2 className={styles.crtTitle}>Redemptions</h2>
          <div className={styles.crtScrollBox}>
            {redemptions.map((r, i) => (
              <pre key={i} className={styles.crtText}>
                {r.timestamp} — {r.redeemed_xp} XP — Status: {r.payout_status || 'pending'}
              </pre>
            ))}
          </div>

          <h2 className={styles.crtTitle}>Referral Activity</h2>
          <div className={styles.crtScrollBox}>
            {referrals.map((ref, i) => (
              <pre key={i} className={styles.crtText}>
                {ref.timestamp} — {ref.referrer_email} → {ref.referred_email} | IP: {ref.ip_address || 'N/A'}
              </pre>
            ))}
          </div>

          <h2 className={styles.crtTitle}>Audit Log Mentions</h2>
          <div className={styles.crtScrollBox}>
            {auditLogs.map((entry, i) => (
              <pre key={i} className={styles.crtText}>
                {entry.timestamp} — {entry.action}
              </pre>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default withAdminGate(UserAuditPage);
