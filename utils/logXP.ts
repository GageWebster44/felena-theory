// src/utils/logXP.ts
import { supabase } from '@/utils/supabaseClient';

/**
 * Logs an XP event for the **current authenticated user**.
 *
 * @param type        Source/type of the XP event (e.g., 'mission', 'shop_purchase', 'bonus').
 * @param amount      Amount of XP gained (use negative for deductions).
 * @param description Optional human‑readable note for the log row.
 */
export default async function logXP(type: string, amount: number, description = ''): Promise<void> {
  try {
    // Get the currently signed-in user from Supabase
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      console.warn('[logXP] No user in session or auth error:', authError?.message);
      return;
    }

    const payload = {
      user_id: authData.user.id,
      amount,
      type,
      description,
      created_at: new Date().toISOString(),
      season: 1, // tweak if you version seasons
    };

    const { error: insertError } = await supabase.from('xp_history').insert([payload]);

    if (insertError) {
      console.error('[logXP] Insert failed:', insertError.message);
    }
  } catch (err) {
    // keep broad catch for runtime safety; avoid `any` by narrowing
    const message = err instanceof Error ? err.message : String(err);
    console.error('[logXP] Unexpected error:', message);
  }
}
