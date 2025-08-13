// pages/api/log-preorder.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '@/utils/supabaseClient';

type Body = {
  email?: string;
  referral_code?: string;
};

type SuccessPayload = { success: true };
type ErrorPayload = { error: string };

function getClientIp(req: NextApiRequest): string {
  const xfwd = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();

  const socketIp: string | undefined = req.socket?.remoteAddress;
  return xfwd || socketIp || 'unknown';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessPayload | ErrorPayload>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, referral_code }: Body = (req.body ?? {}) as Body;
  const origin_ip = getClientIp(req);
  const user_agent = (req.headers['user-agent'] as string | undefined) ?? 'unknown';

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Cap check: stop at 100 signups
  const { count, error: countErr } = await supabase
    .from('preorder_interest')
    .select('id', { count: 'exact', head: true });

  if (countErr) {
    return res.status(500).json({ error: countErr.message });
  }
  if ((count ?? 0) >= 100) {
    return res.status(403).json({ error: 'Preorder cap reached. 100 slots filled.' });
  }

  // Insert row
  const { error } = await supabase.from('preorder_interest').insert({
    email: email.toLowerCase().trim(),
    referral_code: referral_code ?? null,
    origin_ip,
    user_agent,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}