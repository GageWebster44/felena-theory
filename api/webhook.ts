// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Important: disable Next.js body parsing so we can read the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Stripe client — use the literal version string Stripe expects
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Supabase (server-side) client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) {
    return res.status(400).send('Webhook Error: missing signature');
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error('Webhook Error:', err?.message ?? err);
    return res.status(400).send(`Webhook Error: ${err?.message ?? 'invalid payload'}`);
  }

  // Handle only successful Checkout sessions
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only proceed once Stripe marks the payment as paid
    if ((session.payment_status as string) !== 'paid') {
      return res.status(400).end();
    }

    const userId = (session.metadata as any)?.user_id as string | undefined;
    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    const nowIso = new Date().toISOString();

    // 1) Give Vision crate
    try {
      const { error } = await supabase.from('xp_crates').insert({
        user_id: userId,
        label: 'Vision_Crate',
        xp_value: 777,
        opened: false,
        source: 'felena_vision_webhook',
      });
      if (error) console.error('× Supabase error in webhook.ts (xp_crates):', error);
    } catch (e) {
      console.error('× Supabase exception in webhook.ts (xp_crates):', e);
    }

    // 2) Badge upsert
    try {
      const { error } = await supabase.from('user_badges').upsert({
        user_id: userId,
        label: 'Felena_Vision',
        source: 'stripe_webhook',
        timestamp: nowIso,
      });
      if (error) console.error('× Supabase error in webhook.ts (user_badges):', error);
    } catch (e) {
      console.error('× Supabase exception in webhook.ts (user_badges):', e);
    }

    // 3) Promote role
    try {
      const { error } = await supabase.from('user_profiles').update({ role: 'felena_vision' }).eq('id', userId);
      if (error) console.error('× Supabase error in webhook.ts (user_profiles):', error);
    } catch (e) {
      console.error('× Supabase exception in webhook.ts (user_profiles):', e);
    }

    // 4) XP audit log line
    try {
      const { error } = await supabase.from('xp_log').insert({
        user_id: userId,
        amount: 0,
        reason: 'Felena_Vision auto-confirmed (webhook)',
        type: 'badge',
        season: 1,
        timestamp: nowIso,
      });
      if (error) console.error('× Supabase error in webhook.ts (xp_log):', error);
    } catch (e) {
      console.error('× Supabase exception in webhook.ts (xp_log):', e);
    }

    return res.status(200).json({ received: true });
  }

  // Return 200 for unhandled events so Stripe stops retrying
  return res.status(200).json({ received: false });
}