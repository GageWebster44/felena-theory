// pages/api/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

/** ----------------------------------------------------------------
 * Stripe client
 * ---------------------------------------------------------------- */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

// Use the version your @types expect (fixes TS2322)
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

/** ----------------------------------------------------------------
 * Configuration
 *  - PER_XP_PRICE_ID: single price (e.g., $1 per XP) -> quantity = xp
 *  - XP_PRODUCT_TIERS: map exact XP amounts -> specific price IDs
 *  - PREORDER_PRICE_ID: optional single-SKU preorder flow
 * ---------------------------------------------------------------- */
const PER_XP_PRICE_ID = process.env.STRIPE_XP_PRICE_ID || '';
const PREORDER_PRICE_ID = process.env.PREORDER_PRICE_ID || '';

/**
 * If you already minted separate prices for specific XP amounts,
 * put them here. (Leave empty for per‑XP pricing.)
 * Example:
 *   1: 'price_123',
 *   25: 'price_456',
 */
const XP_PRODUCT_TIERS: Record<number, string> = {
  // fill with your real Stripe price IDs if you use tiered prices
};

/** Site URL for redirects */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

/** ----------------------------------------------------------------
 * Handler
 * ---------------------------------------------------------------- */
type Body = {
  userId?: string;
  xp?: number;        // how many XP the user is purchasing
  preorder?: boolean; // true if using preorder SKU
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, xp, preorder } = (req.body ?? {}) as Body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  // -------------------------
  // Preorder path (single SKU)
  // -------------------------
  if (preorder) {
    if (!PREORDER_PRICE_ID) {
      return res.status(400).json({ error: 'Preorder is not configured' });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: PREORDER_PRICE_ID, quantity: 1 }],
        success_url: `${SITE_URL}/success?preorder=true`,
        cancel_url: `${SITE_URL}/cancel`,
        metadata: {
          user_id: userId,
          type: 'preorder',
        },
      });

      return res.status(200).json({ id: session.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('[stripe] create preorder session error:', msg);
      return res.status(500).json({ error: 'Failed to create Stripe session' });
    }
  }

  // ------------------------------------
  // Normal XP purchase path (per‑XP or tier)
  // ------------------------------------
  if (typeof xp !== 'number' || !Number.isFinite(xp) || xp <= 0) {
    return res.status(400).json({ error: 'Invalid XP value' });
  }

  // Choose pricing approach:
  // 1) Exact tier match -> priceId, quantity = 1
  // 2) Per‑XP price set -> priceId = PER_XP_PRICE_ID, quantity = xp
  // 3) Else -> helpful 400
  let priceId: string | undefined;
  let quantity = 1;

  if (xp in XP_PRODUCT_TIERS) {
    priceId = XP_PRODUCT_TIERS[xp];
  } else if (PER_XP_PRICE_ID) {
    priceId = PER_XP_PRICE_ID;
    quantity = Math.floor(xp); // ensure integer quantity
  } else {
    return res.status(400).json({
      error:
        'No Stripe price configured. Add STRIPE_XP_PRICE_ID for per‑XP pricing, or define an entry in XP_PRODUCT_TIERS for this XP.',
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity }],
      success_url: `${SITE_URL}/success?xp=${encodeURIComponent(String(xp))}`,
      cancel_url: `${SITE_URL}/cancel`,
      metadata: {
        user_id: userId,
        xp: String(xp),
        type: 'xp_purchase',
      },
    });

    return res.status(200).json({ id: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error('[stripe] create xp session error:', msg);
    return res.status(500).json({ error: 'Failed to create Stripe session' });
  }
}