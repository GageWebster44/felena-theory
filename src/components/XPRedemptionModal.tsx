
// xpRedemptionModal.tsx – UI to redeem XP crates or rewards

import React from 'react';

export default function XPRedemptionModal({
  tier,
  onClaim,
  onClose
}: {
  tier: string;
  onClaim: () => void;
  onClose: () => void;
}) {
  if (!tier) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '25%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#111',
      border: '2px solid lime',
      padding: '2rem',
      color: '#0f0',
      fontSize: '1.25rem',
      fontFamily: 'Orbitron',
      zIndex: 99999,
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 0 20px lime'
    }}>
      <h2>🎁 {tier} Crate Ready!</h2>
      <p>You’ve reached the required XP for redemption.</p>
      <button
        onClick={onClaim}
        style={{
          marginTop: '1rem',
          background: '#0f0',
          color: '#000',
          fontWeight: 'bold',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        ✅ Claim Reward
      </button>
      <br />
      <button
        onClick={onClose}
        style={{
          marginTop: '0.5rem',
          background: 'transparent',
          border: '1px solid #0f0',
          color: '#0f0',
          padding: '0.25rem 0.75rem',
          borderRadius: '6px'
        }}
      >
        Close
      </button>
    </div>
  );
}
