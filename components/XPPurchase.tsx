// src/components/XPPurchase.tsx
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe('pk_test_...'); // Use your real publishable key

const PRICE_MAP: { xp: number; priceId: string; display: string }[] = [
  { xp: 5, priceId: 'price_1RspcxB2N1r8kXW1KuNcNNje', display: '5 XP — $5.00' },
  { xp: 10, priceId: 'price_1RspjgB2N1rBkXW1viC46Z6Q', display: '10 XP — $10.00' },
  { xp: 20, priceId: 'price_1RspI1B2N1rBkXW1bb1hdhOj', display: '20 XP — $20.00' },
  { xp: 50, priceId: 'price_1RspmWB2N1rBkXW1uw1ILk07', display: '50 XP — $50.00' },
  { xp: 100, priceId: 'price_1RspoKB2N1r8kXW1vpI5a6Uf', display: '100 XP — $100.00' },
  { xp: 250, priceId: 'price_1RsppXB2N1r8kXW1wqWZe4wH', display: '250 XP — $250.00' },
  { xp: 500, priceId: 'price_1RspqYB2N1r8kXW1013ZuP17', display: '500 XP — $500.00' },
  { xp: 1000, priceId: 'price_1RsprbB2N1r8kXW1J4MDd1uq', display: '1,000 XP — $1,000.00' },
  { xp: 2500, priceId: 'price_1RspskB2N1r8kXW1dkLVn341', display: '2,500 XP — $2,500.00' },
  { xp: 5000, priceId: 'price_1RsptlB2N1rBkXW14iktOLVo', display: '5,000 XP — $5,000.00' },
  { xp: 10000, priceId: 'price_1RspvNB2N1r8kXW13PBHnZBz', display: '10,000 XP — $10,000.00' },
  { xp: 15000, priceId: 'price_1RspwsB2N1r8kXW1iWW5sJlc', display: '15,000 XP — $15,000.00' },
  { xp: 20000, priceId: 'price_1RspyAB2N1r8kXW17IZhuOho', display: '20,000 XP — $20,000.00' },
  { xp: 25000, priceId: 'price_1RspzuB2N1r8kXW1rHPz6cjf', display: '25,000 XP — $25,000.00' },
  { xp: 50000, priceId: 'price_1Rsq1LB2N1r8kXW1ukjYiEY9', display: '50,000 XP — $50,000.00' },
  { xp: 75000, priceId: 'price_1Rsq2dB2N1rBkXW1jx8ry1YK', display: '75,000 XP — $75,000.00' },
  { xp: 100000, priceId: 'price_1Rsq4SB2N1r8kXW14kB5GxHS', display: '100,000 XP — $100,000.00' },
];

export default function XPPurchaseCard() {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (priceId: string) => {
    setLoading(true);
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h3>Buy XP</h3>
            
      {PRICE_MAP.map(({ xp, priceId, display }) => (
        <button
          key={xp}
          onClick={() => handlePurchase(priceId)}
          style={buyStyle}
          disabled={loading}
        >
                    {display}
                  
        </button>
      ))}
          
    </div>
  );
}

const buyStyle: React.CSSProperties = {
  margin: '0.5rem',
  background: '#00ff99',
  color: '#000',
  padding: '0.6rem 1rem',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer',
};
