// ============================================
// STORAGE.JS — localStorage Wrapper
// ============================================

/**
 * Load data from localStorage
 * @param {string} key
 * @param {*} fallback - Default value if key doesn't exist
 * @returns {*} Parsed value or fallback
 */
export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Save data to localStorage
 * @param {string} key
 * @param {*} value - Will be JSON-serialized
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

/**
 * Remove a key from localStorage
 * @param {string} key
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // silently fail
  }
}
