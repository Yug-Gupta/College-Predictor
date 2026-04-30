// ============================================
// STATE.JS — Centralized State Management
// ============================================

import { loadFromStorage, saveToStorage } from './utils/storage.js';

const STORAGE_KEYS = {
  THEME: 'uptac_theme',
  BOOKMARKS: 'uptac_bookmarks',
  RECENT: 'uptac_recent',
  COMPARE: 'uptac_compare',
  FORM_DATA: 'uptac_form_data',
  RESULTS: 'uptac_results',
};

// --- Deduplication helper ---
function deduplicateArray(arr) {
  return [...new Set(arr)];
}

// --- State Store ---
const state = {
  theme: loadFromStorage(STORAGE_KEYS.THEME, 'indigo'),
  bookmarks: deduplicateArray(loadFromStorage(STORAGE_KEYS.BOOKMARKS, [])),
  recentlyViewed: loadFromStorage(STORAGE_KEYS.RECENT, []),
  compareList: loadFromStorage(STORAGE_KEYS.COMPARE, []),
  formData: loadFromStorage(STORAGE_KEYS.FORM_DATA, null),
  results: null,
  filters: {
    chance: 'all',
    collegeType: 'all',
    region: 'all',
    branch: 'all',
    sort: 'chance',
    search: '',
  },
};

// --- Subscribers ---
const subscribers = {};

function notify(key) {
  if (subscribers[key]) {
    subscribers[key].forEach(fn => fn(state[key]));
  }
}

// --- Public API ---

export function getState(key) {
  return state[key];
}

export function subscribe(key, callback) {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(callback);
  return () => {
    subscribers[key] = subscribers[key].filter(fn => fn !== callback);
  };
}

// Theme
export function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  saveToStorage(STORAGE_KEYS.THEME, theme);
  notify('theme');
}

export function getTheme() {
  return state.theme;
}

// Bookmarks
export function toggleBookmark(collegeKey) {
  const idx = state.bookmarks.indexOf(collegeKey);
  if (idx >= 0) {
    state.bookmarks.splice(idx, 1);
  } else {
    // Duplicate guard: only add if not already present
    if (!state.bookmarks.includes(collegeKey)) {
      state.bookmarks.push(collegeKey);
    }
  }
  saveToStorage(STORAGE_KEYS.BOOKMARKS, state.bookmarks);
  notify('bookmarks');
  return idx < 0; // returns true if added, false if removed
}

export function isBookmarked(collegeKey) {
  return state.bookmarks.includes(collegeKey);
}

/**
 * Check if ANY bookmark belongs to a given college.
 * Handles both "collegeId" and "collegeId__branchCode" key formats.
 * Use this on the detail page where we don't know which branch was bookmarked.
 */
export function isCollegeBookmarked(collegeId) {
  return state.bookmarks.some(
    key => key === collegeId || key.startsWith(collegeId + '__')
  );
}

/**
 * Get all bookmark keys that belong to a given college.
 */
export function getBookmarksForCollege(collegeId) {
  return state.bookmarks.filter(
    key => key === collegeId || key.startsWith(collegeId + '__')
  );
}

/**
 * Toggle bookmark at the college level (for detail page).
 * If any bookmark exists for this college → remove ALL of them.
 * If none exist → add a college-level bookmark (just collegeId).
 * This prevents duplicates from key format mismatches.
 */
export function toggleCollegeBookmark(collegeId) {
  const existingKeys = getBookmarksForCollege(collegeId);
  if (existingKeys.length > 0) {
    // Remove all bookmarks for this college (any key format)
    state.bookmarks = state.bookmarks.filter(
      key => key !== collegeId && !key.startsWith(collegeId + '__')
    );
    saveToStorage(STORAGE_KEYS.BOOKMARKS, state.bookmarks);
    notify('bookmarks');
    return false; // removed
  } else {
    // Add college-level bookmark
    state.bookmarks.push(collegeId);
    saveToStorage(STORAGE_KEYS.BOOKMARKS, state.bookmarks);
    notify('bookmarks');
    return true; // added
  }
}

export function getBookmarks() {
  return [...state.bookmarks];
}

export function clearBookmarks() {
  state.bookmarks = [];
  saveToStorage(STORAGE_KEYS.BOOKMARKS, []);
  notify('bookmarks');
}

// Recently Viewed
export function addRecentlyViewed(collegeKey) {
  state.recentlyViewed = state.recentlyViewed.filter(k => k !== collegeKey);
  state.recentlyViewed.unshift(collegeKey);
  if (state.recentlyViewed.length > 10) state.recentlyViewed = state.recentlyViewed.slice(0, 10);
  saveToStorage(STORAGE_KEYS.RECENT, state.recentlyViewed);
  notify('recentlyViewed');
}

export function getRecentlyViewed() {
  return [...state.recentlyViewed];
}

// Compare
export function toggleCompare(collegeKey) {
  const idx = state.compareList.indexOf(collegeKey);
  if (idx >= 0) {
    state.compareList.splice(idx, 1);
  } else {
    if (state.compareList.length >= 3) return false; // max 3
    state.compareList.push(collegeKey);
  }
  saveToStorage(STORAGE_KEYS.COMPARE, state.compareList);
  notify('compareList');
  return true;
}

export function isInCompare(collegeKey) {
  return state.compareList.includes(collegeKey);
}

export function getCompareList() {
  return [...state.compareList];
}

export function clearCompare() {
  state.compareList = [];
  saveToStorage(STORAGE_KEYS.COMPARE, []);
  notify('compareList');
}

// Form Data
export function setFormData(data) {
  state.formData = data;
  saveToStorage(STORAGE_KEYS.FORM_DATA, data);
  notify('formData');
}

export function getFormData() {
  return state.formData;
}

// Results (not persisted)
export function setResults(results) {
  state.results = results;
  notify('results');
}

export function getResults() {
  return state.results;
}

// Filters
export function setFilter(key, value) {
  state.filters[key] = value;
  notify('filters');
}

export function getFilters() {
  return { ...state.filters };
}

export function resetFilters() {
  state.filters = {
    chance: 'all',
    collegeType: 'all',
    region: 'all',
    branch: 'all',
    sort: 'chance',
    search: '',
  };
  notify('filters');
}

// Initialize theme on load
export function initState() {
  document.documentElement.setAttribute('data-theme', state.theme);
}
