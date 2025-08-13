// src/utils/updateXP.ts
// Logs XP to Supabase ledger and updates the user's wallet/profile XP.

import { logDailyXP } from './dailyLogger';
import { logSessionEvent } from './logSessionToSupabase';
import supabase from './supabaseClient';
import { checkCashoutStatus } from './xpCashoutTrigger';
import { checkXPMilestones } from './xpMilestoneTracker';

export default async function updateXP(
  userId: string,
  amount: number,
  source: string = 'engine',
): Promise<number | null> {
  try {
    if (!userId || Number.isNaN(amount)) {
      console.warn('[updateXP] Invalid input:', { userId, amount });
      return null;
    }

    // 1) Write to XP ledger
    const { error: insertErr } = await supabase
      .from('xp_ledger')
      .insert([{ user_id: userId, amount, source }]);

    if (insertErr) throw insertErr;

    // 2) Read current XP
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('xp')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      throw profileErr || new Error('Profile not found');
    }

    const newXP = (profile.xp || 0) + amount;

    // 3) Persist wallet XP
    const { error: updateErr } = await supabase
      .from('user_profiles')
      .update({ xp: newXP })
      .eq('id', userId);

    if (updateErr) throw updateErr;

    // 4) Daily totals (idempotent upsert by day)
    await logDailyXP(userId, amount);

    // 5) Check milestone triggers (e.g., crates/tiers)
    const hits = await checkXPMilestones(amount);
    if (Array.isArray(hits) && hits.length > 0) {
      // (Optional) you might fan out notifications here
    }

    // 6) Optional session log (keeps analytics loop alive)
    await logSessionEvent({
      userId,
      engine: source,
      xp: amount,
      signalCount: 1,
      overrideActive: false,
    });

    // 7) Evaluate cashout eligibility (non-blocking usage here)
    // Use/await result if your UI needs to reflect it immediately.
    await checkCashoutStatus(amount);

    return newXP;
  } catch (err) {
    console.error('[XP UPDATE ERROR]', err);
    return null;
  }
}
