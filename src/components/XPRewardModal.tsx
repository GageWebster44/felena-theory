
// XPRewardModal.tsx – Shows crate unlock reward modal

import { useEffect, useState } from 'react';

export default function XPRewardModal({ tier }: { tier: string | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (tier) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 4000); // Auto-hide after 4s
      return () => clearTimeout(timer);
    }
  }, [tier]);

  if (!show || !tier) return null;

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
      🎁 <strong>{tier} Crate Unlocked!</strong><br />
      XP bonus awarded!
    </div>
  );
}
