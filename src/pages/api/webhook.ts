// pages/api/webhook.ts
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '@/utils/supabaseClient';

export const config = {
  api: {
    bodyParser: false
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;

    if (!userId || session.payment_status !== 'paid') return res.status(400).end();

    // Inject crate + badge + role (same as verify)
  try {
    await supabase.from('xp_crates').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
      user_id: userId,
      label: 'Vision Crate',
      xp_value: 777,
      opened: false,
      source: 'felena_vision_webhook'
    });

  try {
    await supabase.from('user_badges').upsert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
      user_id: userId,
      label: 'Felena Vision',
      source: 'stripe_webhook',
      timestamp: new Date().toISOString()
    });

  try {
    await supabase.from('user_profiles').update({ role: 'felena_vision' }).eq('id', userId);
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in webhook.ts', error);
  }
      user_id: userId,
      amount: 0,
      reason: 'Felena Vision auto-confirmed (webhook)',
      type: 'badge',
      season: 1,
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({ received: true });
}