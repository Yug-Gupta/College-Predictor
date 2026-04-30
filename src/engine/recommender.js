// ============================================
// RECOMMENDER.JS — Smart Recommendations Engine
// ============================================

/**
 * Get top recommended "best fit" colleges
 * Sweet spot: safe picks with best closing ranks
 * @param {Array} results - Full prediction results
 * @param {number} count - Number of recommendations
 * @returns {Array}
 */
export function getBestFitColleges(results, count = 5) {
  // Best fit = safe or high-moderate confidence, sorted by prestige
  const bestFit = results
    .filter(r => r.chance === 'safe' || (r.chance === 'moderate' && r.confidence >= 50))
    .sort((a, b) => {
      // Prefer government colleges
      const typeOrder = { Government: 0, Private: 1 };
      if (typeOrder[a.collegeType] !== typeOrder[b.collegeType]) {
        return typeOrder[a.collegeType] - typeOrder[b.collegeType];
      }
      // Then by closing rank (lower = more competitive = better)
      return a.closingRank - b.closingRank;
    });

  return bestFit.slice(0, count);
}

/**
 * Generate counselling tips based on user's rank bracket
 * @param {number} rank
 * @param {string} category
 * @param {Array} results
 * @returns {Array<string>}
 */
export function getCounsellingTips(rank, category, results) {
  const tips = [];
  const safeCount = results.filter(r => r.chance === 'safe').length;
  const moderateCount = results.filter(r => r.chance === 'moderate').length;
  const govtSafe = results.filter(r => r.chance === 'safe' && r.collegeType === 'Government').length;

  if (safeCount >= 5) {
    tips.push('🎯 You have strong chances at multiple colleges. Focus on your top preferences during choice filling.');
  } else if (safeCount >= 1) {
    tips.push('✅ You have a few safe options. Make sure to add them in your choice list, and also try moderate-chance colleges higher up.');
  } else {
    tips.push('⚠️ Most options are moderate or ambitious for your rank. Keep your choice list flexible and consider all available colleges.');
  }

  if (govtSafe > 0) {
    tips.push('🏛️ You have safe chances at government colleges! Prioritize these as they typically offer better ROI.');
  }

  if (moderateCount > 3) {
    tips.push('📋 You have several moderate-chance options. List them in order of your preference — you may get allocated in later rounds.');
  }

  if (rank <= 10000) {
    tips.push('🌟 Your rank is competitive. Aim for top government colleges in Round 1 for the best branch allocation.');
  } else if (rank <= 30000) {
    tips.push('💡 Consider both government and top private colleges. NAAC A+ accredited private colleges often have excellent placements.');
  } else if (rank <= 60000) {
    tips.push('📊 Focus on branch preference over college name. CSE/IT at a decent college often has better outcomes than a lower-demand branch at a top college.');
  } else {
    tips.push('🔄 Don\'t skip any counselling round. Seats often open up in Round 2-4 as students upgrade or exit.');
  }

  tips.push('📝 Always keep your documents ready before the reporting deadline. Late reporting can cost you your seat.');
  
  return tips;
}

/**
 * Get statistics summary for results
 * @param {Array} results
 * @returns {object}
 */
export function getResultStats(results) {
  return {
    total: results.length,
    safe: results.filter(r => r.chance === 'safe').length,
    moderate: results.filter(r => r.chance === 'moderate').length,
    ambitious: results.filter(r => r.chance === 'ambitious').length,
    government: results.filter(r => r.collegeType === 'Government').length,
    private: results.filter(r => r.collegeType === 'Private').length,
    uniqueColleges: [...new Set(results.map(r => r.collegeId))].length,
    uniqueBranches: [...new Set(results.map(r => r.branchCode))].length,
  };
}
