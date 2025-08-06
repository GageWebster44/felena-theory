
// overrideLogic.ts – Unlockable XP-based override logic

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const OVERRIDE_COST = 25;

export async function isOverrideEnabled(userId: string): Promise<boolean> {
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
}

export async function enableOverride(userId: string): Promise<boolean> {
  // Deduct XP first
  const { error: xpError } = await supabase.rpc('deduct_xp', {
    uid: userId,
    amount: OVERRIDE_COST
  });

  if (xpError) {
    console.error('[XP Deduction Failed]', xpError);
    return false;
  }

  // Activate override flag
  const { error: flagError } = await supabase
    .from('override_status')
    .upsert({ user_id: userId, enabled: true });

  if (flagError) {
    console.error('[Override Flag Failed]', flagError);
    return false;
  }

  return true;
}
