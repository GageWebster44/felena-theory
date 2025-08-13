// src/lib/crateLogic.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

// ---- Crate tiers that trigger one-time crate drops ----
export type CrateType = 'mini' | 'bonus' | 'override' | 'legendary';

const CRATE_TIERS: ReadonlyArray<{ xp: number; type: CrateType }> = [
  { xp: 1000, type: 'mini' },
  { xp: 2500, type: 'bonus' },
  { xp: 5000, type: 'override' },
  { xp: 10000, type: 'legendary' },
];

// Row shape for crate_rewards (adjust if your schema differs)
type CrateRewardRow = {
  user_id: string;
  xp_threshold: number;
  crate_type: CrateType;
  triggered_at: string; // ISO timestamp
};

/**
 * If the user's cumulative XP crosses any tier they haven't already claimed,
 * create a crate reward row for each newly reached tier.
 */
export async function checkAndDropCrate(userId: string, totalXP: number): Promise<void> {
  try {
    // What tiers has this user already been granted?
    const { data: existingRows, error: fetchErr } = await supabase
      .from('crate_rewards')
      .select<'xp_threshold', { xp_threshold: number }>('xp_threshold')
      .eq('user_id', userId);

    if (fetchErr) throw fetchErr;

    const claimedXP = new Set<number>((existingRows ?? []).map((r) => Number(r.xp_threshold))); // Grant crates for any newly crossed thresholds

    for (const { xp, type } of CRATE_TIERS) {
      const crossed = totalXP >= xp;
      const alreadyClaimed = claimedXP.has(xp);
      if (!crossed || alreadyClaimed) continue;

      const insertRow: CrateRewardRow = {
        user_id: userId,
        xp_threshold: xp,
        crate_type: type,
        triggered_at: new Date().toISOString(),
      };

      const { error: insertErr } = await supabase.from('crate_rewards').insert(insertRow);

      if (insertErr) {
        // Log but do not throw so we still attempt remaining tiers
        // eslint-disable-next-line no-console
        console.error('✖ Supabase insert error in crateLogic.ts', insertErr);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('✖ [CRATE DROP FAILED]', err);
  }
}
