// src/utils/exportCSV.ts

/**
 * Convert an array of records to a CSV and trigger a client-side download.
 * - Fully typed (no `any`)
 * - Safely stringifies objects/arrays
 * - Handles Dates and undefined/null
 * - Works even if records have different keys
 */
export type CsvRow = Record<string, unknown>;

function normalizeHeaders<T extends CsvRow>(rows: T[]): string[] {
  const keys = new Set<string>();
  for (const r of rows) {
    Object.keys(r).forEach((k) => keys.add(k));
  }
  return Array.from(keys);
}

function toCell(value: unknown): string {
  // Normalize values for CSV
  let s: string;
  if (value === null || value === undefined) {
    s = '';
  } else if (value instanceof Date) {
    s = value.toISOString();
  } else if (typeof value === 'object') {
    // stringify arrays/objects
    s = JSON.stringify(value);
  } else {
    s = String(value);
  }

  // Escape CSV specials by enclosing in quotes and escaping quotes
  if (/[,"\n]/.test(s)) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function downloadCSV<T extends CsvRow>(data: T[], filename = 'export.csv'): void {
  // Guard for SSR / non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const headers = data.length > 0 ? normalizeHeaders(data) : [];
  const headerLine = headers.join(',');

  const lines = data.map((row) => headers.map((h) => toCell(row[h])).join(','));

  const csv = [headerLine, ...lines].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  try {
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
  } finally {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Default export to match existing imports in the app
export default downloadCSV;
