
// FlashXP.tsx – Crate unlock glow effect

import { useEffect, useState } from 'react';

export default function FlashXP({ trigger }: { trigger: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setVisible(true);
      const timeout = setTimeout(() => setVisible(false), 2000); // glow lasts 2s
      return () => clearTimeout(timeout);
    }
  }, [trigger]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 255, 128, 0.15)',
      border: '5px solid lime',
      boxShadow: '0 0 60px 30px lime',
      zIndex: 99999,
      pointerEvents: 'none',
      animation: 'flashXP 1s ease-in-out'
    }} />
  );
}
