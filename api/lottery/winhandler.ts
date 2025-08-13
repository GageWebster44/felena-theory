// pages/api/lottery/winhandler.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { winner_id, season, xp_won } = req.body;

  if (!winner_id || !xp_won || !season) {
    return res.status(400).json({ error: 'Missing winner_id, xp_won, or season' });
  }

  try {
    // 1. Log winner
    await supabase.from('lottery_winners').insert({
      user_id: winner_id,
      season,
      won_amount: xp_won,
    });

    // 2. Distribute 80% to winner
    await supabase.from('xp_history').insert({
      user_id: winner_id,
      type: 'jackpot_win',
      amount: xp_won * 0.8,
      description: `Jackpot win payout (80% of ${xp_won} XP)`,
    });
    await supabase.rpc('add_xp', { uid: winner_id, amount: xp_won * 0.8 });

    // 3. Referral profit share chain
    const { data: winnerProfile } = await supabase
      .from('user_profiles')
      .select('referrer_id')
      .eq('id', winner_id)
      .single();

    const referrer_id = winnerProfile?.referrer_id;
    if (referrer_id) {
      // Level 1 referral gets 10%
      await supabase.from('xp_history').insert({
        user_id: referrer_id,
        type: 'referral_jackpot_split',
        amount: xp_won * 0.1,
        description: 'Jackpot bonus from referred winner',
      });
      await supabase.rpc('add_xp', { uid: referrer_id, amount: xp_won * 0.1 });

      // Level 2 referral gets 5%
      const { data: referrerProfile } = await supabase
        .from('user_profiles')
        .select('referrer_id')
        .eq('id', referrer_id)
        .single();
      const grandparent_id = referrerProfile?.referrer_id;
      if (grandparent_id) {
        await supabase.from('xp_history').insert({
          user_id: grandparent_id,
          type: 'referral_jackpot_split',
          amount: xp_won * 0.05,
          description: 'Jackpot bonus from downline chain',
        });
        await supabase.rpc('add_xp', { uid: grandparent_id, amount: xp_won * 0.05 });

        // Level 3 referral gets 5%
        const { data: grandparentProfile } = await supabase
          .from('user_profiles')
          .select('referrer_id')
          .eq('id', grandparent_id)
          .single();
        const root_id = grandparentProfile?.referrer_id;
        if (root_id) {
          await supabase.from('xp_history').insert({
            user_id: root_id,
            type: 'referral_jackpot_split',
            amount: xp_won * 0.05,
            description: 'Jackpot root bonus payout',
          });
          await supabase.rpc('add_xp', { uid: root_id, amount: xp_won * 0.05 });
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('X Supabase error in winhandler.ts', error);
    return res.status(500).json({ error: 'Server error' });
  }
}