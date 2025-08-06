// /pages/api/create-checkout-session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const XP_PRODUCT_TIERS: Record<number, string> = {
  5: 'price_1RspcxB2N1r8kXW1KuNcNNje',
  10: 'price_1RspjgB2N1r8kXW1viC46ZGQ',
  20: 'price_1Rspl1B2N1r8kXW1bb1hdh0j',
  50: 'price_1RspmWB2N1r8kXW1uw1ILkO7',
  100: 'price_1RspoKB2N1r8kXW1vpl5a6Uf',
  250: 'price_1RsppXB2N1r8kXW1wqWZe4wH',
  500: 'price_1RspqYB2N1r8kXW1o13ZuP17',
  1000: 'price_1RsprbB2N1r8kXW1J4MDd1uq',
  2500: 'price_1RspskB2N1r8kXW1dkLVn341',
  5000: 'price_1RsptlB2N1r8kXW14iktOLVo',
  10000: 'price_1RspvNB2N1r8kXW13PBHnZBz',
  15000: 'price_1RspwsB2N1r8kXW1iWW5sJlc',
  20000: 'price_1RspyAB2N1r8kXW17lZhuOho',
  25000: 'price_1RspzuB2N1r8kXW1rHPz6cjf',
  50000: 'price_1Rsq1LB2N1r8kXW1ukjYiEY9',
  75000: 'price_1Rsq2dB2N1r8kXW1jx8ry1YK',
  100000: 'price_1Rsq4SB2N1r8kXW14kB5GxHS',
};

// ✅ Stripe price ID for Felena Vision preorder
const PREORDER_PRICE_ID = 'price_1RsqK2B2N1r8kXW1IYYWQJxLY';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, xp, preorder } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    const isPreorder = preorder === true;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: isPreorder ? PREORDER_PRICE_ID : XP_PRODUCT_TIERS[xp],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?${isPreorder ? 'preorder=true' : `xp=${xp}`}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        userId,
        xp: isPreorder ? 0 : xp,
        type: isPreorder ? 'preorder' : 'xp_purchase',
      },
    });

    return res.status(200).json({ id: session.id });
  } catch (err: any) {
    console.error('Stripe session error:', err);
    return res.status(500).json({ error: 'Failed to create Stripe session' });
  }
}