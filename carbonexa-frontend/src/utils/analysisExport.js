const quoteCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

export function exportRows(rows, filename, format = 'csv', title = 'Analysis export') {
  if (!rows?.length) return false;
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  let blob;
  if (format === 'xls') {
    const table = `<table><thead><tr>${columns.map((key) => `<th>${escapeHtml(key)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((key) => `<td>${escapeHtml(row[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    blob = new Blob([`<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body>${table}</body></html>`], { type: 'application/vnd.ms-excel;charset=utf-8' });
  } else {
    const csv = [columns.map(quoteCsv).join(','), ...rows.map((row) => columns.map((key) => quoteCsv(row[key])).join(','))].join('\r\n');
    blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function exportPdf(rows, title) {
  if (!rows?.length) return false;
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const printWindow = window.open('', '_blank', 'width=960,height=700');
  if (!printWindow) return false;
  printWindow.opener = null;
  printWindow.document.write(`<html><head><title>${escapeHtml(title)}</title><style>body{font:12px Arial,sans-serif;padding:28px;color:#17324b}h1{font-size:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #dce6ee;padding:7px;text-align:left}th{background:#eaf3f2}@media print{button{display:none}}</style></head><body><h1>${escapeHtml(title)}</h1><p>Generated from Carbonexa Analysis · Demonstration data unless marked otherwise</p><table><thead><tr>${columns.map((key) => `<th>${escapeHtml(key)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((key) => `<td>${escapeHtml(row[key])}</td>`).join('')}</tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`);
  printWindow.document.close();
  return true;
}
