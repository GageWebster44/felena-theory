// pages/api/verify-stripe-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// --- Stripe & Supabase setup ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Ok = { verified: true };
type Err = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // session_id can be in body as either `session_id` or `sessionId`
    const sessionId =
      (req.body?.session_id as string | undefined) ??
      (req.body?.sessionId as string | undefined);

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    // Look up the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const userId = (session.metadata as Record<string, string> | null)?.user_id;
    const type = (session.metadata as Record<string, string> | null)?.type;

    if (!userId) {
      return res.status(400).json({ error: 'No user metadata found' });
    }

    // ✅ Felena Vision preorder promotion (if applicable)
    if (type === 'preorder') {
      // Promote role
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ role: 'felena_vision' })
          .eq('id', userId);

        if (error) throw error;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('× Supabase error in verify-stripe-session.ts (update role):', error);
      }

      // Audit log
      try {
        const { error } = await supabase.from('audit_logs').insert({
          user_id: 'system',
          action: `Auto-promoted ${userId} to felena_vision after preorder`,
          timestamp: new Date().toISOString(),
        });

        if (error) throw error;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('× Supabase error in verify-stripe-session.ts (audit_logs):', error);
      }

      // Badge upsert
      try {
        const { error } = await supabase.from('user_badges').upsert({
          user_id: userId,
          label: 'Felena Vision',
          source: 'preorder',
          timestamp: new Date().toISOString(),
        });

        if (error) throw error;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('× Supabase error in verify-stripe-session.ts (user_badges):', error);
      }
    }

    return res.status(200).json({ verified: true });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Stripe verify error:', err?.message ?? err);
    return res.status(500).json({ error: 'Stripe session verification failed' });
  }
}