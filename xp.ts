// src/utils/xp.ts
// Utilities for reading a user's XP balance

import supabase from '@/utils/supabaseClient';

type XpRow = {
  amount: number | null;
};

export async function getXP(userId: string): Promise<number> {
  if (!userId) {
    console.warn('[getXP] Missing userId');
    return 0;
  }

  try {
    // No generics on `.from()` — avoids TS2558 across supabase-js versions.
    const { data, error } = await supabase
      .from('xp_balance')
      .select('amount')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[xp.ts] Supabase error in getXP:', error.message);
      return 0;
    }

    const amt = (data as XpRow | null)?.amount ?? 0;
    return Number.isFinite(amt) ? Math.max(0, Number(amt)) : 0;
  } catch (err) {
    console.error('[xp.ts] Unexpected error in getXP:', (err as Error).message);
    return 0;
  }
}

/** Returns true if the user has at least `requiredXP` XP. */
export async function hasEnoughXP(userId: string, requiredXP: number): Promise<boolean> {
  const currentXP = await getXP(userId);
  return currentXP >= requiredXP;
}