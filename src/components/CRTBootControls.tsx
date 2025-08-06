
// CRTBootControls.tsx – Controls for CRT boot screen

import { useState } from 'react';

export default function CRTBootControls({ onSkip }: { onSkip: () => void }) {
  const [muted, setMuted] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      zIndex: 99999,
      display: 'flex',
      gap: '1rem',
      fontFamily: 'monospace',
      fontSize: '0.85rem'
    }}>
      <button
        onClick={() => setMuted(!muted)}
        style={{
          background: 'transparent',
          border: '1px solid lime',
          color: '#0f0',
          padding: '0.4rem 0.8rem',
          cursor: 'pointer'
        }}
      >
        {muted ? '🔇 Audio Off' : '🔊 Audio On'}
      </button>

      <button
        onClick={onSkip}
        style={{
          background: '#0f0',
          color: '#000',
          fontWeight: 'bold',
          border: 'none',
          padding: '0.4rem 0.8rem',
          cursor: 'pointer'
        }}
      >
        ⚡ Skip Boot
      </button>
    </div>
  );
}
