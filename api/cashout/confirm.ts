import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/utils/withRateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  // TODO: verify auth + ownership, confirm payout operation
  return res.status(200).json({ ok: true, message: 'Cashout confirm (stub).' });
}

export default withRateLimit(handler, { windowMs: 300_000, max: 3 });