// src/utils/dailyLogger.ts
// Tracks XP per day for stats, limits, and progression.

import supabase from '@/utils/supabaseClient';

export type DailyXPRow = {
  id: string;
  user_id: string;
  /** YYYY-MM-DD (UTC) */
  date: string;
  xp: number;
};

const todayISODate = (): string => new Date().toISOString().slice(0, 10);

/**
 * Add XP to today's total for a user.
 * Creates the row if it doesn't exist; otherwise increments it.
 */
export async function logDailyXP(
  userId: string,
  amount: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  const today = todayISODate();

  // 1) Read current total (if any)
  const { data: existing, error: readErr } = await supabase
    .from('daily_xp_totals')
    .select('id,xp')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle<Pick<DailyXPRow, 'id' | 'xp'>>();

  if (readErr && readErr.code !== 'PGRST116') {
    // PGRST116 => no rows found with maybeSingle()
    console.warn('[DAILY XP READ WARN]', readErr.message);
  }

  // 2) Insert or update
  if (existing?.id) {
    const { error: updErr } = await supabase
      .from('daily_xp_totals')
      .update({ xp: (existing.xp ?? 0) + amount })
      .eq('id', existing.id);

    if (updErr) {
      console.error('[DAILY XP UPDATE ERROR]', updErr.message);
      return { ok: false, error: updErr.message };
    }
  } else {
    const { error: insErr } = await supabase.from('daily_xp_totals').insert({
      user_id: userId,
      date: today,
      xp: amount,
    } as Partial<DailyXPRow>);

    if (insErr) {
      console.error('[DAILY XP INSERT ERROR]', insErr.message);
      return { ok: false, error: insErr.message };
    }
  }

  return { ok: true };
}

/**
 * Fetch today's XP total for a user (0 if no row exists).
 */
export async function getTodayXP(userId: string): Promise<number> {
  const today = todayISODate();

  const { data, error } = await supabase
    .from('daily_xp_totals')
    .select('xp')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle<{ xp: number }>();

  if (error) {
    console.warn('[DAILY XP FETCH WARN]', error.message);
    return 0;
  }

  return data?.xp ?? 0;
}