
// GridExport.tsx – Export engine grid to CSV

import React from 'react';

export default function GridExport({ data }: { data: any[] }) {
  const handleExport = () => {
    const headers = ['Codename', 'Class', 'Strategy', 'Confidence', 'Signal Count'];
    const rows = data.map(d => [
      d.engine,
      d.class,
      d.strategy || '',
      d.avgConfidence,
      d.count
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'engine-grid.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        background: '#0f0',
        color: '#000',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 'bold',
        marginTop: '1rem',
        cursor: 'pointer'
      }}
    >
      ⬇ Export Grid to CSV
    </button>
  );
}
