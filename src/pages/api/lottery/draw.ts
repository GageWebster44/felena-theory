// /pages/api/lottery/draw.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  // 1. Get all tickets
  const { data: entries } = await supabase
    .from('lottery_entries')
    .select('*');

  if (!entries || entries.length === 0) return res.status(400).json({ error: 'No entries found' });

  // 2. Flatten entries into ticket pool
  const ticketPool: string[] = [];
  for (const entry of entries) {
    for (let i = 0; i < entry.ticket_count; i++) {
      ticketPool.push(entry.user_id);
    }
  }

  // 3. Pick winner
  const winnerIndex = Math.floor(Math.random() * ticketPool.length);
  const winnerId = ticketPool[winnerIndex];

  // 4. Calculate total XP in pool
  const totalXP = entries.reduce((sum, e) => sum + e.xp_spent, 0);

  // 5. Award winner
  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }
    user_id: winnerId,
    amount: totalXP,
    reason: 'lottery_win',
    timestamp: new Date().toISOString(),
    season: 1,
  });

  try {
    await supabase.rpc('add_xp', { uid: winnerId, amount: totalXP });
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }

  try {
    await supabase.from('lottery_winners').insert({
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }
    user_id: winnerId,
    xp_awarded: totalXP,
    created_at: new Date().toISOString(),
  });

  // 6. Referral tree payout
  const { data: referrals } = await supabase
    .from('referrals')
    .select('referrer_id')
    .eq('referred_user_id', winnerId)
    .single();

  const referrerId = referrals?.referrer_id;
  if (referrerId) {
    const bonusXP = Math.floor(totalXP * 0.05); // 5% bonus
  try {
    await supabase.rpc('add_xp', { uid: referrerId, amount: bonusXP });
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }
  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }
      user_id: referrerId,
      amount: bonusXP,
      reason: 'lottery_referral_bonus',
      timestamp: new Date().toISOString(),
      season: 1,
    });
  }

  // 7. Rebate 10% to non-winners
  const nonWinners = Array.from(new Set(ticketPool.filter(id => id !== winnerId)));
  for (const userId of nonWinners) {
    const userXPSpent = entries
      .filter(e => e.user_id === userId)
      .reduce((sum, e) => sum + e.xp_spent, 0);
    const rebate = Math.floor(userXPSpent * 0.1);
    if (rebate > 0) {
  try {
    await supabase.rpc('add_xp', { uid: userId, amount: rebate });
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }
  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }
        user_id: userId,
        amount: rebate,
        reason: 'lottery_rebate',
        timestamp: new Date().toISOString(),
        season: 1,
      });
    }
  }

  // 8. Clear entries for next round
  try {
    await supabase.from('lottery_entries').delete().neq('id', ''); // delete all
  } catch (error) {
    console.error('❌ Supabase error in draw.ts', error);
  }

  return res.status(200).json({ winner: winnerId, totalXP });
}