// src/components/SymbolHeatmap.tsx
// Visual leaderboard of active tickers by XP / contribution

import React from 'react';

type SymbolStat = {
  ticker: string;
  xp: number;
  trades: number;
  /** 0..1 confidence score */
  confidence: number;
};

interface Props {
  symbolStats: SymbolStat[];
}

const boxStyle: React.CSSProperties = {
  marginTop: '2rem',
  background: '#000',
  border: '2px solid lime',
  borderRadius: '12px',
  padding: '1rem',
  color: '#0f0',
  fontFamily: 'Orbitron',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  fontSize: '0.9rem',
  marginTop: '0.5rem',
  borderCollapse: 'collapse',
};

export default function SymbolHeatmap({ symbolStats }: Props) {
  if (!symbolStats || symbolStats.length === 0) {
    return null;
  }

  // Sort by XP descending
  const sorted = [...symbolStats].sort((a, b) => b.xp - a.xp);

  return (
    <div style={boxStyle}>
      <h3 style={{ marginBottom: '1rem' }}>Symbol Heatmap (Top Contributors)</h3>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th align="left">Ticker</th>
            <th align="left">XP</th>
            <th align="left">Trades</th>
            <th align="left">Confidence</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((s, i) => (
            <tr key={`${s.ticker}-${i}`} style={{ borderBottom: '1px solid #333' }}>
              <td>{s.ticker}</td>
              <td>{s.xp.toLocaleString()}</td>
              <td>{s.trades.toLocaleString()}</td>
              <td>{(s.confidence * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
