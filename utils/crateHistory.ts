// src/utils/crateHistory.ts
import supabase from '@/utils/supabaseClient';

export type CrateHistoryRow = {
  user_id: string;
  crate_tier: string;
  timestamp: string; // ISO string
};

/**
 * Log a crate unlock event for a user.
 */
export async function logCrateUnlock(
  userId: string,
  tier: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { error } = await supabase.from('crate_history').insert([
      {
        user_id: userId,
        crate_tier: tier,
        timestamp: new Date().toISOString(),
      } as CrateHistoryRow,
    ]);

    if (error) {
      console.error('[CRATE LOG ERROR]', error);
      return { ok: false, error: error.message ?? 'Insert failed' };
    }

    return { ok: true };
  } catch (err: any) {
    console.error('[CRATE LOG ERROR]', err);
    return { ok: false, error: err?.message ?? 'Unexpected error' };
  }
}

/**
 * Fetch crate history (most recent first) for a user.
 */
export async function getCrateHistory(userId: string): Promise<CrateHistoryRow[]> {
  try {
    const { data, error } = await supabase
      .from('crate_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[CRATE FETCH ERROR]', error);
      return [];
    }

    // Ensure proper typing
    return (data ?? []) as CrateHistoryRow[];
  } catch (err) {
    console.error('[CRATE FETCH ERROR]', err);
    return [];
  }
}
