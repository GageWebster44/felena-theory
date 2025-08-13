// pages/api/system/resetseason.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ❗ set via env in production
  const OPERATOR_ID = process.env.OPERATOR_USER_ID as string; // “company” operator
  if (!OPERATOR_ID) return res.status(500).json({ error: 'Missing OPERATOR_USER_ID' });

  // you can also fetch an incrementing season number from DB if you prefer
  const SEASON_NUMBER = Date.now();

  try {
    // 1) Clear all referral links except the primary operator
    try {
      const { error } = await supabase.rpc('clear_referrals_except_operator', {
        operator_id: OPERATOR_ID,
      });
      if (error) throw error;
    } catch (error) {
      console.error('✗ Supabase error in resetseason.ts (clear_referrals_except_operator):', error);
    }

    // 2) Point preset accounts at operator (bootstrap)
    // Replace with your chosen list (dev/admin/demo IDs etc.)
    const branchIDs: string[] = [
      'uuid_1',
      'uuid_2',
      'uuid_3',
      'uuid_4',
      'uuid_5',
      'uuid_6',
      'uuid_7',
      'uuid_8',
      'uuid_9',
      'uuid_10',
      'uuid_11',
      'uuid_12',
      'uuid_13',
      'uuid_14',
      'uuid_15',
      'uuid_16',
      'uuid_17',
      'uuid_18',
      'uuid_19',
      'uuid_20',
    ];

    for (const uid of branchIDs) {
      try {
        const { error: upErr } = await supabase
          .from('user_profiles')
          .update({ referrer_id: OPERATOR_ID })
          .eq('id', uid);
        if (upErr) throw upErr;
      } catch (error) {
        console.error('✗ Supabase error in resetseason.ts (assign referrer):', error);
      }

      try {
        const { error: insErr } = await supabase.from('referrals').insert({
          referrer_id: OPERATOR_ID,
          referred_user_id: uid,
        });
        if (insErr) throw insErr;
      } catch (error) {
        console.error('✗ Supabase error in resetseason.ts (insert referral):', error);
      }
    }

    // 3) Archive logs + milestone crates to the new season
    try {
      const { error } = await supabase.from('xp_history').update({ season: SEASON_NUMBER });
      if (error) throw error;
    } catch (error) {
      console.error('✗ Supabase error in resetseason.ts (archive xp_history):', error);
    }

    try {
      const { error } = await supabase.from('xp_crates').update({ season: SEASON_NUMBER });
      if (error) throw error;
    } catch (error) {
      console.error('✗ Supabase error in resetseason.ts (archive xp_crates):', error);
    }

    // 4) Rollover jackpot if there was no winner recently
    try {
      const { data: lastJackpot, error: jwErr } = await supabase
        .from('lottery_winners')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (jwErr) throw jwErr;

      // collect recent pool XP (90d) to roll into new season jackpot if no winner
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000).toISOString();
      const { data: lastPool, error: lpErr } = await supabase
        .from('lottery_entries')
        .select('xp_spent')
        .gte('created_at', ninetyDaysAgo);

      if (lpErr) throw lpErr;

      const jackpotXP =
        (lastPool || []).reduce((sum, e: any) => sum + Number(e.xp_spent || 0), 0) || 0;

      if (!lastJackpot?.length && jackpotXP > 0) {
        const { error: insErr } = await supabase.from('jackpot_pool').insert({
          season: SEASON_NUMBER + 1,
          xp_value: jackpotXP,
        });
        if (insErr) throw insErr;
      }
    } catch (error) {
      console.error('✗ Supabase error in resetseason.ts (jackpot rollover):', error);
    }

    // 5) Carry‑forward bonus flags for top inviters in last 90 days
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000).toISOString();
      // Expect a view/aggregation or do client aggregation after fetch:
      const { data: topInviters, error: refErr } = await supabase
        .from('referrals')
        .select('referrer_id, is_paying, created_at')
        .eq('is_paying', true)
        .gte('created_at', ninetyDaysAgo);

      if (refErr) throw refErr;

      // Count per referrer
      const counts = new Map<string, number>();
      for (const r of topInviters || []) {
        const id = (r as any).referrer_id as string;
        counts.set(id, (counts.get(id) || 0) + 1);
      }

      for (const [referrer_id, count] of counts.entries()) {
        if (count >= 25) {
          try {
            const { error: upErr } = await supabase
              .from('user_profiles')
              .update({ carry_forward_bonus: true })
              .eq('id', referrer_id);
            if (upErr) throw upErr;
          } catch (error) {
            console.error('✗ Supabase error in resetseason.ts (carry_forward_bonus):', error);
          }
        }
      }
    } catch (error) {
      console.error('✗ Supabase error in resetseason.ts (top inviters):', error);
    }

    return res.status(200).json({ message: '✅ Seasonal reset completed.' });
  } catch (err: any) {
    console.error('RESET SEASON ERROR:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}