// pages/onboard.tsx
import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { markOnboardingStep } from '@/utils/onboarding-progress';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';

function Onboard() {
  const user = useUser();
  const [onboarding, setOnboarding] = useState<any>(null);
  const [nextBadge, setNextBadge] = useState<any>(null);

  useEffect(() => {
    document.title = 'Welcome to Felena Theory';

    if (!user) return;

    const run = async () => {
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in onboard.tsx', error);
  }
        user_id: user.id,
        action: 'Viewed onboard page',
        timestamp: new Date().toISOString()
      });

      await markOnboardingStep(user.id, 'reviewed_manual');

  try {
    const { data } = await supabase.from('user_onboarding').select('*').eq('user_id', user.id).single();
  } catch (error) {
    console.error('❌ Supabase error in onboard.tsx', error);
  }
      setOnboarding(data);

      if (data?.completed && !data.welcome_sent) {
        await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });

  try {
    await supabase.from('user_onboarding').update({
  } catch (error) {
    console.error('❌ Supabase error in onboard.tsx', error);
  }
          welcome_sent: true,
          promoted_at: new Date().toISOString()
        }).eq('user_id', user.id);

  try {
    await supabase.from('user_profiles').update({ role: 'moderator' }).eq('id', user.id);
  } catch (error) {
    console.error('❌ Supabase error in onboard.tsx', error);
  }

  try {
    await supabase.from('user_badges').insert({
  } catch (error) {
    console.error('❌ Supabase error in onboard.tsx', error);
  }
          user_id: user.id,
          label: 'Operator Badge',
          source: 'onboarding',
          timestamp: new Date().toISOString()
        });

        await fetch('/api/log-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'delta',
            action: `Auto-promoted ${user.id} to moderator after onboarding`,
            timestamp: new Date().toISOString()
          })
        });
      }

      // Tier tracking
      const [referrals, crates, missions, engines] = await Promise.all([
        supabase.from('referrals').select('id').eq('referrer_id', user.id),
        supabase.from('xp_crates').select('id').eq('user_id', user.id),
        supabase.from('user_profiles').select('missions_claimed').eq('id', user.id).single(),
        supabase.from('unlocked_engines').select('id').eq('user_id', user.id)
      ]);

      const ladder = [
        { label: '🔗 Connect Commander', current: referrals.data?.length || 0, goal: 5 },
        { label: '📦 Crate Collector', current: crates.data?.length || 0, goal: 3 },
        { label: '🎯 Mission Veteran', current: missions.data?.missions_claimed || 0, goal: 10 },
        { label: '🧠 Grid Explorer', current: engines.data?.length || 0, goal: 10 }
      ];

      const next = ladder.find(b => b.current < b.goal);
      if (next) setNextBadge(next);
    };

    run();
  }, [user]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Welcome, Operator</h1>

      <div className={styles.crtScrollBox}>
        <p className={styles.crtText}>You’ve been cleared for entry into the Felena Theory system.</p>
        <pre className={styles.crtText}>
          Name: {user?.user_metadata?.alias || user?.email}
          {'\n'}User ID: {user?.id}
          {'\n'}Role: {user?.user_metadata?.role || 'pending'}
        </pre>

        <h2 className={styles.crtTitle}>Operator Manual</h2>
        <p className={styles.crtText}>
          Please review:
          {'\n'}• <a href="/storage/v1/object/public/documents/operator-manual.pdf" target="_blank">Operator Manual</a>
          {'\n'}• <a href="/terms" target="_blank">Terms of Compliance</a>
        </p>

        <h2 className={styles.crtTitle}>Your Dashboard</h2>
        <p className={styles.crtText}>
          • <a href="/admin-dashboard">Admin Dashboard</a>
          {'\n'}• <a href="/cases">Open Cases</a>
          {'\n'}• <a href="/ai-agents">EchoMind Console</a>
        </p>

        <h2 className={styles.crtTitle}>Onboarding Checklist</h2>
        <ul className={styles.crtText}>
          <li>✅ Reviewed Operator Manual</li>
          <li>✅ Accepted Terms of Compliance</li>
          <li>✅ Accessed Admin Dashboard</li>
          <li>✅ Viewed EchoMind Console</li>
          <li>✅ Visited Case Tracker</li>
        </ul>

        {onboarding?.completed && (
          <div className={styles.crtCard}>
            <h2 className={styles.crtTitle}>✅ Fully Cleared</h2>
            <p className={styles.crtText}>Your onboarding is complete. Badge awarded. Role updated.</p>
          </div>
        )}

        {nextBadge && (
          <div className={styles.crtCard}>
            <h2 className={styles.crtTitle}>🧬 Next Tier: {nextBadge.label}</h2>
            <p className={styles.crtText}>{nextBadge.current} / {nextBadge.goal} — {nextBadge.goal - nextBadge.current} to go</p>
            <div style={{ background: '#111', border: '1px solid #0f0', height: '10px', width: '100%', borderRadius: '6px', marginTop: '4px' }}>
              <div style={{
                background: '#0f0',
                height: '100%',
                width: `${Math.min((nextBadge.current / nextBadge.goal) * 100, 100)}%`,
                transition: 'width 0.4s ease-in-out'
              }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminGate(Onboard);