// UI to redeem XP crates or rewards — now wired to cashout API
import React, { useState } from 'react';

type Props = {
  tier: string;
  userId: string; // pass from parent (auth context)
  onClaim: () => void; // optional local side-effect after success
  onClose: () => void;
};

export default function XPRedemptionModal({ tier, userId, onClaim, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payout, setPayout] = useState<number | null>(null);

  if (!tier) return null;

  const handleClaim = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/redeem-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Redeem failed');

      setPayout(json.payoutUsd ?? null);
      onClaim?.(); // let parent refresh any local state (XP, crates, etc.)
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#111',
        border: '2px solid lime',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        fontSize: '1.25rem',
        fontFamily: 'Orbitron',
        boxShadow: '0 0 20px lime',
        width: 'min(92vw, 540px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="xp-redemption-title"
    >
      <h2 id="xp-redemption-title">{tier} Crate Ready</h2>
      <p>You've reached the required XP for redemption.</p>

      {error && <p style={{ color: '#f55', fontSize: '0.95rem', marginTop: '0.5rem' }}>{error}</p>}
      {payout != null && (
        <p style={{ color: '#8f8', fontSize: '1rem', marginTop: '0.5rem' }}>
          Payout confirmed: ${payout.toFixed(2)}
        </p>
      )}

      <button
        onClick={handleClaim}
        disabled={loading}
        style={{
          marginTop: '1rem',
          background: loading ? '#0c0' : '#0f0',
          color: '#000',
          fontWeight: 'bold',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.75 : 1,
        }}
      >
        {loading ? 'Claiming…' : 'Claim Reward'}
      </button>

      <br />

      <button
        onClick={onClose}
        disabled={loading}
        style={{
          marginTop: '0.5rem',
          background: 'transparent',
          border: '1px solid #0f0',
          color: '#0f0',
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.75 : 1,
        }}
      >
        Close
      </button>
    </div>
  );
}
