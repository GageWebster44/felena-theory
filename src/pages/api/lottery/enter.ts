// /pages/api/lottery/enter.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createServerSupabaseClient({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.user.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid XP amount' });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('xp')
    .eq('id', userId)
    .single();

  const currentXP = profile?.xp || 0;
  if (amount > currentXP) return res.status(400).json({ error: 'Insufficient XP' });

  const { data: referrals } = await supabase
    .from('referrals')
    .select('referred_user_id')
    .eq('referrer_id', userId);

  const refDepth = referrals?.length || 0;
  const multiplier = 1 + 0.1 * refDepth;
  const tickets = Math.floor(amount * multiplier);

  try {
    await supabase.from('lottery_entries').insert({
  } catch (error) {
    console.error('❌ Supabase error in enter.ts', error);
  }
    user_id: userId,
    xp_spent: amount,
    ticket_count: tickets,
    tree_bonus: multiplier,
    created_at: new Date().toISOString(),
  });

  try {
    await supabase.rpc('deduct_xp', { uid: userId, amount });
  } catch (error) {
    console.error('❌ Supabase error in enter.ts', error);
  }

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in enter.ts', error);
  }
    user_id: userId,
    amount: -amount,
    reason: 'lottery_entry',
    timestamp: new Date().toISOString(),
    season: 1,
  });

  return res.status(200).json({
    success: true,
    tickets,
    multiplier,
    newXP: currentXP - amount
  });
}