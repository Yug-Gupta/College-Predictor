// ============================================
// CUTOFFS.JS — Official UPTAC 2025 Opening/Closing Rank Data
// ============================================
// Sourced from: admissions.nic.in UPTAC B.Tech Counselling 2025 OR-CR
// Total Records: 10,804 | Colleges: 200 | Branches: 50
// This file loads normalized official data and provides query functions.

import officialCutoffs from './official/cutoffs-2025.json';

export const cutoffs = officialCutoffs;

// Data source metadata 
export const DATA_YEAR = '2025';
export const DATA_SOURCE = 'Official UPTAC 2025 B.Tech Counselling (admissions.nic.in)';
export const DATA_ESTIMATED_FOR = '2026';
export const TOTAL_RECORDS = officialCutoffs.length;

/**
 * Get cutoffs by filters
 * Supports all official fields: collegeId, branchCode, round, category, quota, seatGender
 */
export function getCutoffs(filters = {}) {
  return cutoffs.filter(c => {
    if (filters.collegeId && c.collegeId !== filters.collegeId) return false;
    if (filters.branchCode && c.branchCode !== filters.branchCode) return false;
    if (filters.round && c.round !== filters.round) return false;
    if (filters.category && c.category !== filters.category) return false;
    if (filters.quota && c.quota !== filters.quota) return false;
    if (filters.seatGender && c.seatGender !== filters.seatGender) return false;
    return true;
  });
}

/**
 * Get the best (latest round with tightest competition) cutoff for a given combination
 */
export function getBestCutoff(collegeId, branchCode, category, quota) {
  const matches = getCutoffs({ collegeId, branchCode, category, quota });
  if (!matches.length) return null;
  // Return the last round available (most final cutoff)
  return matches.sort((a, b) => {
    const rA = parseInt(a.round.replace('Round ', ''));
    const rB = parseInt(b.round.replace('Round ', ''));
    return rB - rA;
  })[0];
}

/**
 * Get unique values for filter dropdowns
 */
export function getUniqueValues(field) {
  return [...new Set(cutoffs.map(c => c[field]))].filter(Boolean).sort();
}
