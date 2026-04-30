// ============================================
// PREDICTOR.JS — Core Prediction Engine (Official Data-Driven)
// ============================================
// Uses official UPTAC 2025 cutoff data to predict chances for 2026.
// Prediction is closing-rank-anchored with transparent reason fields.

import { cutoffs, DATA_YEAR, DATA_SOURCE, DATA_ESTIMATED_FOR } from '../data/cutoffs.js';
import { getCollege } from '../data/colleges.js';
import { getBranchName } from '../data/branches.js';

/**
 * Classify admission chance based on user rank vs official opening/closing rank.
 * Anchored on CLOSING RANK as the primary cutoff threshold.
 * @param {number} userRank
 * @param {number} openingRank - Official 2025 opening rank
 * @param {number} closingRank - Official 2025 closing rank
 * @returns {{ level: string, confidence: number, label: string, reason: string } | null}
 */
export function classifyChance(userRank, openingRank, closingRank) {
  // Ensure valid data
  if (!openingRank || !closingRank || closingRank <= 0) return null;
  
  const range = closingRank - openingRank;

  // 1. User rank is BETTER than the best admitted rank
  if (userRank <= openingRank) {
    return {
      level: 'safe',
      confidence: 95,
      label: 'Safe',
      reason: `Your rank is better than the opening rank (${openingRank.toLocaleString()}). Very strong chance of admission.`,
    };
  }

  // 2. User rank is well within the top half of the admission range
  if (userRank <= openingRank + range * 0.50) {
    return {
      level: 'safe',
      confidence: 80,
      label: 'Safe',
      reason: `Your rank is well within the admission range (${openingRank.toLocaleString()} – ${closingRank.toLocaleString()}).`,
    };
  }

  // 3. User rank is in the middle-to-lower part of the admission range
  if (userRank <= openingRank + range * 0.85) {
    return {
      level: 'moderate',
      confidence: 55,
      label: 'Moderate',
      reason: `Your rank is in the middle of the admission range (${openingRank.toLocaleString()} – ${closingRank.toLocaleString()}).`,
    };
  }

  // 4. User rank is near the official cutoff (within the range but close to closing)
  if (userRank <= closingRank) {
    return {
      level: 'moderate',
      confidence: 38,
      label: 'Moderate',
      reason: `Your rank is near the official ${DATA_YEAR} closing rank (${closingRank.toLocaleString()}). Competitive but possible.`,
    };
  }

  // 5. User rank is slightly beyond the 2025 cutoff (within 8% buffer)
  if (userRank <= closingRank * 1.08) {
    return {
      level: 'ambitious',
      confidence: 22,
      label: 'Ambitious',
      reason: `Your rank is slightly beyond the ${DATA_YEAR} cutoff (${closingRank.toLocaleString()}). May improve in ${DATA_ESTIMATED_FOR} counselling.`,
    };
  }

  // 6. User rank is beyond cutoff but within fluctuation range (8–15%)
  if (userRank <= closingRank * 1.15) {
    return {
      level: 'ambitious',
      confidence: 10,
      label: 'Ambitious',
      reason: `Your rank is beyond the ${DATA_YEAR} cutoff but within annual fluctuation range. Low chance, worth adding as backup.`,
    };
  }

  // 7. Beyond 15% of closing rank — exclude from results
  return null;
}

/**
 * Apply 2026 prediction adjustment to 2025 cutoff data.
 * Uses a uniform 5% buffer to account for year-over-year variation.
 * @param {number} rank - Original 2025 rank
 * @returns {number} Adjusted rank for 2026 estimation
 */
function adjust2026(rank) {
  return Math.round(rank * 1.05);
}

/**
 * Run prediction for given user inputs.
 * Returns results with full transparency: reason, data year, source.
 * @param {object} input
 * @returns {Array<object>}
 */
export function predict(input) {
  const {
    rank,
    category = 'OPEN',
    quota = 'Home State',
    round = 'Round 1',
    branch = 'all',
    collegeType = 'all',
    region = 'all',
    seatGender = 'all',
  } = input;

  const userRank = parseInt(rank, 10);
  if (isNaN(userRank) || userRank <= 0) return [];

  // Normalize round format
  const roundValue = round.startsWith('Round') ? round : `Round ${round}`;

  // Filter cutoff entries by user criteria
  let matches = cutoffs.filter(c => {
    if (c.round !== roundValue) return false;
    if (c.category !== category) return false;
    if (c.quota !== quota) return false;
    if (branch !== 'all' && c.branchCode !== branch) return false;
    if (seatGender !== 'all' && c.seatGender !== seatGender) return false;
    return true;
  });

  // Apply college-level filters
  if (collegeType !== 'all' || region !== 'all') {
    matches = matches.filter(c => {
      const college = getCollege(c.collegeId);
      if (!college) return false;
      if (collegeType !== 'all' && college.type !== collegeType) return false;
      if (region !== 'all' && college.region !== region) return false;
      return true;
    });
  }

  // Classify chances using adjusted ranks
  const results = [];
  for (const entry of matches) {
    const adjustedOR = adjust2026(entry.openingRank);
    const adjustedCR = adjust2026(entry.closingRank);
    const chance = classifyChance(userRank, adjustedOR, adjustedCR);

    if (chance) {
      const college = getCollege(entry.collegeId);
      results.push({
        // College info
        collegeId: entry.collegeId,
        collegeName: college ? college.name : entry.collegeName,
        collegeShortName: college ? college.shortName : entry.collegeName,
        collegeType: college ? college.type : 'Unknown',
        city: college ? college.city : '',
        region: college ? college.region : '',

        // Branch info
        branchCode: entry.branchCode,
        branchName: getBranchName(entry.branchCode),

        // Official cutoff data (from 2025)
        openingRank: entry.openingRank,
        closingRank: entry.closingRank,
        adjustedOR,
        adjustedCR,

        // Chance classification
        chance: chance.level,
        confidence: chance.confidence,
        chanceLabel: chance.label,
        reason: chance.reason,

        // Context fields
        round: entry.round,
        category: entry.category,
        quota: entry.quota,
        seatGender: entry.seatGender,
        remark: entry.remark,

        // Transparency fields
        dataYear: DATA_YEAR,
        dataSource: DATA_SOURCE,
        estimatedForYear: DATA_ESTIMATED_FOR,
        sourceRef: entry.sourceRef,
      });
    }
  }

  // Sort: safe first, then confidence desc, then closing rank asc
  results.sort((a, b) => {
    const order = { safe: 0, moderate: 1, ambitious: 2 };
    if (order[a.chance] !== order[b.chance]) return order[a.chance] - order[b.chance];
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return a.closingRank - b.closingRank;
  });

  return results;
}

/**
 * Sort results by different criteria
 */
export function sortResults(results, sortBy = 'chance') {
  const sorted = [...results];
  switch (sortBy) {
    case 'chance':
      sorted.sort((a, b) => {
        const order = { safe: 0, moderate: 1, ambitious: 2 };
        if (order[a.chance] !== order[b.chance]) return order[a.chance] - order[b.chance];
        return b.confidence - a.confidence;
      });
      break;
    case 'closing_rank':
      sorted.sort((a, b) => a.closingRank - b.closingRank);
      break;
    case 'college_name':
      sorted.sort((a, b) => a.collegeName.localeCompare(b.collegeName));
      break;
    case 'opening_rank':
      sorted.sort((a, b) => a.openingRank - b.openingRank);
      break;
    default:
      break;
  }
  return sorted;
}

/**
 * Apply result filters
 */
export function filterResults(results, filters) {
  return results.filter(r => {
    if (filters.chance && filters.chance !== 'all' && r.chance !== filters.chance) return false;
    if (filters.collegeType && filters.collegeType !== 'all' && r.collegeType !== filters.collegeType) return false;
    if (filters.region && filters.region !== 'all' && r.region !== filters.region) return false;
    if (filters.branch && filters.branch !== 'all' && r.branchCode !== filters.branch) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!r.collegeName.toLowerCase().includes(s) && !r.branchName.toLowerCase().includes(s) && !r.city.toLowerCase().includes(s)) return false;
    }
    return true;
  });
}
