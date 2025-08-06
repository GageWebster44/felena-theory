/ updateXP.ts – Logs XP to Supabase ledger and updates user wallet

import { supabase } from './supabaseClient';
import { logDailyXP } from './dailyLogger';
import { checkXPMilestones } from './xpMilestoneTracker';
import { logSessionEvent } from './logSessionToSupabase';
import { checkCashoutStatus } from './xpCashoutTrigger';

export async function updateXP(userId: string, amount: number, source: string = 'engine') {
  try {
    if (!userId || isNaN(amount)) {
      console.warn('[updateXP] Invalid input:', { userId, amount });
      return;
    }

    // Log to ledger
    const { error: insertErr } = await supabase
      .from('xp_ledger')
      .insert([{ user_id: userId, amount, source }]);

    if (insertErr) throw insertErr;

    // Fetch current XP
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('xp')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) throw profileErr || new Error('Profile not found');

    const newXP = (profile.xp || 0) + amount;

    // Update wallet XP
    const { error: updateErr } = await supabase
      .from('user_profiles')
      .update({ xp: newXP })
      .eq('id', userId);

    if (updateErr) throw updateErr;

    // Trigger daily log
    await logDailyXP(userId, amount);

    // Trigger milestone checks
    const hits = checkXPMilestones(amount);
    if (hits.length > 0) {
    }

    // Optional: log session event
    await logSessionEvent({
      userId,
      engine: source,
      xp: amount,
      signalCount: 1,
      overrideActive: false
    });

    // Check if eligible for cashout
    const cashout = checkCashoutStatus(amount);
    if (cashout.eligible) {
      // Optionally notify front-end with modal trigger
    }

    return newXP;
  } catch (err) {
    console.error('[XP UPDATE ERROR]', err);
    return null;
  }
}