import { supabase } from '@/utils/supabaseClient';
import { logXP } from './logXP';
import { triggerXPBurst } from './triggerXPBurst';
import { playCrateSound } from './playCrateSound';

export default async function openCrate(
  userId: string,
  label: string,
  xpValue: number,
  source: string
) {
  try {
    // ✅ Step 1: Log XP
  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in crate_reward_logic.ts', error);
  }
      user_id: userId,
      amount: xpValue,
      reason: `crate_open: ${label}`,
      timestamp: new Date().toISOString(),
      season: 1
    });

    // ✅ Step 2: Update user XP in profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('xp')
      .eq('id', userId)
      .single();

    const newXP = (profile?.xp || 0) + xpValue;

    await supabase
      .from('user_profiles')
      .update({ xp: newXP })
      .eq('id', userId);

    // ✅ Step 3: Update crate status
    await supabase
      .from('xp_crates')
      .update({ opened: true })
      .eq('user_id', userId)
      .eq('label', label)
      .eq('xp_value', xpValue)
      .eq('source', source)
      .order('created_at', { ascending: false })
      .limit(1);

    // ✅ Step 4: Audio + UI feedback
    triggerXPBurst();
    playCrateSound(label.toLowerCase());

    // ✅ Step 5: XP history log
    await logXP('xp_crate', xpValue, `Opened ${label} crate from ${source}`);

    return { success: true, label, xp_value: xpValue };
  } catch (err) {
    console.error('[CRATE OPEN ERROR]', err);
    return { success: false };
  }
}