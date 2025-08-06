
// rewardClaimLogger.ts – Logs when user redeems a crate reward

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function logRewardClaim(userId: string, tier: string) {
  const { data, error } = await supabase.from('reward_claims').insert([
    {
      user_id: userId,
      crate_tier: tier,
      claimed_at: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('[REWARD CLAIM ERROR]', error);
  } else {
  }

  return { data, error };
}
