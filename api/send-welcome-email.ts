// pages/api/send-welcome-email.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST only
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { user_id } = req.body as { user_id?: string };

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ message: 'Missing user_id' });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const link = `${site}/audit/${encodeURIComponent(user_id)}`;

    // Send the email
    const response = await resend.emails.send({
      from: 'felena@felena.app',
      to: ['admin@felena.app', 'compliance@felena.app'],
      subject: `✅ Operator Onboarding Complete — ${user_id}`,
      html: `
        <p><strong>User ${user_id}</strong> has completed onboarding.</p>
        <p><a href="${link}">View audit profile</a></p>
      `,
    });

    // Log confirmation to audit logs (through your existing API)
    try {
      await fetch(`${site}/api/log-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'delta',
          action: `Welcome email sent for ${user_id}`,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (logErr) {
      // Non-fatal: email already sent; just note the failure on server logs
      console.error('Audit log write failed in send-welcome-email.ts:', logErr);
    }

    return res.status(200).json({ message: 'Welcome email sent', id: response?.data?.id ?? null });
  } catch (error: any) {
    console.error('send-welcome-email.ts error:', error);
    return res.status(500).json({ error: error?.message ?? 'Unknown error' });
  }
}