/ dailyLogger.ts – Tracks XP earned per day for stats, limits, and progression

import { supabase } from '@/utils/supabaseClient';

/**
 * Logs XP into the daily_xp_totals table.
 * Ensures only one entry per user per day is stored via upsert.
 */
export async function logDailyXP(userId: string, amount: number) {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const { data, error } = await supabase
    .from('daily_xp_totals')
    .upsert([{ user_id: userId, date: today, xp: amount }], {
      onConflict: ['user_id', 'date'],
    });

  if (error) {
    console.error('[DAILY XP LOG ERROR]', error);
  } else {
  }

  return { data, error };
}

/**
 * Fetches the current day's XP total for a user.
 */
export async function getTodayXP(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_xp_totals')
    .select('xp')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error || !data) {
    console.warn(`[DAILY XP FETCH] No XP logged for ${userId} today`);
    return 0;
  }

  return data.xp;
}