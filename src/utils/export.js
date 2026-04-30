// ============================================
// EXPORT.JS — CSV Export Utility
// ============================================

/**
 * Export data as CSV download
 * @param {Array<object>} data - Array of row objects
 * @param {string} filename - Output filename
 * @param {Array<{key: string, label: string}>} columns - Column definitions
 */
export function exportToCSV(data, filename = 'uptac-results.csv', columns) {
  if (!data || data.length === 0) return;

  // Auto-detect columns if not provided
  if (!columns) {
    columns = Object.keys(data[0]).map(key => ({ key, label: key }));
  }

  // Build CSV string
  const header = columns.map(c => `"${c.label}"`).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      const str = val !== null && val !== undefined ? String(val) : '';
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility

  // Trigger download
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
