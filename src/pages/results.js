// ============================================
// RESULTS.JS — Prediction Results Page (With Official Data Transparency)
// ============================================

import { getResults, getFormData, setResults, isBookmarked, isCollegeBookmarked, toggleBookmark, isInCompare, toggleCompare, subscribe } from '../state.js';
import { predict, filterResults, sortResults } from '../engine/predictor.js';
import { getBestFitColleges, getCounsellingTips, getResultStats } from '../engine/recommender.js';
import { formatRank } from '../utils/format.js';
import { showToast, debounce } from '../utils/dom.js';
import { exportToCSV } from '../utils/export.js';
import { branches } from '../data/branches.js';
import { regions } from '../data/categories.js';
import { DATA_YEAR, DATA_SOURCE, TOTAL_RECORDS } from '../data/cutoffs.js';
import { renderHeader } from '../components/header.js';

let currentResults = [];
let currentFilters = { chance: 'all', collegeType: 'all', region: 'all', branch: 'all', sort: 'chance', search: '' };
let unsubBookmarks = null;
let unsubCompare = null;

export async function renderResults() {
  const formData = getFormData();
  let results = getResults();

  if (!results && formData) {
    results = predict(formData);
    setResults(results);
  }

  if (!results || !formData) {
    return `
      <div class="results-page">
        <div class="container-sm">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="search-x" style="width:80px;height:80px;"></i></div>
            <h3>No Predictions Yet</h3>
            <p>Enter your rank and preferences to get college predictions for 2026 UPTAC counselling.</p>
            <a href="#/predict" data-link class="btn btn-primary btn-lg">
              <i data-lucide="search" style="width:18px;height:18px;"></i>
              Start Predicting
            </a>
          </div>
        </div>
      </div>
    `;
  }

  currentResults = results;
  const stats = getResultStats(results);
  const bestFit = getBestFitColleges(results, 3);
  const tips = getCounsellingTips(parseInt(formData.rank), formData.category, results);

  // Get unique values for filter dropdowns
  const resultBranches = [...new Set(results.map(r => r.branchCode))].sort();
  const resultRegions = [...new Set(results.map(r => r.region))].filter(Boolean).sort();

  return `
    <div class="results-page">
      <div class="container">

        <!-- Official Data Disclaimer Banner -->
        <div class="card-flat mb-3 reveal" style="padding:0.875rem 1.25rem; background:var(--accent-light); border-color:var(--accent-primary); display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
          <span style="font-size:1.25rem;">📊</span>
          <div style="flex:1; min-width:200px;">
            <span style="font-weight:600; font-size:0.8125rem;">Based on official UPTAC ${DATA_YEAR} data</span>
            <span style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem;">
              Estimated for 2026 counselling · Source: admissions.nic.in · ${TOTAL_RECORDS.toLocaleString()} official records
            </span>
          </div>
          <span class="tag" style="font-size:0.6875rem; background:var(--accent-primary); color:white;">
            📅 ${DATA_YEAR} Data
          </span>
        </div>

        <!-- Results Header -->
        <div class="results-header reveal">
          <h1>College Predictions</h1>
          <div class="results-summary-tags">
            <span class="tag"><i data-lucide="hash" style="width:12px;height:12px;"></i> Rank: ${formatRank(formData.rank)}</span>
            <span class="tag"><i data-lucide="users" style="width:12px;height:12px;"></i> ${formData.category}</span>
            <span class="tag"><i data-lucide="map-pin" style="width:12px;height:12px;"></i> ${formData.quota}</span>
            <span class="tag"><i data-lucide="repeat" style="width:12px;height:12px;"></i> ${formData.round}</span>
            ${formData.branch && formData.branch !== 'all' ? `<span class="tag"><i data-lucide="graduation-cap" style="width:12px;height:12px;"></i> ${formData.branch}</span>` : ''}
          </div>
        </div>

        <!-- Stats Summary -->
        <div class="grid grid-4 gap-md mb-3 stagger-in reveal">
          <div class="card stat-card">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Matches</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value" style="color:var(--chance-safe)">${stats.safe}</div>
            <div class="stat-label">Safe Picks</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value" style="color:var(--chance-moderate)">${stats.moderate}</div>
            <div class="stat-label">Moderate</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value" style="color:var(--chance-ambitious)">${stats.ambitious}</div>
            <div class="stat-label">Ambitious</div>
          </div>
        </div>

        ${bestFit.length > 0 ? `
        <!-- Best Fit Recommendations -->
        <div class="card-flat mb-3 reveal" style="padding:1.25rem; border-color:var(--chance-safe); background: var(--chance-safe-bg);">
          <h3 style="font-size:0.9375rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem; color: var(--chance-safe);">
            <i data-lucide="star" style="width:18px;height:18px;"></i>
            Best Fit Colleges for You
          </h3>
          <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
            ${bestFit.map(r => `
              <a href="#/college?id=${r.collegeId}" data-link class="tag" style="cursor:pointer;">
                ${r.collegeShortName} — ${r.branchCode}
              </a>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Counselling Tips -->
        <div class="card-flat mb-3 reveal" style="padding:1.25rem;">
          <h3 style="font-size:0.9375rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <i data-lucide="lightbulb" style="width:18px;height:18px; color:var(--chance-moderate);"></i>
            Counselling Tips for Your Rank
          </h3>
          <div style="display:flex; flex-direction:column; gap:0.375rem; font-size:0.8125rem; color:var(--text-secondary);">
            ${tips.map(t => `<p>${t}</p>`).join('')}
          </div>
        </div>

        <!-- Controls Bar -->
        <div class="results-meta reveal">
          <div class="results-count" id="results-count">Showing ${results.length} results</div>
          <div class="results-actions">
            <div class="search-bar" style="max-width:240px;width:100%;">
              <i data-lucide="search" class="search-icon"></i>
              <input type="text" placeholder="Search colleges..." id="results-search" />
            </div>
            <select class="form-select" id="results-sort" style="max-width:180px;width:100%; padding:0.5rem 0.75rem;">
              <option value="chance">Sort: Best Chance</option>
              <option value="closing_rank">Sort: Closing Rank</option>
              <option value="college_name">Sort: College Name</option>
              <option value="opening_rank">Sort: Opening Rank</option>
            </select>
            <button class="btn btn-secondary btn-sm" id="export-btn">
              <i data-lucide="download" style="width:14px;height:14px;"></i> Export CSV
            </button>
            <a href="#/predict" data-link class="btn btn-ghost btn-sm">
              <i data-lucide="edit" style="width:14px;height:14px;"></i> Edit
            </a>
          </div>
        </div>

        <!-- Results Layout -->
        <div class="results-layout">
          <!-- Filter Sidebar -->
          <aside class="results-sidebar">
            <button class="btn btn-secondary btn-sm w-full show-mobile" id="filter-toggle-btn" style="margin-bottom:0.75rem;justify-content:center;">
              <i data-lucide="sliders-horizontal" style="width:16px;height:16px;"></i>
              Filters
              <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
            </button>
            <div class="filter-panel" id="filter-panel-content">
              <h3>
                <i data-lucide="sliders-horizontal" style="width:16px;height:16px;"></i>
                Filters
              </h3>

              <div class="filter-section">
                <h4>Chance Level</h4>
                <label class="filter-check"><input type="radio" name="filter-chance" value="all" checked onchange="window.__filterResults__()"> All</label>
                <label class="filter-check"><input type="radio" name="filter-chance" value="safe" onchange="window.__filterResults__()"> 🟢 Safe</label>
                <label class="filter-check"><input type="radio" name="filter-chance" value="moderate" onchange="window.__filterResults__()"> 🟡 Moderate</label>
                <label class="filter-check"><input type="radio" name="filter-chance" value="ambitious" onchange="window.__filterResults__()"> 🔴 Ambitious</label>
              </div>

              <div class="filter-section">
                <h4>College Type</h4>
                <label class="filter-check"><input type="radio" name="filter-type" value="all" checked onchange="window.__filterResults__()"> All</label>
                <label class="filter-check"><input type="radio" name="filter-type" value="Government" onchange="window.__filterResults__()"> Government</label>
                <label class="filter-check"><input type="radio" name="filter-type" value="Private" onchange="window.__filterResults__()"> Private</label>
              </div>

              ${resultRegions.length > 1 ? `
              <div class="filter-section">
                <h4>Region</h4>
                <label class="filter-check"><input type="radio" name="filter-region" value="all" checked onchange="window.__filterResults__()"> All</label>
                ${resultRegions.map(r => `<label class="filter-check"><input type="radio" name="filter-region" value="${r}" onchange="window.__filterResults__()"> ${r}</label>`).join('')}
              </div>
              ` : ''}

              ${resultBranches.length > 1 ? `
              <div class="filter-section">
                <h4>Branch</h4>
                <select class="form-select" id="filter-branch" onchange="window.__filterResults__()" style="padding:0.5rem;">
                  <option value="all">All Branches</option>
                  ${resultBranches.map(b => {
                    const br = branches.find(br => br.code === b);
                    return `<option value="${b}">${br ? br.name : b}</option>`;
                  }).join('')}
                </select>
              </div>
              ` : ''}

              <button class="btn btn-ghost btn-sm w-full mt-2" onclick="window.__resetFilters__()">
                <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i> Reset Filters
              </button>
            </div>
          </aside>

          <!-- Results Grid -->
          <div class="results-grid" id="results-grid">
            ${renderResultCards(results)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderResultCards(results) {
  if (results.length === 0) {
    return `
      <div class="empty-state" style="padding:3rem;">
        <div class="empty-state-icon"><i data-lucide="search-x" style="width:60px;height:60px;"></i></div>
        <h3>No Matches Found</h3>
        <p>We couldn't find any close matches. Try checking for typos or relaxing your filters.</p>
      </div>
    `;
  }

  return results.map(r => {
    const bookmarkKey = `${r.collegeId}__${r.branchCode}`;
    const bookmarked = isBookmarked(bookmarkKey) || isCollegeBookmarked(r.collegeId);
    const compared = isInCompare(r.collegeId);
    const userRank = parseInt(getFormData()?.rank || 0);

    // Rank position bar calculation
    const barMin = Math.min(r.openingRank, userRank);
    const barMax = Math.max(r.closingRank * 1.1, userRank * 1.05);
    const barRange = barMax - barMin || 1;
    const orPos = ((r.openingRank - barMin) / barRange) * 100;
    const crPos = ((r.closingRank - barMin) / barRange) * 100;
    const userPos = ((userRank - barMin) / barRange) * 100;

    return `
      <div class="college-card" onclick="if(event.target.closest('button'))return; location.hash='#/college?id=${r.collegeId}'">
        <div class="college-card-top">
          <div class="college-card-info">
            <h3>${r.collegeShortName}</h3>
            <span class="college-branch">${r.branchName}</span>
          </div>
          <div class="college-card-actions">
            <button data-tooltip="${compared ? 'Remove from compare' : 'Add to compare'}"
                    data-compare-id="${r.collegeId}"
                    onclick="window.__toggleCompare__('${r.collegeId}', this)">
              <i data-lucide="${compared ? 'check-square' : 'columns-2'}" style="width:16px;height:16px;"></i>
            </button>
            <button class="${bookmarked ? 'bookmarked' : ''}"
                    data-tooltip="${bookmarked ? 'Remove bookmark' : 'Bookmark'}"
                    data-bookmark-key="${bookmarkKey}"
                    onclick="window.__toggleBookmark__('${bookmarkKey}', this)">
              <i data-lucide="${bookmarked ? 'bookmark-check' : 'bookmark'}" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>

        <div class="college-card-meta">
          <span class="badge ${r.collegeType === 'Government' ? 'badge-govt' : 'badge-pvt'}">${r.collegeType}</span>
          <span class="text-xs text-muted">${r.city}</span>
          <span class="badge" style="font-size:0.625rem; padding:0.125rem 0.375rem; background:var(--accent-primary); color:white; opacity:0.9;">📅 ${r.dataYear} Data</span>
        </div>

        <div class="college-card-ranks">
          <div class="rank-item">
            <span class="rank-label">Opening Rank</span>
            <span class="rank-value">${formatRank(r.openingRank)}</span>
          </div>
          <div class="rank-item">
            <span class="rank-label">Closing Rank</span>
            <span class="rank-value">${formatRank(r.closingRank)}</span>
          </div>
          <div class="rank-item" style="margin-left:auto;">
            <span class="rank-label">Your Rank</span>
            <span class="rank-value" style="color:var(--accent-primary);">${formatRank(userRank)}</span>
          </div>
        </div>

        <!-- Rank Position Visual Bar -->
        <div style="position:relative; height:6px; background:var(--bg-tertiary); border-radius:3px; margin:0.5rem 0; overflow:visible;">
          <div style="position:absolute; left:${orPos}%; width:${Math.max(crPos - orPos, 2)}%; height:100%; background:var(--chance-safe); border-radius:3px; opacity:0.35;"></div>
          <div style="position:absolute; left:${userPos}%; top:-3px; width:12px; height:12px; background:var(--accent-primary); border-radius:50%; transform:translateX(-6px); border:2px solid var(--bg-primary); box-shadow:0 0 4px var(--accent-primary);"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.625rem; color:var(--text-muted); margin-bottom:0.5rem;">
          <span>OR: ${formatRank(r.openingRank)}</span>
          <span>CR: ${formatRank(r.closingRank)}</span>
        </div>

        <!-- Reason Text -->
        <div style="font-size:0.75rem; color:var(--text-secondary); padding:0.5rem; background:var(--bg-secondary); border-radius:0.375rem; margin-bottom:0.5rem; line-height:1.4;">
          💡 ${r.reason}
        </div>

        <div class="college-card-bottom">
          <div class="college-card-chance">
            <span class="chance-badge chance-${r.chance}">
              <span class="chance-dot ${r.chance}"></span>
              ${r.chanceLabel}
            </span>
          </div>
          <div class="confidence-meter" style="max-width:140px;width:100%;">
            <div class="confidence-bar">
              <div class="confidence-fill ${r.chance} progress-animate" style="width:${r.confidence}%;"></div>
            </div>
            <span class="confidence-value" style="color:var(--chance-${r.chance})">${r.confidence}%</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function initResultsEvents() {
  // Cleanup previous subscriptions
  if (unsubBookmarks) { unsubBookmarks(); unsubBookmarks = null; }
  if (unsubCompare) { unsubCompare(); unsubCompare = null; }

  // Mobile filter toggle
  const filterToggle = document.getElementById('filter-toggle-btn');
  const filterPanel = document.getElementById('filter-panel-content');
  if (filterToggle && filterPanel) {
    // Start collapsed on mobile
    if (window.innerWidth <= 768) {
      filterPanel.style.display = 'none';
    }
    filterToggle.addEventListener('click', () => {
      const isHidden = filterPanel.style.display === 'none';
      filterPanel.style.display = isHidden ? '' : 'none';
      filterToggle.querySelector('[data-lucide="chevron-down"], [data-lucide="chevron-up"]');
      const icon = filterToggle.querySelectorAll('i')[1];
      if (icon) {
        icon.setAttribute('data-lucide', isHidden ? 'chevron-up' : 'chevron-down');
        if (window.lucide) window.lucide.createIcons({ nodes: [icon] });
      }
    });
  }

  // Search
  const searchInput = document.getElementById('results-search');
  if (searchInput) {
    const handleSearch = debounce(() => {
      currentFilters.search = searchInput.value;
      applyFilters();
    }, 250);
    searchInput.addEventListener('input', handleSearch);
  }

  // Sort
  const sortSelect = document.getElementById('results-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentFilters.sort = sortSelect.value;
      applyFilters();
    });
  }

  // Export
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = currentResults.map(r => ({
        College: r.collegeName,
        Branch: r.branchName,
        Type: r.collegeType,
        City: r.city,
        'Opening Rank (2025)': r.openingRank,
        'Closing Rank (2025)': r.closingRank,
        'Adj. Closing (2026 Est.)': r.adjustedCR,
        Chance: r.chanceLabel,
        'Confidence %': r.confidence,
        Reason: r.reason,
        'Data Year': r.dataYear,
        Source: r.sourceRef,
      }));
      exportToCSV(data, 'uptac-2026-predictions.csv');
      showToast('Results exported as CSV!', 'success');
    });
  }

  // Global filter handlers
  window.__filterResults__ = applyFilters;
  window.__resetFilters__ = () => {
    document.querySelectorAll('[name^="filter-"]').forEach(el => {
      if (el.type === 'radio' && el.value === 'all') el.checked = true;
    });
    const branchFilter = document.getElementById('filter-branch');
    if (branchFilter) branchFilter.value = 'all';
    currentFilters = { chance: 'all', collegeType: 'all', region: 'all', branch: 'all', sort: 'chance', search: '' };
    const searchInput = document.getElementById('results-search');
    if (searchInput) searchInput.value = '';
    applyFilters();
  };

  // Bookmark handler — instant UI update
  window.__toggleBookmark__ = (key, btnEl) => {
    const added = toggleBookmark(key);
    showToast(added ? 'College bookmarked!' : 'Bookmark removed', added ? 'success' : 'info');

    // Determine current state (check both exact key and college-level)
    const collegeId = key.split('__')[0];
    const nowSaved = isBookmarked(key) || isCollegeBookmarked(collegeId);

    // Instant button update
    if (btnEl) {
      const iconName = nowSaved ? 'bookmark-check' : 'bookmark';
      btnEl.className = nowSaved ? 'bookmarked' : '';
      btnEl.setAttribute('data-tooltip', nowSaved ? 'Remove bookmark' : 'Bookmark');
      btnEl.innerHTML = `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i>`;
      btnEl.classList.add('bookmark-pop');
      setTimeout(() => btnEl.classList.remove('bookmark-pop'), 400);
      if (window.lucide) window.lucide.createIcons({ nodes: [btnEl] });
    }

    // Update header badge
    renderHeader();
    if (window.lucide) window.lucide.createIcons();
  };

  // Compare handler — instant UI update
  window.__toggleCompare__ = (collegeId, btnEl) => {
    const success = toggleCompare(collegeId);
    if (!success) {
      showToast('Maximum 3 colleges can be compared', 'error');
      return;
    }
    const isNowCompared = isInCompare(collegeId);
    showToast(isNowCompared ? 'Added to compare!' : 'Removed from compare', isNowCompared ? 'success' : 'info');

    // Instant button update
    if (btnEl) {
      const iconName = isNowCompared ? 'check-square' : 'columns-2';
      btnEl.setAttribute('data-tooltip', isNowCompared ? 'Remove from compare' : 'Add to compare');
      btnEl.innerHTML = `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i>`;
      if (window.lucide) window.lucide.createIcons({ nodes: [btnEl] });
    }

    // Update header badge
    renderHeader();
    if (window.lucide) window.lucide.createIcons();
  };

  // Subscribe to external state changes to re-sync all buttons on the grid
  unsubBookmarks = subscribe('bookmarks', () => {
    applyFilters();
    renderHeader();
    if (window.lucide) window.lucide.createIcons();
  });

  unsubCompare = subscribe('compareList', () => {
    applyFilters();
    renderHeader();
    if (window.lucide) window.lucide.createIcons();
  });
}

function applyFilters() {
  // Read filter state from DOM
  const chanceRadio = document.querySelector('[name="filter-chance"]:checked');
  const typeRadio = document.querySelector('[name="filter-type"]:checked');
  const regionRadio = document.querySelector('[name="filter-region"]:checked');
  const branchSelect = document.getElementById('filter-branch');

  currentFilters.chance = chanceRadio ? chanceRadio.value : 'all';
  currentFilters.collegeType = typeRadio ? typeRadio.value : 'all';
  currentFilters.region = regionRadio ? regionRadio.value : 'all';
  currentFilters.branch = branchSelect ? branchSelect.value : 'all';

  let filtered = filterResults(currentResults, currentFilters);
  filtered = sortResults(filtered, currentFilters.sort);

  const grid = document.getElementById('results-grid');
  if (grid) {
    grid.innerHTML = renderResultCards(filtered);
    if (window.lucide) window.lucide.createIcons();
  }

  const countEl = document.getElementById('results-count');
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${currentResults.length} results`;
  }
}
