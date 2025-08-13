// src/components/engineStatusPanel.tsx
// Live operator dashboard for engine status

import React from 'react';

type EngineStatus = {
  codename: string;
  lastSignal: string; // e.g., ISO timestamp or human string
  xpGenerated: number; // cumulative XP produced
  mode: string; // e.g., "AUTO" | "MANUAL" | etc.
  active: boolean; // engine health/heartbeat
};

type Props = {
  engines: EngineStatus[];
};

export default function EngineStatusPanel({ engines }: Props) {
  if (!engines || engines.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#111',
        border: '2px solid lime',
        borderRadius: '12px',
        fontFamily: 'Orbitron, monospace',
        color: '#0f0',
      }}
    >
      <h3 style={{ marginBottom: '1rem' }}>Engine Status Monitor</h3>

      <table
        style={{
          width: '100%',
          fontSize: '0.9rem',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Codename</th>
            <th style={{ textAlign: 'left' }}>Last Signal</th>
            <th style={{ textAlign: 'left' }}>XP</th>
            <th style={{ textAlign: 'left' }}>Mode</th>
            <th style={{ textAlign: 'left' }}>Status</th>
          </tr>
        </thead>

        <tbody>
          {engines.map((engine, idx) => (
            <tr key={`${engine.codename}-${idx}`}>
              <td style={{ borderBottom: '1px solid #333' }}>{engine.codename}</td>
              <td style={{ borderBottom: '1px solid #333' }}>{engine.lastSignal}</td>
              <td style={{ borderBottom: '1px solid #333' }}>
                {engine.xpGenerated.toLocaleString()}
              </td>
              <td style={{ borderBottom: '1px solid #333' }}>{engine.mode}</td>
              <td style={{ borderBottom: '1px solid #333' }}>
                {engine.active ? 'Active' : 'Inactive'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
