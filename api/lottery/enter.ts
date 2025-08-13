// pages/api/lottery/enter.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

type Json =
  | { error: string }
  | {
      success: true;
      tickets: number;
      multiplier: number;
      newXP: number;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Json>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  // Auth/session
  const { data: sessionData, error: sessionErr } =
    await supabase.auth.getSession();
  if (sessionErr) {
    console.error('✗ Supabase session error in enter.ts:', sessionErr);
    return res.status(500).json({ error: 'Auth error' });
  }
  const user = sessionData?.session?.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = user.id;

  // Validate body
  const amountRaw = (req.body as { amount?: unknown })?.amount;
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid XP amount' });
  }

  // Fetch current XP
  const {
    data: profile,
    error: profileErr,
  } = await supabase
    .from('user_profiles')
    .select('xp')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) {
    console.error('✗ Supabase error in enter.ts (profile):', profileErr);
    return res.status(500).json({ error: 'Profile not found' });
  }

  const currentXP = Number(profile.xp ?? 0);
  if (amount > currentXP) {
    return res.status(400).json({ error: 'Insufficient XP' });
  }

  // Referral depth → bonus multiplier (10% per depth level)
  const {
    data: referrals,
    error: refErr,
  } = await supabase
    .from('referrals')
    .select('referrer_id')
    .eq('referred_user_id', userId);

  if (refErr) {
    console.error('✗ Supabase error in enter.ts (referrals):', refErr);
    return res.status(500).json({ error: 'Could not check referrals' });
  }

  const refDepth = Array.isArray(referrals) ? referrals.length : 0;
  const multiplier = 1 + 0.1 * refDepth;
  const tickets = Math.floor(amount * multiplier);
  const nowIso = new Date().toISOString();

  // 1) Record entry
  const { error: insertErr } = await supabase.from('lottery_entries').insert({
    user_id: userId,
    xp_spent: amount,
    ticket_count: tickets,
    tree_bonus: multiplier,
    created_at: nowIso,
  });

  if (insertErr) {
    console.error('✗ Supabase error in enter.ts (insert entry):', insertErr);
    return res.status(500).json({ error: 'Could not create entry' });
  }

  // 2) Deduct XP (use RPC so the DB enforces atomicity/validation)
  const { error: deductErr } = await supabase.rpc('deduct_xp', {
    uid: userId,
    amount,
  });
  if (deductErr) {
    console.error('✗ Supabase error in enter.ts (deduct_xp):', deductErr);
    return res.status(500).json({ error: 'Could not deduct XP' });
  }

  // 3) XP log (non-fatal if it fails)
  const { error: logErr } = await supabase.from('xp_log').insert({
    user_id: userId,
    amount: -amount,
    reason: 'lottery_entry',
    timestamp: nowIso,
    season: 1,
  });
  if (logErr) {
    console.error('✗ Supabase error in enter.ts (xp_log):', logErr);
  }

  return res.status(200).json({
    success: true,
    tickets,
    multiplier,
    newXP: currentXP - amount,
  });
}