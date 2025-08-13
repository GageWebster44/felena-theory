import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/utils/withRateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  // TODO: check if code exists/valid/available
  const { code } = req.query;
  return res.status(200).json({ ok: true, code, valid: true, message: 'QRUplink validation (stub).' });
}

export default withRateLimit(handler, { windowMs: 60_000, max: 60 });