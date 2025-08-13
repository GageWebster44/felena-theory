// pages/api/send-audit-emails.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

type Ok = { ok: true; id: string };
type Err = { ok: false; error: string };

type Body = {
  user_id: string;   // recipient we're emailing about
  to?: string;       // optional override for recipient address
};

// Init Resend (ensure RESEND_API_KEY is set)
const resend = new Resend(process.env.RESEND_API_KEY ?? '');

function getSiteUrl(): string {
  // Prefer explicit site URL; fall back to Vercel URL; finally localhost for dev
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  return explicit || vercel || 'http://localhost:3000';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { user_id, to } = (req.body ?? {}) as Partial<Body>;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ ok: false, error: 'Missing user_id' });
    }

    // Build the public storage link to the audit PDF
    const siteUrl = getSiteUrl();
    // Adjust the path below if your bucket/path differ
    const link = `${siteUrl}/storage/v1/object/public/audit_exports/user-${encodeURIComponent(
      user_id
    )}-audit.pdf`;

    // Make sure the file exists before emailing
    const head = await fetch(link, { method: 'HEAD' });
    if (!head.ok) {
      return res
        .status(404)
        .json({ ok: false, error: 'Audit PDF not found in storage' });
    }

    // Compose the email
    const toAddress =
      to ??
      'admin@felena.app'; // default recipient; change to whatever makes sense
    const fromAddress =
      'audit@felena.app'; // must be a verified domain/sender in Resend

    const subject = `Audit PDF Ready – ${user_id}`;
    const html = `
      <p>Download the audit report for <strong>${user_id}</strong>:</p>
      <p><a href="${link}">${link}</a></p>
    `;

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject,
      html,
    });

    if (error || !data?.id) {
      return res
        .status(500)
        .json({ ok: false, error: error?.message ?? 'Failed to send email' });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: (err as Error).message ?? 'Unknown error' });
  }
}