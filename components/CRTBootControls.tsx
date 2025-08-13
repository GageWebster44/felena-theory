// src/components/CRTBootControls.tsx
// Controls rendered on the CRT-style boot screen

import React, { useState } from 'react';

type CRTBootControlsProps = {
  /** Called when the user chooses to skip the boot animation */ onSkip?: () => void;
};

export default function CRTBootControls({ onSkip }: CRTBootControlsProps): JSX.Element {
  const [muted, setMuted] = useState<boolean>(false); // You can wire this state to your global audio system elsewhere
  // e.g., event bus or context that actually mutes/unmutes sounds.

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 99999,
        display: 'flex',
        gap: '1rem',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
      }}
    >
            
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-pressed={muted}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        style={{
          background: 'transparent',
          border: '1px solid lime',
          color: '#0f0',
          padding: '0.4rem 0.8rem',
          cursor: 'pointer',
        }}
      >
                {muted ? '🔇 Audio Off' : '🔊 Audio On'}
              
      </button>
            
      <button
        type="button"
        onClick={() => onSkip?.()}
        aria-label="Skip boot"
        style={{
          background: '#0f0',
          color: '#000',
          fontWeight: 'bold',
          border: 'none',
          padding: '0.4rem 0.8rem',
          cursor: 'pointer',
        }}
      >
                ⏭ Skip Boot       
      </button>
          
    </div>
  );
}
