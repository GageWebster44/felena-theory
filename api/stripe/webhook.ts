// pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Disable Next.js body parsing so we can read the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Stripe client — fix is the apiVersion literal below
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Supabase client (public anon key is fine for the work we do here)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) return res.status(400).json({ error: 'Missing stripe-signature header' });

  let event: Stripe.Event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook Error: ${err?.message ?? 'invalid signature'}` });
  }

  // We only care about successful checkout sessions
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;

    // Pull the metadata we set when creating the session
    const userId = (session.metadata as any)?.user_id?.toString().trim() || '';
    const xp = Number((session.metadata as any)?.xp ?? 0) || 0;
    const type = ((session.metadata as any)?.type ?? '').toString().toLowerCase();
    const isPreorder = type === 'preorder';

    if (!userId) return res.status(400).json({ error: 'Missing user ID' });

    // ----- PREORDER FLOW ----------------------------------------------------
    if (isPreorder) {
      // 1) Promote role (example: grant “felena_vision”)
      try {
        const { error: updErr } = await supabase
          .from('user_profiles')
          .update({ role: 'felena_vision' })
          .eq('id', userId);

        if (updErr) console.error('× Supabase error (profile update):', updErr);
      } catch (e) {
        console.error('× Supabase exception (profile update):', e);
      }

      // 2) Add a badge
      try {
        const { error } = await supabase.from('user_badges').insert({
          user_id: userId,
          label: 'Felena Vision',
          source: 'preorder',
          timestamp: new Date().toISOString(),
        });
        if (error) console.error('× Supabase error (badge insert):', error);
      } catch (e) {
        console.error('× Supabase exception (badge insert):', e);
      }

      // 3) Give a crate
      try {
        const { error } = await supabase.from('xp_crates').insert({
          user_id: userId,
          label: 'Felena Vision Crate',
          xp_value: 777,
          opened: false,
          source: 'preorder',
        });
        if (error) console.error('× Supabase error (crate insert):', error);
      } catch (e) {
        console.error('× Supabase exception (crate insert):', e);
      }

      // 4) Optional bookkeeping
      try {
        const { error } = await supabase.from('xp_history').insert({
          user_id: userId,
          type: 'preorder',
          amount: 0,
          description: 'Felena Vision preorder access granted',
        });
        if (error) console.error('× Supabase error (preorder history):', error);
      } catch (e) {
        console.error('× Supabase exception (preorder history):', e);
      }

      return res.status(200).json({ received: true });
    }

    // ----- STANDARD DEPOSIT FLOW -------------------------------------------
    if (!xp || xp <= 0) return res.status(400).json({ error: 'Missing XP amount' });

    // 1) Record deposit in history
    try {
      const { error } = await supabase.from('xp_history').insert({
        user_id: userId,
        type: 'deposit',
        amount: xp,
        description: `Stripe deposit (+${xp} XP)`,
      });
      if (error) console.error('× Supabase error (xp_history deposit):', error);
    } catch (e) {
      console.error('× Supabase exception (xp_history deposit):', e);
    }

    // 2) Add XP to wallet/profile via RPC (if you have a function like add_xp)
    try {
      const { error } = await supabase.rpc('add_xp', { uid: userId, amount: xp });
      if (error) console.error('× Supabase error (rpc add_xp):', error);
    } catch (e) {
      console.error('× Supabase exception (rpc add_xp):', e);
    }

    // 3) Optional global broadcast for big deposits
    if (xp >= 5000) {
      try {
        const { error } = await supabase.from('global_winner_log').insert({
          user_id: userId,
          message: `Operator deposited ${xp} XP`,
          type: 'deposit',
        });
        if (error) console.error('× Supabase error (global broadcast):', error);
      } catch (e) {
        console.error('× Supabase exception (global broadcast):', e);
      }
    }

    // ----- REFERRAL CHAIN ---------------------------------------------------
    try {
      // Only reward referrers for public users (mirror your product rules)
      const { data: profile, error: profErr } = await supabase
        .from('user_profiles')
        .select('referrer_id, role')
        .eq('id', userId)
        .single();

      if (!profErr) {
        const referrerId = (profile?.referrer_id as string) || null;

        if (referrerId && profile?.role === 'public') {
          // Mark referral as paying
          try {
            const { error } = await supabase.from('referrals').upsert({
              referrer_id: referrerId,
              referred_user_id: userId,
              is_paying: true,
            });
            if (error) console.error('× Supabase error (referrals upsert):', error);
          } catch (e) {
            console.error('× Supabase exception (referrals upsert):', e);
          }

          // Count paying referrals for this referrer
          let payingCount = 0;
          try {
            const { data, error } = await supabase
              .from('referrals')
              .select('is_paying, referrer_id')
              .eq('referrer_id', referrerId);

            if (!error) payingCount = (data ?? []).filter(r => r.is_paying).length;
          } catch (e) {
            console.error('× Supabase exception (referrals count):', e);
          }

          // Reward table (edit to your needs)
          const rewardTable = (n: number) =>
            Math.max(
              0,
              [5, 10, 20, 40, 100].find(t => n >= t) ?? 0
            );

          const rewardXP = rewardTable(payingCount);

          // Credit the referrer if eligible
          if (rewardXP > 0) {
            try {
              const { error } = await supabase.from('xp_history').insert({
                user_id: referrerId,
                type: 'referral',
                amount: rewardXP,
                description: `Referral bonus for ${userId}`,
              });
              if (error) console.error('× Supabase error (referral history):', error);
            } catch (e) {
              console.error('× Supabase exception (referral history):', e);
            }

            try {
              const { error } = await supabase.rpc('add_xp', {
                uid: referrerId,
                amount: rewardXP,
              });
              if (error) console.error('× Supabase error (rpc add_xp referrer):', error);
            } catch (e) {
              console.error('× Supabase exception (rpc add_xp referrer):', e);
            }
          }

          // Milestone crates at 5 / 10 / 25 paying referrals
          const milestoneTiers = [5, 10, 25];
          if (milestoneTiers.includes(payingCount)) {
            try {
              const { error } = await supabase.from('xp_crates').insert({
                user_id: referrerId,
                label: `Referral_Crate_Tier_${payingCount}`,
                xp_value: payingCount * 10,
                opened: false,
                source: 'referral_milestone',
              });
              if (error) console.error('× Supabase error (milestone crate):', error);
            } catch (e) {
              console.error('× Supabase exception (milestone crate):', e);
            }
          }

          // Jackpot broadcast for big referral rewards
          if (rewardXP >= 100) {
            try {
              const { error } = await supabase.from('global_winner_log').insert({
                user_id: referrerId,
                message: `Referral jackpot ${rewardXP} XP earned from chain`,
                type: 'referral',
              });
              if (error) console.error('× Supabase error (referral jackpot):', error);
            } catch (e) {
              console.error('× Supabase exception (referral jackpot):', e);
            }
          }
        }
      } else {
        console.error('× Supabase error (fetch profile):', profErr);
      }
    } catch (e) {
      console.error('× Referral chain exception in webhook.ts:', e);
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err?.message ?? err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}