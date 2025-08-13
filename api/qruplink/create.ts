import type { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '@/utils/withRateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  // TODO: admin/guardian gate, create new QRUplink code
  return res.status(200).json({ ok: true, code: 'STUB-CODE', message: 'QRUplink created (stub).' });
}

export default withRateLimit(handler, { windowMs: 60_000, max: 10 });