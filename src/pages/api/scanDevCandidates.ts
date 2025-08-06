// pages/api/scanDevCandidates.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Query users who hit XP threshold but aren’t approved
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, alias, xp, devCandidateStatus')
    .gte('xp', 100000)
    .neq('devCandidateStatus', 'approved');

  if (error) {
    console.error('[AutoPromoteScan] Failed to fetch:', error.message);
    return res.status(500).json({ error: error.message });
  }

  // Optionally log or flag these candidates
  for (const user of users) {
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in scanDevCandidates.ts', error);
  }
      user_id: user.id,
      action: 'auto_promote_ready',
      description: `User ${user.alias} eligible for dev promotion.`,
    });
  }

  return res.status(200).json({
    found: users.length,
    candidates: users,
  });
}