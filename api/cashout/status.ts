import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/utils/withRateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  // TODO: look up last/active cashout for the user
  return res.status(200).json({ ok: true, status: 'pending', message: 'Cashout status (stub).' });
}

export default withRateLimit(handler, { windowMs: 60_000, max: 20 }); // read-only can be looser