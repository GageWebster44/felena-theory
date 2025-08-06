
// engineCooldownDisplay.tsx – Shows countdown timers for each symbol's cooldown

import React from 'react';

export default function EngineCooldownDisplay({
  cooldowns
}: {
  cooldowns: { [symbol: string]: number };
}) {
  const now = Date.now();

  const symbols = Object.keys(cooldowns).filter(
    (symbol) => cooldowns[symbol] > now
  );

  if (symbols.length === 0) return null;

  return (
    <div style={{
      marginTop: '1rem',
      background: '#111',
      border: '1px solid lime',
      borderRadius: '8px',
      padding: '1rem',
      fontFamily: 'Orbitron',
      color: '#0f0'
    }}>
      <h4 style={{ marginBottom: '0.5rem' }}>⏱ Cooldowns Active</h4>
      <ul style={{ margin: 0, paddingLeft: '1rem' }}>
        {symbols.map(symbol => {
          const remaining = Math.ceil((cooldowns[symbol] - now) / 1000);
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
