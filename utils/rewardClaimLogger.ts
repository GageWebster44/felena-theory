// src/utils/rewardClaimLogger.ts
// Logs when a user redeems (claims) a crate reward

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
);

export type RewardClaimRow = {
  user_id: string;
  crate_tier: string;
  claimed_at: string; // ISO timestamp
};

/**
 * Insert a reward claim record for the given user and crate tier.
 */
export async function logRewardClaim(
  userId: string,
  tier: string,
): Promise<{ data: RewardClaimRow | null; error: unknown | null }> {
  try {
    const { data, error } = await supabase
      .from('reward_claims')
      .insert<RewardClaimRow>([
        {
          user_id: userId,
          crate_tier: tier,
          claimed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[REWARD CLAIM ERROR]', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('[REWARD CLAIM ERROR]', err);
    return { data: null, error: err };
  }
}

export default logRewardClaim;
