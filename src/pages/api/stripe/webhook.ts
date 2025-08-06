import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: any, res: any) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const xp = parseInt(session.metadata?.xp || '0');
    const isPreorder = session.metadata?.type === 'preorder';

    if (!userId) return res.status(400).json({ error: 'Missing user ID' });

    // ✅ Felena Vision Preorder Tier Logic
    if (isPreorder) {
  try {
    await supabase.from('user_profiles').update({ role: 'felena_vision' }).eq('id', userId);
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
  try {
    await supabase.from('user_badges').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
        user_id: userId,
        label: 'Felena Vision Access',
        source: 'preorder',
        timestamp: new Date().toISOString(),
      });
  try {
    await supabase.from('xp_crates').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
        user_id: userId,
        label: 'Felena Vision Crate',
        xp_value: 777,
        opened: false,
        source: 'preorder',
      });
  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
        user_id: userId,
        type: 'preorder',
        amount: 0,
        description: 'Felena Vision preorder access granted',
      });
      return res.status(200).json({ received: true });
    }

    // ✅ XP Deposit Logic
    if (!xp) return res.status(400).json({ error: 'Missing XP amount' });

  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
      user_id: userId,
      type: 'deposit',
      amount: xp,
      description: `Stripe deposit (+${xp} XP)`,
    });

  try {
    await supabase.rpc('add_xp', { uid: userId, amount: xp });
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }

    // ✅ High XP Global Broadcast
    if (xp >= 5000) {
  try {
    await supabase.from('global_winner_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
        user_id: userId,
        message: `🚀 Operator deposited ${xp} XP`,
        type: 'deposit',
      });
    }

    // ✅ Referral Chain Logic
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('referrer_id, role')
      .eq('id', userId)
      .single();

    const referrerId = profile?.referrer_id;
    if (referrerId && profile?.role === 'public') {
  try {
    await supabase.from('referrals').upsert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
        referrer_id: referrerId,
        referred_user_id: userId,
        is_paying: true,
      });

      const { data: referrals = [] } = await supabase
        .from('referrals')
        .select('is_paying')
        .eq('referrer_id', referrerId);

      const payingCount = referrals.filter((r) => r.is_paying).length;
      const rewardXP = [5, 10, 20, 40, 100][Math.min(payingCount - 1, 4)];

  try {
    await supabase.from('xp_history').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
        user_id: referrerId,
        type: 'referral',
        amount: rewardXP,
        description: `Referral bonus for ${userId}`,
      });

  try {
    await supabase.rpc('add_xp', { uid: referrerId, amount: rewardXP });
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }

      const milestoneTiers = [5, 10, 25];
      for (const tier of milestoneTiers) {
        if (payingCount === tier) {
  try {
    await supabase.from('xp_crates').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
            user_id: referrerId,
            label: `Referral Crate Tier ${tier}`,
            xp_value: tier * 10,
            source: 'referral_milestone',
            opened: false,
          });
        }
      }

      if (rewardXP >= 100) {
  try {
    await supabase.from('global_winner_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
          user_id: referrerId,
          message: `🎉 Referral jackpot: ${rewardXP} XP earned from chain`,
          type: 'referral',
        });
      }
    }

    return res.status(200).json({ received: true });
  }

  return res.status(200).json({ received: false });
}