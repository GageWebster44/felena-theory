 import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ DEV BYPASS USER ID — Operator Mode
    const userId = 'fa931643-b0b6-4e70-9144-c8590ac2b9be';

    const { data, error } = await supabase
      .from('engine_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: 'No engine log found' });
    }

    const log = data[0];

    const status = {
      engine: log.engine_name,
      symbol: log.symbol,
      position: log.position,
      xp: log.xp_gain,
      override: log.override,
      pl: log.profit_usd,
      crates: log.crate_count || 0,
    };

    return res.status(200).json(status);
  } catch (err) {
    console.error('[ENGINE STATUS ERROR]', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}