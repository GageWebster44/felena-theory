// src/utils/logCrateUnlock.ts
// Tracks crate unlocks triggered by XP events.

import supabase from '@/utils/supabaseClient';

/**
 * Logs a crate unlock event for a given user and crate tier.
 *
 * @param userId - The ID of the user unlocking the crate
 * @param tier   - The name of the crate tier (e.g., 'Mini', 'Minor', 'Major', 'Max')
 */
export async function logCrateUnlock(userId: string, tier: string): Promise<void> {
  try {
    const { error } = await supabase.from('xp_crates').insert({
      user_id: userId,
      label: `${tier} Crate`,
      xp_value: getXPValueForTier(tier),
      opened: false,
      source: 'milestone',
    });

    if (error) {
      // Bubble for upstream handling while keeping a helpful trace.
      // eslint-disable-next-line no-console
      console.error('[CRATE UNLOCK LOG ERROR]', error);
      throw error;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[CRATE LOG ERROR]', err);
    throw err as Error;
  }
}

/**
 * Returns the XP reward value for each crate tier.
 */
function getXPValueForTier(tier: string): number {
  const values: Record<string, number> = {
    Mini: 50,
    Minor: 100,
    Major: 250,
    Max: 500,
  };

  return values[tier] ?? 100;
}
