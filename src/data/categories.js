// ============================================
// CATEGORIES.JS — Official UPTAC 2025 Category & Quota Definitions
// ============================================
// Categories and quotas derived from official UPTAC 2025 OR-CR data.

import metadata from './official/metadata.json';

// All categories from official data
export const categories = metadata.categories || [
  'OPEN', 'BC', 'SC', 'ST',
  'EWS(OPEN)', 'EWS(GL)', 'EWS(AF)', 'EWS(FF)', 'EWS(PH)',
  'OPEN(GIRL)', 'OPEN(AF)', 'OPEN(FF)', 'OPEN(PH)', 'OPEN(TF)',
  'BC(Girl)', 'BC(AF)', 'BC(FF)', 'BC(PH)',
  'SC(Girl)', 'SC(AF)', 'SC(FF)', 'SC(PH)',
  'ST(Girl)', 'ST(AF)',
];

// Category groups for UI display
export const categoryGroups = {
  'General': ['OPEN', 'OPEN(GIRL)', 'OPEN(AF)', 'OPEN(FF)', 'OPEN(PH)', 'OPEN(TF)'],
  'OBC/BC': ['BC', 'BC(Girl)', 'BC(AF)', 'BC(FF)', 'BC(PH)'],
  'SC': ['SC', 'SC(Girl)', 'SC(AF)', 'SC(FF)', 'SC(PH)'],
  'ST': ['ST', 'ST(Girl)', 'ST(AF)'],
  'EWS': ['EWS(OPEN)', 'EWS(GL)', 'EWS(AF)', 'EWS(FF)', 'EWS(PH)'],
};

// Main categories for quick filter
export const mainCategories = ['OPEN', 'BC', 'SC', 'ST', 'EWS(OPEN)'];

// Category display names
export const categoryNames = {
  'OPEN': 'General (Open)',
  'BC': 'OBC / BC',
  'SC': 'Scheduled Caste',
  'ST': 'Scheduled Tribe',
  'EWS(OPEN)': 'EWS (Open)',
  'EWS(GL)': 'EWS (Girl)',
  'OPEN(GIRL)': 'General (Girl)',
  'OPEN(AF)': 'General (Armed Forces)',
  'OPEN(FF)': 'General (Freedom Fighter)',
  'OPEN(PH)': 'General (PH)',
  'OPEN(TF)': 'General (TF)',
  'BC(Girl)': 'OBC/BC (Girl)',
  'BC(AF)': 'OBC/BC (Armed Forces)',
  'BC(FF)': 'OBC/BC (Freedom Fighter)',
  'BC(PH)': 'OBC/BC (PH)',
  'SC(Girl)': 'SC (Girl)',
  'SC(AF)': 'SC (Armed Forces)',
  'SC(FF)': 'SC (Freedom Fighter)',
  'SC(PH)': 'SC (PH)',
  'ST(Girl)': 'ST (Girl)',
  'ST(AF)': 'ST (Armed Forces)',
  'EWS(AF)': 'EWS (Armed Forces)',
  'EWS(FF)': 'EWS (Freedom Fighter)',
  'EWS(PH)': 'EWS (PH)',
};

// Quotas
export const quotas = metadata.quotas || ['Home State', 'All India'];

// Seat genders
export const seatGenders = metadata.seatGenders || ['Both Male and Female Seats', 'Female Seats'];

// Regions (derived from colleges data)
export const regions = ['NCR', 'Central UP', 'Western UP', 'Eastern UP', 'Bundelkhand', 'Other'];

/**
 * Get display name for a category
 */
export function getCategoryName(code) {
  return categoryNames[code] || code;
}
