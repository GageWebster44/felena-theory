 import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_...'); // Use your real key

export default function XPPurchaseCard() {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (amount: number) => {
    setLoading(true);

    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });

    const { sessionId } = await res.json();
    const stripe = await stripePromise;

    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
      <h3>💳 Buy XP</h3>
      <button onClick={() => handlePurchase(100)} style={buyStyle}>Buy 100 XP – $1.00</button>
      <button onClick={() => handlePurchase(500)} style={buyStyle}>Buy 500 XP – $5.00</button>
      <button onClick={() => handlePurchase(1000)} style={buyStyle}>Buy 1000 XP – $10.00</button>
    </div>
  );
}

const buyStyle = {
  margin: '0.5rem',
  background: '#00ff99',
  color: '#000',
  padding: '0.6rem 1rem',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer'
};