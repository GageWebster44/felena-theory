import { useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { markOnboardingStep } from '@/utils/onboarding-progress';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';

function Onboard() {
  const user = useUser();
  const [onboarding, setOnboarding] = useState(null);

  useEffect(() => {
    document.title = 'Welcome to Felena Theory';
    if (user) {
      supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'Viewed onboard page',
        timestamp: new Date().toISOString()
      });
      markOnboardingStep(user.id, 'reviewed_manual');
      supabase.from('user_onboarding').select('*').eq('user_id', user.id).single()
        .then(({ data }) => {
          setOnboarding(data);
          if (data?.completed && !data?.welcome_sent) {
            fetch('/api/send-welcome-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id })
            });
            supabase.from('user_onboarding').update({ welcome_sent: true }).eq('user_id', user.id);
          }
        });
    }
  }, [user]);

  return (
    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Welcome, Operator</h1>

      <div className={styles.crtScrollBox}>
        <p className={styles.crtText}>You’ve been cleared for entry into the Felena Theory system.</p>

        <pre className={styles.crtText}>
          Name: {user?.user_metadata?.alias || user?.email}
          {'\n'}User ID: {user?.id || '—'}
          {'\n'}Role: {user?.user_metadata?.role || 'pending'}
        </pre>

        <h2 className={styles.crtTitle}>Operator Manual</h2>
        <p className={styles.crtText}>
          Please review the following documents:
          {'\n'}• <a href="/storage/v1/object/public/documents/operator-manual.pdf" target="_blank">Operator Manual</a>
          {'\n'}• <a href="/terms" target="_blank">Terms of Compliance</a>
        </p>

        <h2 className={styles.crtTitle}>Your Dashboard</h2>
        <p className={styles.crtText}>
          When you’re ready:
          {'\n'}• <a href="/admin-dashboard">Open Admin Dashboard</a>
          {'\n'}• <a href="/cases">Review Open Cases</a>
          {'\n'}• <a href="/ai-agents">Monitor EchoMind Agents</a>
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
            <h2 className={styles.crtTitle}>✅ You are now fully cleared as an Operator</h2>
            <p className={styles.crtText}>
              You’ve completed all onboarding steps. The system has logged your clearance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminGate(Onboard);
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ message: 'Missing user_id' });

  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    const link = `${site}/audit/${user_id}`;

    const response = await resend.emails.send({
      from: 'felena@felena.app',
      to: ['admin@felena.app', 'compliance@felena.app'],
      subject: `✅ Operator Onboarding Complete — ${user_id}`,
      html: `<p>User <strong>${user_id}</strong> has completed onboarding.</p>
             <p><a href="${link}">View audit profile</a></p>`
    });

    // ✅ Log confirmation to audit_logs
    await fetch(`${site}/api/log-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'delta',
        action: `Welcome email sent for ${user_id}`,
        timestamp: new Date().toISOString()
      })
    });

    return res.status(200).json({ message: 'Welcome email sent', id: response.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}