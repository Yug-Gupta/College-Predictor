// ============================================
// COMPARE.JS — Compare Colleges Page (Official Data)
// ============================================

import { getCompareList, clearCompare, toggleCompare, subscribe } from '../state.js';
import { getCollege } from '../data/colleges.js';
import { getCutoffs, DATA_YEAR } from '../data/cutoffs.js';
import { formatRank } from '../utils/format.js';
import { showToast } from '../utils/dom.js';
import { renderHeader } from '../components/header.js';

let unsubCompare = null;

export async function renderCompare() {
  const compareIds = getCompareList();
  return renderCompareContent(compareIds);
}

function renderCompareContent(compareIds) {
  if (compareIds.length === 0) {
    return `
      <div class="compare-page">
        <div class="container-sm">
          <h1 style="margin-bottom:0.5rem;">Compare Colleges</h1>
          <p class="text-muted mb-3">Add colleges from the results page to compare them side by side.</p>
          <div class="empty-state" style="padding:4rem 2rem;">
            <div class="empty-state-icon"><i data-lucide="columns-2" style="width:64px;height:64px;"></i></div>
            <h3>No Colleges to Compare</h3>
            <p>Use the compare button on college cards in your prediction results to add colleges here.</p>
            <a href="#/predict" data-link class="btn btn-primary mt-2">
              <i data-lucide="search" style="width:18px;height:18px;"></i>
              Predict Colleges First
            </a>
          </div>
        </div>
      </div>
    `;
  }

  const collegesData = compareIds.map(id => {
    const college = getCollege(id);
    if (!college) return null;
    const cutoffData = getCutoffs({ collegeId: id, round: 'Round 1', category: 'OPEN', quota: 'Home State' });
    const cseCutoff = cutoffData.find(c => c.branchCode === 'CSE');
    const allCutoffs = getCutoffs({ collegeId: id });
    return { ...college, cutoffs: cutoffData, cseCutoff, totalRecords: allCutoffs.length };
  }).filter(Boolean);

  const rows = [
    { label: 'Type', key: 'type' },
    { label: 'City', key: 'city' },
    { label: 'Region', key: 'region' },
    { label: 'Data Year', key: null, fmt: () => DATA_YEAR },
    { label: 'CSE Opening Rank', key: 'cseCutoff', fmt: v => v ? formatRank(v.openingRank) : '—' },
    { label: 'CSE Closing Rank', key: 'cseCutoff', fmt: v => v ? formatRank(v.closingRank) : '—' },
    { label: 'Branches', key: 'branches', fmt: v => v ? v.length + ' branches' : '—' },
    { label: 'Total Records', key: 'totalRecords', fmt: v => v ? v.toLocaleString() : '—' },
  ];

  return `
    <div class="compare-page">
      <div class="container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
          <div>
            <h1>Compare Colleges</h1>
            <p class="text-muted text-sm">Side-by-side comparison of ${collegesData.length} college${collegesData.length > 1 ? 's' : ''} · ${DATA_YEAR} official data</p>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="window.__clearCompare__()">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
            Clear All
          </button>
        </div>

        <div class="compare-grid">
          ${collegesData.map(c => `
            <div class="compare-card">
              <div class="compare-card-header">
                <span class="badge ${c.type === 'Government' ? 'badge-govt' : 'badge-pvt'}" style="margin-bottom:0.5rem;">${c.type}</span>
                <h3>${c.shortName}</h3>
                <p class="text-sm text-muted mt-1">${c.city}</p>
                <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.75rem;">
                  <a href="#/college?id=${c.id}" data-link class="btn btn-sm btn-secondary">View Details</a>
                  <button class="btn btn-sm btn-ghost" onclick="window.__removeCompare__('${c.id}')">
                    <i data-lucide="x" style="width:14px;height:14px;"></i>
                  </button>
                </div>
              </div>
              ${rows.map(row => {
                const val = row.key ? c[row.key] : null;
                const display = row.fmt ? row.fmt(val) : (val || '—');
                return `
                  <div class="compare-row">
                    <span class="label">${row.label}</span>
                    <span class="value">${display}</span>
                  </div>
                `;
              }).join('')}
              <div class="compare-row">
                <span class="label">Branches</span>
                <span class="value" style="text-align:right;">
                  <div style="display:flex;flex-wrap:wrap;gap:0.25rem;justify-content:flex-end;">
                    ${c.branches ? c.branches.slice(0, 6).map(b => `<span class="tag" style="font-size:0.625rem;padding:0.125rem 0.375rem;">${b}</span>`).join('') : '—'}
                    ${c.branches && c.branches.length > 6 ? `<span class="tag" style="font-size:0.625rem;padding:0.125rem 0.375rem;">+${c.branches.length - 6} more</span>` : ''}
                  </div>
                </span>
              </div>
            </div>
          `).join('')}

          ${compareIds.length < 3 ? `
            <div class="compare-add-slot" onclick="location.hash='#/predict'">
              <i data-lucide="plus" style="width:32px;height:32px;"></i>
              <span style="font-size:0.875rem;font-weight:600;">Add College</span>
              <span style="font-size:0.75rem;">From prediction results</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Re-render the compare page content in-place without full page reload
 */
function refreshCompareUI() {
  const compareIds = getCompareList();
  const pageContent = document.getElementById('page-content');
  if (!pageContent) return;

  // Re-render the full compare content into the page
  pageContent.innerHTML = `<div class="page-enter">${renderCompareContent(compareIds)}</div>`;

  // Re-render header (badge counts)
  renderHeader();

  // Re-init icons
  if (window.lucide) window.lucide.createIcons();
}

export function initCompareEvents() {
  // Cleanup previous subscription
  if (unsubCompare) { unsubCompare(); unsubCompare = null; }

  window.__clearCompare__ = () => {
    clearCompare();
    showToast('Compare list cleared', 'info');
    // Instant UI update — no page reload needed
    refreshCompareUI();
  };

  window.__removeCompare__ = (id) => {
    toggleCompare(id);
    showToast('College removed from compare', 'info');
    // Instant UI update — no page reload needed
    refreshCompareUI();
  };

  // Subscribe so external changes also reflect here
  unsubCompare = subscribe('compareList', () => {
    refreshCompareUI();
  });
}
