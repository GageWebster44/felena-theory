// src/utils/overrideLogic.ts
// Unlockable XP-based override logic

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
);

const OVERRIDE_COST = 25;

/**
 * Returns whether the override is currently enabled for a user.
 */
export async function isOverrideEnabled(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('override_status')
      .select('enabled')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[Override Check Error]', error);
      return false;
    }

    return data?.enabled === true;
  } catch (err) {
    console.error('[Override Check Unexpected]', err);
    return false;
  }
}

/**
 * Deducts XP and enables the user's override flag.
 * Uses a Postgres function `deduct_xp(uid uuid, amount int)` you created.
 */
export async function enableOverride(userId: string): Promise<boolean> {
  try {
    // 1) Deduct XP first
    const { error: xpError } = await supabase.rpc('deduct_xp', {
      uid: userId,
      amount: OVERRIDE_COST,
    });

    if (xpError) {
      console.error('[XP Deduction Failed]', xpError);
      return false;
    }

    // 2) Activate override flag
    const { error: flagError } = await supabase
      .from('override_status')
      .upsert({ user_id: userId, enabled: true });

    if (flagError) {
      console.error('[Override Flag Failed]', flagError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Enable Override Unexpected]', err);
    return false;
  }
}
