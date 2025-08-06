 // /lib/crateLogic.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CRATE_TIERS = [
  { xp: 1000, type: 'mini' },
  { xp: 2500, type: 'bonus' },
  { xp: 5000, type: 'override' },
  { xp: 10000, type: 'legendary' },
];

export async function checkAndDropCrate(userId: string, totalXP: number) {
  try {
    const { data: existingDrops } = await supabase
      .from('crate_rewards')
      .select('xp_threshold')
      .eq('user_id', userId);

    const claimedXP = new Set(existingDrops?.map(d => d.xp_threshold));

    for (const { xp, type } of CRATE_TIERS) {
      if (totalXP >= xp && !claimedXP.has(xp)) {
  try {
    await supabase.from('crate_rewards').insert([
  } catch (error) {
    console.error('❌ Supabase error in crateLogic.ts', error);
  }
          {
            user_id: userId,
            xp_threshold: xp,
            crate_type: type,
            triggered_at: new Date().toISOString(),
          }
        ]);

      }
    }
  } catch (err) {
    console.error('[CRATE DROP FAILED]', err);
  }
}