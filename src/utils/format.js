// ============================================
// FORMAT.JS — Number & Text Formatters
// ============================================

/**
 * Format a number with commas (Indian numbering system)
 * @param {number} num
 * @returns {string}
 */
export function formatRank(num) {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return Number(num).toLocaleString('en-IN');
}

/**
 * Format percentage
 * @param {number} value 0-100
 * @returns {string}
 */
export function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value)}%`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(text, maxLen = 60) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}

/**
 * Generate a unique key for a college+branch+category combo
 * @param {object} entry - Cutoff entry
 * @returns {string}
 */
export function makeCollegeKey(entry) {
  return `${entry.collegeId}__${entry.branchCode}__${entry.category}__${entry.quota}`;
}

/**
 * Parse a college key back into parts
 * @param {string} key
 * @returns {object}
 */
export function parseCollegeKey(key) {
  const [collegeId, branchCode, category, quota] = key.split('__');
  return { collegeId, branchCode, category, quota };
}

/**
 * Pluralize a word
 * @param {number} count
 * @param {string} singular
 * @param {string} plural
 * @returns {string}
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + 's');
}

/**
 * Generate ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
