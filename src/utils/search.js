// ============================================
// SEARCH.JS — Advanced Search Utilities
// ============================================

/**
 * Normalizes text for search matching.
 * Converts to lowercase, removes special characters, and collapses spaces.
 * @param {string} text 
 * @returns {string}
 */
export function normalizeSearchText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\-_/()&'"[\]{}]/g, '') // Remove punctuation and special characters
    .replace(/\s+/g, ' ')               // Collapse multiple spaces into one
    .trim();
}

/**
 * Calculates Levenshtein Distance between two strings.
 * Used for fuzzy matching to tolerate typos.
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Checks if a token fuzzy matches a word.
 * Tolerates typos for longer words.
 * @param {string} token 
 * @param {string} word 
 * @returns {boolean}
 */
export function isFuzzyMatch(token, word) {
  // Exact match first
  if (token === word) return true;
  // Don't fuzzy match very short tokens
  if (token.length <= 3) return false;
  // If lengths differ too much, don't calculate distance to save CPU
  if (Math.abs(token.length - word.length) > 2) return false;
  
  const dist = levenshteinDistance(token, word);
  // Allow 2 typos for words 4+ letters long
  const maxDistance = token.length >= 4 ? 2 : 1;
  return dist <= maxDistance;
}
