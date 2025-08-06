import { supabase } from './supabaseClient';

/**
 * Logs an XP event for the current authenticated user.
 * @param type - The source of the XP event (e.g., 'mission', 'shop_purchase').
 * @param amount - The amount of XP gained or lost.
 * @param description - Optional human-readable description for the log.
 */
export async function logXP(type: string, amount: number, description = '') {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
      console.warn(`[logXP] XP log failed: no user found or auth error`, error);
      return;
    }

    const payload = {
      user_id: user.id,
      amount,
      type,
      description,
      created_at: new Date().toISOString(),
      season: 1, // adjust as needed for seasonal systems
    };

    const { error: insertError } = await supabase.from('xp_history').insert([payload]);

    if (insertError) {
      console.error('[logXP] XP log insert error:', insertError);
    } else {
    }
  } catch (err) {
    console.error('[logXP] Unexpected error during XP logging:', err);
  }
}