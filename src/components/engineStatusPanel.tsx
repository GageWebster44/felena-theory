
// engineStatusPanel.tsx – Live operator dashboard for engine status

import React from 'react';

export default function EngineStatusPanel({
  engines
}: {
  engines: {
    codename: string;
    lastSignal: string;
    xpGenerated: number;
    mode: string;
    active: boolean;
  }[];
}) {
  return (
    <div style={{
      marginTop: '2rem',
      padding: '1rem',
      background: '#111',
      border: '2px solid lime',
      borderRadius: '12px',
      fontFamily: 'Orbitron',
      color: '#0f0'
    }}>
      <h3 style={{ marginBottom: '1rem' }}>🧠 Engine Status Monitor</h3>
      <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Codename</th>
            <th align="left">Last Signal</th>
            <th align="left">XP</th>
            <th align="left">Mode</th>
            <th align="left">Status</th>
          </tr>
        </thead>
        <tbody>
          {engines.map((engine, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
              <td>{engine.codename}</td>
              <td>{engine.lastSignal}</td>
              <td>{engine.xpGenerated}</td>
              <td>{engine.mode}</td>
              <td>{engine.active ? '✅ Active' : '⚠️ Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
