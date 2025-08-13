import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/utils/withRateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  // TODO: verify auth, check balance, create cashout request row
  return res.status(200).json({ ok: true, message: 'Cashout request accepted (stub).' });
}

export default withRateLimit(handler, { windowMs: 300_000, max: 3 }); // 3 per 5 minutes