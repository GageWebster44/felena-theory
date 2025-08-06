 import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: any, res: any) {
  const { winner_id, season, xp_won } = req.body;

  if (!winner_id || !xp_won || !season) {
    return res.status(400).json({ error: 'Missing winner_id, xp_won, or season' });
  }

  // 1. Log the winner
  try {
    await supabase.from('lottery_winners').insert({
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }
    user_id: winner_id,
    season,
    won_amount: xp_won,
  });

  // 2. Distribute XP to winner
  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }
    user_id: winner_id,
    type: 'jackpot_win',
    amount: xp_won * 0.8,
    description: `Jackpot win payout (80% of ${xp_won} XP)`
  });
  try {
    await supabase.rpc('add_xp', { uid: winner_id, amount: xp_won * 0.8 });
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }

  // 3. Referral profit share
  const { data: winner } = await supabase
    .from('user_profiles')
    .select('referrer_id')
    .eq('id', winner_id)
    .single();

  const referrer_id = winner?.referrer_id;
  if (referrer_id) {
  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }
      user_id: referrer_id,
      type: 'referral_jackpot_split',
      amount: xp_won * 0.1,
      description: `Jackpot bonus from referred winner`
    });
  try {
    await supabase.rpc('add_xp', { uid: referrer_id, amount: xp_won * 0.1 });
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }

    const { data: referrer } = await supabase
      .from('user_profiles')
      .select('referrer_id')
      .eq('id', referrer_id)
      .single();

    const grandparent_id = referrer?.referrer_id;
    if (grandparent_id) {
  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }
        user_id: grandparent_id,
        type: 'referral_jackpot_split',
        amount: xp_won * 0.05,
        description: `Jackpot bonus from downline chain`
      });
  try {
    await supabase.rpc('add_xp', { uid: grandparent_id, amount: xp_won * 0.05 });
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }

      const { data: root } = await supabase
        .from('user_profiles')
        .select('referrer_id')
        .eq('id', grandparent_id)
        .single();

      const root_id = root?.referrer_id;
      if (root_id) {
  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }
          user_id: root_id,
          type: 'referral_jackpot_split',
          amount: xp_won * 0.05,
          description: `Jackpot root bonus payout`
        });
  try {
    await supabase.rpc('add_xp', { uid: root_id, amount: xp_won * 0.05 });
  } catch (error) {
    console.error('❌ Supabase error in winhandler.ts', error);
  }
      }
    }
  }

  return res.status(200).json({ success: true });
}