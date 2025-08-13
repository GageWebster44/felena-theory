// src/components/GridExport.tsx
// Export any tabular array to CSV (defaults tuned for the Engine Grid)

import React from 'react';

type Row = Record<string, unknown>;

type Column = {
  key: string; // object property to read from each row
  label: string; // column header in the CSV
};

type Props = {
  /** Data to export */
  data: Row[];
  /** Optional custom columns (order + labels). If omitted, defaults for engine grid are used. */
  columns?: Column[];
  /** Optional filename without extension */
  filename?: string;
  /** Optional: override button label */
  buttonLabel?: string;
};

function toCSVValue(value: unknown): string {
  // Normalize value for CSV cells; wrap in quotes and escape inner quotes
  if (value == null) return '""';
  const s =
    typeof value === 'string'
      ? value
      : typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : JSON.stringify(value);
  const escaped = s.replace(/"/g, '""');
  return `"${escaped}"`;
}

export default function GridExport({
  data,
  columns,
  filename = 'engine-grid',
  buttonLabel = 'Export Grid to CSV',
}: Props) {
  const cols: Column[] =
    columns && columns.length
      ? columns
      : [
          // Sensible defaults for your Engine Grid
          { key: 'engine', label: 'Codename' },
          { key: 'class', label: 'Class' },
          { key: 'strategy', label: 'Strategy' },
          { key: 'avgConfidence', label: 'Confidence' },
          { key: 'count', label: 'Signal Count' },
        ];

  const handleExport = () => {
    try {
      const header = cols.map((c) => toCSVValue(c.label)).join(',');
      const rows = (data ?? []).map((row) =>
        cols.map((c) => toCSVValue((row as Row)[c.key])).join(','),
      );
      const csv = [header, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Cleanup
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fail gracefully in UI; also log for diagnostics
      // eslint-disable-next-line no-console
      console.error('CSV export failed:', e);
      alert('Sorry — export failed. Check console for details.');
    }
  };

  return (
    <button
      onClick={handleExport}
      type="button"
      style={{
        backgroundColor: '#0f0',
        color: '#000',
        padding: '0.5rem 1rem',
        borderRadius: 8,
        border: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '1rem',
      }}
      aria-label="Export grid data to CSV"
      disabled={!data || data.length === 0}
      title={!data || data.length === 0 ? 'No data to export' : 'Download CSV'}
    >
      {buttonLabel}
    </button>
  );
}
