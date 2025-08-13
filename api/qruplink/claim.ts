import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/utils/withRateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  // TODO: validate code, attach to user graph, emit referral event
  return res.status(200).json({ ok: true, message: 'QRUplink claimed (stub).' });
}

export default withRateLimit(handler, { windowMs: 60_000, max: 30 });