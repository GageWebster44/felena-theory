// src/utils/withRateLimit.ts
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from '@/utils/rateLimit';

export type LimitCfg = { windowMs: number; max: number; key?: string };

export function withRateLimit(handler: NextApiHandler, cfg: LimitCfg): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const verdict = rateLimit(req as any, cfg);
    if (!verdict.ok) {
      res.setHeader('Retry-After', Math.ceil(verdict.resetMs / 1000));
      return res.status(429).json({ error: 'Too Many Requests' });
    }
    return handler(req, res);
  };
}