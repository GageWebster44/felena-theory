// pages/api/lottery/draw.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Helpers --------------------------------------------------------------

/** Start of current ISO week (Mon 00:00:00) in UTC */
function startOfISOWeekUTC(d = new Date()): string {
  const day = d.getUTCDay(); // 0..6 (Sun..Sat)
  // convert to Monday-based (Mon=1..Sun=7)
  const isoDay = day === 0 ? 7 : day;
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (isoDay - 1)); // back to Monday
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

// API ------------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  // Session
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();

  if (!session?.user || sessionErr) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  // Admin check
  const { data: profile, error: profileErr } = await supabase
    .from('user_profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (profileErr) {
    console.error('Supabase error in draw.ts (profile):', profileErr);
    return res.status(500).json({ error: 'Profile lookup failed' });
  }
  if (profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Enforce: only one draw per ISO week
  const weekStartIso = startOfISOWeekUTC();
  const { data: already, error: alreadyErr } = await supabase
    .from('lottery_winners')
    .select('id')
    .gte('created_at', weekStartIso)
    .limit(1);

  if (alreadyErr) {
    console.error('Supabase error in draw.ts (weekly guard):', alreadyErr);
    return res.status(500).json({ error: 'Weekly guard failed' });
  }
  if (already && already.length > 0) {
    return res.status(409).json({ error: 'This week’s lottery has already been drawn.' });
  }

  // Fetch entries (user_id, ticket_count, xp_spent)
  const { data: entries, error: entriesErr } = await supabase
    .from('lottery_entries')
    .select('user_id, ticket_count, xp_spent');

  if (entriesErr) {
    console.error('Supabase error in draw.ts (entries):', entriesErr);
    return res.status(500).json({ error: 'Failed to fetch entries' });
  }
  if (!entries || entries.length === 0) {
    return res.status(400).json({ error: 'No entries found' });
  }

  // Build weighted pool
  const ticketPool: string[] = [];
  for (const entry of entries) {
    const count = Math.max(0, Number(entry.ticket_count || 0));
    for (let i = 0; i < count; i++) ticketPool.push(entry.user_id);
  }
  if (ticketPool.length === 0) {
    return res.status(400).json({ error: 'No tickets in pool' });
  }

  // Pick a winner
  const winnerIndex = Math.floor(Math.random() * ticketPool.length);
  const winnerId = ticketPool[winnerIndex];

  // Total XP in pool
  const totalXP = entries.reduce((sum, e) => sum + Number(e.xp_spent || 0), 0);
  const nowIso = new Date().toISOString();

  // 1) Credit winner: add XP (RPC), log, record winner
  try {
    await supabase.rpc('add_xp', { uid: winnerId, amount: totalXP });
  } catch (error) {
    console.error('Supabase error in draw.ts (add_xp winner):', error);
  }

  try {
    await supabase.from('xp_log').insert({
      user_id: winnerId,
      amount: totalXP,
      reason: 'lottery_win',
      timestamp: nowIso,
      season: 1,
    });
  } catch (error) {
    console.error('Supabase error in draw.ts (xp_log winner):', error);
  }

  try {
    await supabase.from('lottery_winners').insert({
      user_id: winnerId,
      xp_awarded: totalXP,
      created_at: nowIso,
    });
  } catch (error) {
    console.error('Supabase error in draw.ts (lottery_winners):', error);
  }

  // 2) Referral 5% bonus to referrer (if any)
  try {
    const { data: referrals, error: refErr } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referred_user_id', winnerId)
      .single();

    if (refErr) {
      console.error('Supabase error in draw.ts (referral fetch):', refErr);
    } else if (referrals?.referrer_id) {
      const referrerId: string = referrals.referrer_id;
      const bonusXP = Math.floor(totalXP * 0.05);

      if (bonusXP > 0) {
        try {
          await supabase.rpc('add_xp', { uid: referrerId, amount: bonusXP });
        } catch (error) {
          console.error('Supabase error in draw.ts (add_xp referrer):', error);
        }

        try {
          await supabase.from('xp_log').insert({
            user_id: referrerId,
            amount: bonusXP,
            reason: 'lottery_referral_bonus',
            timestamp: nowIso,
            season: 1,
          });
        } catch (error) {
          console.error('Supabase error in draw.ts (xp_log referrer):', error);
        }
      }
    }
  } catch (error) {
    console.error('Referral bonus block error:', error);
  }

  // 3) Rebate 10% of their own xp_spent to non-winners
  const nonWinners = Array.from(new Set(ticketPool.filter((id) => id !== winnerId)));
  for (const uid of nonWinners) {
    const userXPSpent = entries
      .filter((e) => e.user_id === uid)
      .reduce((sum, e) => sum + Number(e.xp_spent || 0), 0);

    const rebate = Math.floor(userXPSpent * 0.1);
    if (rebate > 0) {
      try {
        await supabase.rpc('add_xp', { uid, amount: rebate });
      } catch (error) {
        console.error('Supabase error in draw.ts (add_xp rebate):', error);
      }

      try {
        await supabase.from('xp_log').insert({
          user_id: uid,
          amount: rebate,
          reason: 'lottery_rebate',
          timestamp: nowIso,
          season: 1,
        });
      } catch (error) {
        console.error('Supabase error in draw.ts (xp_log rebate):', error);
      }
    }
  }

  // 4) Clear entries for next round (weekly reset handled by guard above)
  try {
    // Use neq trick to avoid full-table delete block on some Postgres configs
    await supabase.from('lottery_entries').delete().neq('id', '');
  } catch (error) {
    console.error('Supabase error in draw.ts (clear entries):', error);
  }

  return res.status(200).json({ winner: winnerId, totalXP, weekStart: weekStartIso });
}