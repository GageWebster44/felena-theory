import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'Missing user_id' });
  }

  try {
    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/storage/v1/object/public/audit_exports/user-${user_id}-audit.pdf`;

    const headCheck = await fetch(link, { method: 'HEAD' });
    if (!headCheck.ok) {
      return res.status(404).json({ message: 'PDF not found in storage.' });
    }

    const response = await resend.emails.send({
      from: 'audit@felena.app',
      to: ['admin@felena.app', 'compliance@felena.app'],
      subject: `User Audit PDF Ready — ${user_id}`,
      html: `<p>Download the audit report:</p><p><a href="${link}">${link}</a></p>`
    });

    return res.status(200).json({ message: 'Email sent', id: response.id });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}