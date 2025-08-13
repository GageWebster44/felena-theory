import type { NextApiRequest, NextApiResponse } from 'next';
import { getPayoutForTier } from '@/lib/xpPayoutModel';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server key
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, tier } = req.body as { userId?: string; tier?: string };
  if (!userId || !tier) return res.status(400).json({ error: 'Missing userId or tier' });

  try {
    // 1) Calculate payout from **shared model**
    const payoutUsd = getPayoutForTier(tier);
    if (payoutUsd <= 0) return res.status(400).json({ error: 'Invalid tier' });

    // 2) Idempotency guard: has this user redeemed this tier recently?
    const { data: recent } = await supabase
      .from('xp_redemptions')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('tier', tier)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .maybeSingle();

    if (recent) return res.status(200).json({ ok: true, payoutUsd, idempotent: true });

    // 3) Create redemption record (acts as a lock)
    const { data: redemption, error: insErr } = await supabase
      .from('xp_redemptions')
      .insert({ user_id: userId, tier, payout_usd: payoutUsd, status: 'pending' })
      .select()
      .single();

    if (insErr) throw insErr;

    // 4) Call your payout engine / wallet credit here
    // Example: write to a ledger table (atomic)
    const { error: ledgerErr } = await supabase.from('cash_ledger').insert({
      user_id: userId,
      source: 'xp_redemption',
      ref_id: redemption.id,
      amount_usd: payoutUsd,
      direction: 'credit',
    });
    if (ledgerErr) throw ledgerErr;

    // 5) Mark redemption complete
    await supabase
      .from('xp_redemptions')
      .update({ status: 'completed' })
      .eq('id', redemption.id);

    // 6) Return fresh balances (so UI reflects reality)
    const { data: balanceRow } = await supabase
      .from('user_balances')
      .select('xp_balance, cash_balance_usd')
      .eq('user_id', userId)
      .maybeSingle();

    return res.status(200).json({
      ok: true,
      payoutUsd,
      balance: balanceRow ?? null,
    });
  } catch (err: any) {
    console.error('redeem-xp error', err);
    return res.status(500).json({ error: 'Redemption failed' });
  }
}