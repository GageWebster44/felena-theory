// src/utils/adminTools.ts
// Small helpers for admin actions that write audit rows to Supabase.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a single client instance. These calls only need anon-level rights.
// If you require elevated privileges for a given call, route it through an API
// route that uses the Service Role key instead.
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type LogXPInjectionResult = { ok: true } | { ok: false; error: string };
export type LogPromotionResult = { ok: true } | { ok: false; error: string };

/**
 * Log an XP injection into xp_log.
 * @param user_id - target user id
 * @param amount  - positive or negative XP adjustment
 * @param reason  - brief reason note
 */
export async function logXPInjection(
  user_id: string,
  amount: number,
  reason: string,
): Promise<LogXPInjectionResult> {
  try {
    // Basic input guardrails
    if (!user_id) return { ok: false, error: 'Missing user_id' };
    if (!Number.isFinite(amount)) return { ok: false, error: 'Invalid amount' };

    const { error } = await supabase.from('xp_log').insert({ user_id, amount, reason });

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    // Keep the same error style you’ve used elsewhere
    // eslint-disable-next-line no-console
    console.error('❌ Supabase error in adminTools.ts (logXPInjection)', err);
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Log a role/status change in employee_promotions.
 * @param user_id     - user being changed
 * @param approver_id - admin who approved the change
 * @param old_status  - previous role/status
 * @param new_status  - new role/status
 */
export async function logPromotion(
  user_id: string,
  approver_id: string,
  old_status: string,
  new_status: string,
): Promise<LogPromotionResult> {
  try {
    if (!user_id || !approver_id) {
      return { ok: false, error: 'Missing user_id or approver_id' };
    }

    const { error } = await supabase
      .from('employee_promotions')
      .insert({ user_id, approver_id, old_status, new_status });

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Supabase error in adminTools.ts (logPromotion)', err);
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Optional generic admin audit helper.
 * Writes an arbitrary event into an admin_audit table if you have one.
 */
export async function logAdminAudit<T extends Record<string, unknown>>(
  event: T & { action: string; actor_id: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { error } = await supabase.from('admin_audit').insert(event);
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Supabase error in adminTools.ts (logAdminAudit)', err);
    return { ok: false, error: (err as Error).message };
  }
}
