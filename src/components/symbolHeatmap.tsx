
// symbolHeatmap.tsx – Visual leaderboard of active tickers by XP/contribution

import React from 'react';

export default function SymbolHeatmap({
  symbolStats
}: {
  symbolStats: {
    ticker: string;
    xp: number;
    trades: number;
    confidence: number;
  }[];
}) {
  const sorted = [...symbolStats].sort((a, b) => b.xp - a.xp);

  return (
    <div style={{
      marginTop: '2rem',
      background: '#000',
      border: '2px solid lime',
      borderRadius: '12px',
      padding: '1rem',
      color: '#0f0',
      fontFamily: 'Orbitron'
    }}>
      <h3>🔥 Symbol Heatmap (Top Contributors)</h3>
      <table style={{ width: '100%', fontSize: '0.9rem', marginTop: '0.5rem' }}>
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
            <tr key={i} style={{ borderBottom: '1px solid #333' }}>
              <td>{s.ticker}</td>
              <td>{s.xp}</td>
              <td>{s.trades}</td>
              <td>{(s.confidence * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
