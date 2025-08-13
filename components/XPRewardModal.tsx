// src/components/XPRewardModal.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';

type Props = {
  /** Tier name to show when a crate unlocks; when null the modal is hidden */
  tier: string | null /** Optional callback fired when the modal auto-hides or user closes it */;
  onClose?: () => void;
};

export default function XPRewardModal({ tier, onClose }: Props) {
  const [show, setShow] = useState(false); // Close helper

  const close = useCallback(() => {
    setShow(false);
    onClose?.();
  }, [onClose]); // Auto-show and hide after 4s whenever `tier` is set

  useEffect(() => {
    if (!tier) return;

    setShow(true);
    const timer = setTimeout(close, 4000);
    return () => clearTimeout(timer);
  }, [tier, close]); // Allow ESC key to dismiss

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, close]);

  if (!show || !tier) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="XP reward unlocked"
      style={{
        position: 'fixed',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#111',
        border: '2px solid lime',
        padding: '2rem',
        color: '#0f0',
        fontSize: '1.25rem',
        fontFamily: 'Orbitron, monospace',
        zIndex: 99999,
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 0 20px lime',
        minWidth: '280px',
      }}
    >
            <strong>{tier} Crate Unlocked!</strong>
            
      <br />
            <span>XP bonus awarded.</span>
            
      <div style={{ marginTop: '1rem' }}>
                
        <button
          onClick={close}
          aria-label="Close"
          style={{
            background: 'transparent',
            border: '1px solid #0f0',
            color: '#0f0',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
                    Close         
        </button>
              
      </div>
          
    </div>
  );
}
