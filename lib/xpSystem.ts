// src/lib/xpSystem.ts
import supabase from '@/utils/supabaseClient';

/**
 * Fetch a user's current XP balance.
 * @param userId The UUID of the user
 * @returns number (0 if not found)
 */
export async function getUserXP(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('xp')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[XP] Failed to fetch user XP:', error.message);
    return 0;
  }

  return Number(data?.xp ?? 0);
}

/**
 * Increment a user's XP and log the change to xp_log.
 * 1 XP = $1 mapping is enforced in your runner logic before calling this.
 *
 * @param userId The UUID of the user
 * @param delta The amount of XP to add (positive integer)
 * @param reason Optional reason for logging
 */
export async function updateUserXP(
  userId: string,
  delta: number,
  reason: string = 'engine'
): Promise<void> {
  if (!Number.isFinite(delta) || delta <= 0) {
    console.warn(`[XP] Ignored invalid delta: ${delta}`);
    return;
  }

  // 1) Update the profile's XP balance
  const currentXP = await getUserXP(userId);
  const newXP = currentXP + delta;

  const { error: updErr } = await supabase
    .from('user_profiles')
    .update({ xp: newXP })
    .eq('id', userId);

  if (updErr) {
    console.error('[XP] Failed to update XP balance:', updErr.message);
    return;
  }

  // 2) Insert into xp_log for history/audit purposes
  const { error: logErr } = await supabase.from('xp_log').insert({
    user_id: userId,
    amount: delta,
    reason,
    type: 'engine', // You can adjust type values based on context
    season: 1,
    timestamp: new Date().toISOString(),
  });

  if (logErr) {
    console.error('[XP] Failed to log XP change:', logErr.message);
  } else {
    console.log(`[XP] Added ${delta} XP to ${userId} (reason: ${reason})`);
  }
}