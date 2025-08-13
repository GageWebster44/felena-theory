// src/utils/crate_reward_logic.ts
// Open a crate for a user and apply rewards (XP, crate bookkeeping, UX hooks)

import supabase from '@/utils/supabaseClient';
import logXP from './logXP';

/** Result returned to the caller */
export type OpenCrateResult = {
  success: true;
  label: string;
  xp_value: number;
} | {
  success: false;
  error?: string;
};

/**
 * Optional UX hooks. If you have real implementations in the app shell,
 * keep those there and these no-ops will be tree‑shaken on the API build.
 */
async function triggerXPBurst(): Promise<void> { /* no-op in API build */ }
function playCrateSound(_label: string): void { /* no-op in API build */ }

/**
 * Open a crate and apply its effects.
 * - writes a row to xp_log
 * - updates user_profiles.xp
 * - marks an xp_crates row opened (or inserts an opened one)
 */
export default async function openCrate(
  userId: string,
  label: string,
  xpValue: number,
  source: string,
): Promise<OpenCrateResult> {
  try {
    // 1) Primary XP history line
    const { error: insertLogErr } = await supabase
      .from('xp_log')
      .insert({
        user_id: userId,
        amount: xpValue,
        reason: `crate_open: ${label}`,
        type: 'crate_open',
        season: 1,
        timestamp: new Date().toISOString(),
      });

    if (insertLogErr) throw insertLogErr;

    // 2) Read current XP
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('xp')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) throw profileErr;

    const currentXP = Number(profile?.xp ?? 0);
const newXP = currentXP + (typeof xpValue === 'number' && Number.isFinite(xpValue) ? xpValue : 0);

    // 3) Persist new XP to profile
    const { error: updErr } = await supabase
      .from('user_profiles')
      .update({ xp: newXP })
      .eq('id', userId);

    if (updErr) throw updErr;

    // 4) Mark newest matching unopened crate as opened; if none, insert one opened
    const { data: crateRow, error: findErr } = await supabase
      .from('xp_crates')
      .select('id')
      .eq('user_id', userId)
      .eq('label', label)
      .eq('xp_value', xpValue)
      .eq('source', source)
      .eq('opened', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr) throw findErr;

    if (crateRow?.id) {
      const { error: markErr } = await supabase
        .from('xp_crates')
        .update({ opened: true })
        .eq('id', crateRow.id);
      if (markErr) throw markErr;
    } else {
      const { error: insertCrateErr } = await supabase
        .from('xp_crates')
        .insert({
          user_id: userId,
          label,
          xp_value: xpValue,
          source,
          opened: true,
        });
      if (insertCrateErr) throw insertCrateErr;
    }

    // 5) Optional UX side-effects (safe no-ops in API build)
    await triggerXPBurst();
    playCrateSound(label.toLowerCase());
    await logXP('xp_crate', xpValue, `Opened ${label} crate from ${source}`);

    return { success: true, label, xp_value: xpValue };
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[CRATE OPEN ERROR]', err);
    return { success: false, error: String(err?.message ?? err) };
    // (Callers can surface a friendly toast; server returns just a boolean in many flows)
  }
}