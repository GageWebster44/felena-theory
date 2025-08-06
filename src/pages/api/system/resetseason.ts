 // pages/api/system/resetSeason.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: any, res: any) {
  const OPERATOR_ID = 'your-operator-user-id'; // replace with actual UUID
  const SEASON_NUMBER = Date.now(); // optionally increment from DB instead

  // 1. Clear all referral links except Operator
  try {
    await supabase.rpc('clear_referrals_except_operator', {
  } catch (error) {
    console.error('❌ Supabase error in resetseason.ts', error);
  }
    operator_id: OPERATOR_ID,
  });

  // 2. Define 20 preset accounts (dynamically chosen dev/admin IDs)
  const branchIDs = [
    'uuid_1', 'uuid_2', 'uuid_3', 'uuid_4', 'uuid_5',
    'uuid_6', 'uuid_7', 'uuid_8', 'uuid_9', 'uuid_10',
    'uuid_11', 'uuid_12', 'uuid_13', 'uuid_14', 'uuid_15',
    'uuid_16', 'uuid_17', 'uuid_18', 'uuid_19', 'uuid_20',
  ];

  for (const uid of branchIDs) {
  try {
    await supabase.from('user_profiles').update({
  } catch (error) {
    console.error('❌ Supabase error in resetseason.ts', error);
  }
      referrer_id: OPERATOR_ID,
    }).eq('id', uid);

  try {
    await supabase.from('referrals').insert({
  } catch (error) {
    console.error('❌ Supabase error in resetseason.ts', error);
  }
      referrer_id: OPERATOR_ID,
      referred_user_id: uid,
    });
  }

  // 3. Archive logs + milestone crates
  try {
    await supabase.from('xp_history').update({ season: SEASON_NUMBER });
  } catch (error) {
    console.error('❌ Supabase error in resetseason.ts', error);
  }
  try {
    await supabase.from('xp_crates').update({ season: SEASON_NUMBER });
  } catch (error) {
    console.error('❌ Supabase error in resetseason.ts', error);
  }

  // 4. Rollover jackpot if no winner
  const { data: lastJackpot } = await supabase
    .from('lottery_winners')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  const { data: lastPool } = await supabase
    .from('lottery_entries')
    .select('xp_spent')
    .gte('created_at', new Date(Date.now() - 90 * 86400000)); // last 90 days

  const jackpotXP = (lastPool || []).reduce((sum, e) => sum + e.xp_spent, 0) || 0;

  if (!lastJackpot?.length) {
  try {
    await supabase.from('jackpot_pool').insert({
  } catch (error) {
    console.error('❌ Supabase error in resetseason.ts', error);
  }
      season: SEASON_NUMBER + 1,
      xp_value: jackpotXP,
    });
  }

  // 5. Carry-forward bonuses for top inviters
  const { data: topInviters } = await supabase
    .from('referrals')
    .select('referrer_id, count:referred_user_id')
    .eq('is_paying', true)
    .gte('created_at', new Date(Date.now() - 90 * 86400000))
    .group('referrer_id');

  for (const inviter of topInviters || []) {
    if (inviter.count >= 25) {
  try {
    await supabase.from('user_profiles').update({
  } catch (error) {
    console.error('❌ Supabase error in resetseason.ts', error);
  }
        carry_forward_bonus: true,
      }).eq('id', inviter.referrer_id);
    }
  }

  res.status(200).json({ message: '✅ Seasonal reset completed.' });
}