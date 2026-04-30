// ============================================
// COLLEGES.JS — Official UPTAC 2025 Participating Institutes
// ============================================
// Sourced from: admissions.nic.in UPTAC B.Tech Counselling 2025 OR-CR
// Only includes colleges that appear in official UPTAC 2025 OR-CR data.

import officialColleges from './official/colleges-2025.json';

export const colleges = officialColleges;

/**
 * Find a college by ID
 */
export function getCollege(id) {
  return colleges.find(c => c.id === id) || null;
}

/**
 * Search colleges by name (case-insensitive partial match)
 */
export function searchColleges(query) {
  if (!query) return colleges;
  const q = query.toLowerCase();
  return colleges.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.shortName.toLowerCase().includes(q) ||
    c.city.toLowerCase().includes(q)
  );
}

/**
 * Get colleges by type (Government / Private)
 */
export function getCollegesByType(type) {
  return colleges.filter(c => c.type === type);
}

/**
 * Get colleges by region
 */
export function getCollegesByRegion(region) {
  return colleges.filter(c => c.region === region);
}

/**
 * Get unique regions
 */
export function getRegions() {
  return [...new Set(colleges.map(c => c.region))].filter(Boolean).sort();
}

/**
 * Get unique cities
 */
export function getCities() {
  return [...new Set(colleges.map(c => c.city))].filter(Boolean).sort();
}
