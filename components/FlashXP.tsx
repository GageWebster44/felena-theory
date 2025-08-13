// src/components/FlashXP.tsx
import React, { useEffect, useState } from 'react';

type FlashXPProps = {
  /** When this flips to true, the green “crate unlocked” flash shows briefly */
  trigger: boolean /** Optional: how long the flash should stay visible (ms). Default 2000 */;
  durationMs?: number;
};

const FlashXP: React.FC<FlashXPProps> = ({ trigger, durationMs = 2000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(timeout);
  }, [trigger, durationMs]);

  if (!visible) return null;

  return (
    <>
            
      <div
        role="presentation"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 255, 128, 0.15)',
          border: '5px solid lime',
          boxShadow: '0 0 60px 30px lime inset',
          zIndex: 99999,
          pointerEvents: 'none',
          animation: 'flashXP 1s ease-in-out',
        }}
      />
            
      <style jsx>{`
        @keyframes flashXP {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
          
    </>
  );
};

export default FlashXP;
