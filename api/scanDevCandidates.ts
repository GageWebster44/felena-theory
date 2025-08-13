// pages/api/scanDevCandidates.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Candidate = {
  id: string;
  alias?: string | null;
  xp: number;
  devCandidateStatus?: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow GET (scan) and POST (if you want to trigger manually)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1) Query users who hit XP threshold but aren’t approved devs yet
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, alias, xp, devCandidateStatus')
    .gte('xp', 100000)
    .neq('devCandidateStatus', 'approved');

  if (error) {
    console.error('[AutoPromoteScan] Fetch error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  // 2) Optionally log/flag these candidates (best‑effort)
  for (const user of users ?? []) {
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'auto_promote_ready',
        description: `User ${user.alias ?? user.id} eligible for dev promotion.`,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Supabase error in scanDevCandidates.ts (audit insert):', e);
    }
  }

  return res.status(200).json({
    found: users?.length ?? 0,
    candidates: users ?? [],
  });
}