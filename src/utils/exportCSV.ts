export default function downloadCSV(data: any[], filename = 'export.csv') {
  const headers = Object.keys(data[0] || {}).join(',');
  const rows = data.map((entry) =>
    Object.values(entry).join(',')
  );
  const csv = [headers, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}