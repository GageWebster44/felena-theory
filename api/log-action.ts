// pages/api/log-action.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import seAdmin from '../../src/utils/supabaseAdmin';

type Body = {
  user_id?: string;
  action?: string;
  timestamp?: string; // ISO string (optional)
};

type Ok = { ok: true; message: string };
type Fail = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Fail>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { user_id, action, timestamp } = (req.body ?? {}) as Body;

  if (!user_id || !action) {
    return res
      .status(400)
      .json({ ok: false, error: 'Missing required fields: user_id or action' });
  }

  try {
    const { error } = await seAdmin.from('audit_logs').insert({
      user_id,
      action,
      timestamp: timestamp || new Date().toISOString(),
    });

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res
      .status(200)
      .json({ ok: true, message: 'Action logged successfully' });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Unknown error logging action';
    return res.status(500).json({ ok: false, error: msg });
  }
}