// ============================================
// BRANCHES.JS — Official UPTAC 2025 B.Tech Program Catalog
// ============================================
// Derived from official UPTAC 2025 OR-CR program names.

import officialBranches from './official/branches-2025.json';

export const branches = officialBranches;

/**
 * Get branch by code
 */
export function getBranch(code) {
  return branches.find(b => b.code === code) || null;
}

/**
 * Get branch display name
 */
export function getBranchName(code) {
  const branch = getBranch(code);
  return branch ? branch.name : code;
}

/**
 * Get popular branches (CS-related, high demand)
 */
export function getPopularBranches() {
  return branches.filter(b => b.popular);
}

/**
 * Search branches
 */
export function searchBranches(query) {
  if (!query) return branches;
  const q = query.toLowerCase();
  return branches.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.code.toLowerCase().includes(q)
  );
}
