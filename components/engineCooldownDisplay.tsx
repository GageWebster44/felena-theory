// src/components/engineCooldownDisplay.tsx
// Shows countdown timers for each symbol's cooldown (epoch ms in the future)

import React, { useEffect, useState } from 'react';

type Props = {
  /** Map of symbol -> cooldown end time (epoch ms) */
  cooldowns: Record<string, number>;
};

export default function EngineCooldownDisplay({ cooldowns }: Props) {
  // tick the component every second so timers update live
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Only show symbols that are still cooling down
  const symbols = Object.keys(cooldowns).filter((s) => cooldowns[s] > now);
  if (symbols.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '1rem',
        background: '#111',
        border: '1px solid lime',
        borderRadius: '8px',
        padding: '1rem',
        fontFamily: 'Orbitron',
        color: '#0f0',
      }}
    >
      <h4 style={{ marginBottom: '0.5rem' }}>{symbols.length} Cooldowns Active</h4>
      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
        {symbols.map((symbol) => {
          const remaining = Math.max(0, Math.ceil((cooldowns[symbol] - now) / 1000));
          return (
            <li key={symbol}>
              {symbol}: {remaining}s remaining
            </li>
          );
        })}
      </ul>
    </div>
  );
}
