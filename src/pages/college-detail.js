// ============================================
// COLLEGE-DETAIL.JS — Individual College Page (Official Data)
// ============================================

import { getCollege } from '../data/colleges.js';
import { getCutoffs, DATA_YEAR, DATA_SOURCE } from '../data/cutoffs.js';
import { getBranchName } from '../data/branches.js';
import { formatRank } from '../utils/format.js';
import { isCollegeBookmarked, toggleCollegeBookmark, addRecentlyViewed, toggleCompare, isInCompare, getFormData, subscribe } from '../state.js';
import { classifyChance } from '../engine/predictor.js';
import { showToast } from '../utils/dom.js';
import { renderHeader } from '../components/header.js';

let unsubBookmarks = null;
let unsubCompare = null;

export async function renderCollegeDetail(params) {
  const collegeId = params.id;
  if (!collegeId) {
    return `<div class="empty-state"><h3>College not found</h3><a href="#/" data-link class="btn btn-primary">Go Home</a></div>`;
  }

  const college = getCollege(collegeId);
  if (!college) {
    return `<div class="empty-state"><h3>College not found</h3><p>The requested college does not exist in our database.</p><a href="#/" data-link class="btn btn-primary">Go Home</a></div>`;
  }

  // Track recently viewed
  addRecentlyViewed(collegeId);

  const bookmarked = isCollegeBookmarked(collegeId);
  const compared = isInCompare(collegeId);
  const formData = getFormData();
  const userRank = formData ? parseInt(formData.rank, 10) : null;

  // Get all cutoffs for this college
  const collegeCutoffs = getCutoffs({ collegeId });
  
  // Group by branch
  const branchGroups = {};
  collegeCutoffs.forEach(c => {
    if (!branchGroups[c.branchCode]) branchGroups[c.branchCode] = [];
    branchGroups[c.branchCode].push(c);
  });

  // Build cutoff table for Round 1, Home State (most common)
  const round1HS = collegeCutoffs.filter(c => c.round === 'Round 1' && c.quota === 'Home State');
  
  const cutoffTableRows = round1HS.map(c => {
    let chanceHtml = '';
    if (userRank) {
      const adjustedOR = Math.round(c.openingRank * 1.05);
      const adjustedCR = Math.round(c.closingRank * 1.05);
      const chance = classifyChance(userRank, adjustedOR, adjustedCR);
      if (chance) {
        chanceHtml = `<span class="chance-badge chance-${chance.level}" style="font-size:0.6875rem;padding:0.2rem 0.5rem;"><span class="chance-dot ${chance.level}"></span>${chance.label} (${chance.confidence}%)</span>`;
      } else {
        chanceHtml = `<span class="text-xs text-muted">—</span>`;
      }
    }
    return `
      <tr>
        <td>${getBranchName(c.branchCode)}</td>
        <td>${c.category}</td>
        <td>${c.seatGender === 'Female Seats' ? '♀️' : ''}</td>
        <td><strong>${formatRank(c.openingRank)}</strong></td>
        <td><strong>${formatRank(c.closingRank)}</strong></td>
        ${userRank ? `<td>${chanceHtml}</td>` : ''}
      </tr>
    `;
  }).join('');

  // Chart data - get opening/closing for rounds
  const chartBranches = Object.keys(branchGroups).slice(0, 3);

  // Build round-wise comparison table for OPEN category
  const roundComparison = collegeCutoffs
    .filter(c => c.category === 'OPEN' && c.quota === 'Home State' && c.seatGender === 'Both Male and Female Seats')
    .sort((a, b) => {
      if (a.branchCode !== b.branchCode) return a.branchCode.localeCompare(b.branchCode);
      const rA = parseInt(a.round.replace('Round ', ''));
      const rB = parseInt(b.round.replace('Round ', ''));
      return rA - rB;
    });

  return `
    <div class="college-detail-page">
      <div class="container">
        <!-- College Header -->
        <div class="college-detail-header">
          <div class="detail-header-inner">
            <div>
              <h1>${college.name}</h1>
              <p>${college.city}, Uttar Pradesh</p>
              <div class="college-detail-meta">
                <span class="meta-item">
                  <i data-lucide="building-2" style="width:14px;height:14px;"></i>
                  ${college.type}
                </span>
                <span class="meta-item">
                  <i data-lucide="map-pin" style="width:14px;height:14px;"></i>
                  ${college.region}
                </span>
                <span class="meta-item" style="color:var(--accent-primary);">
                  <i data-lucide="database" style="width:14px;height:14px;"></i>
                  📅 ${DATA_YEAR} Official Data
                </span>
              </div>
            </div>
            <div class="detail-header-actions">
              <button class="btn ${bookmarked ? 'btn-primary' : 'btn-secondary'}" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);color:white;" 
                      onclick="window.__detailBookmark__('${collegeId}', this)" id="detail-bookmark-btn">
                <i data-lucide="${bookmarked ? 'bookmark-check' : 'bookmark'}" style="width:16px;height:16px;"></i>
                ${bookmarked ? 'Saved' : 'Save'}
              </button>
              <button class="btn ${compared ? 'btn-primary' : 'btn-secondary'}" style="background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.3);color:white;"
                      onclick="window.__detailCompare__('${collegeId}', this)" id="detail-compare-btn">
                <i data-lucide="${compared ? 'check-square' : 'columns-2'}" style="width:16px;height:16px;"></i>
                ${compared ? 'Comparing' : 'Compare'}
              </button>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Main Content -->
          <div>
            <!-- Cutoff Table -->
            <div class="card mb-3" style="padding:0;overflow:hidden;">
              <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border-light);">
                <h3 style="font-size:1rem;">Branch-wise Cutoffs (Round 1 — Home State)</h3>
                <p class="text-sm text-muted mt-1">
                  Source: Official UPTAC ${DATA_YEAR} OR-CR Data (admissions.nic.in)
                  ${userRank ? ` · Your rank: <strong>${formatRank(userRank)}</strong>` : ''}
                </p>
              </div>
              <div style="overflow-x:auto;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th>Category</th>
                      <th>Seat</th>
                      <th>Opening Rank</th>
                      <th>Closing Rank</th>
                      ${userRank ? '<th>Your Chance</th>' : ''}
                    </tr>
                  </thead>
                  <tbody>
                    ${cutoffTableRows || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem;">No cutoff data available for Round 1</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Round-wise Trend -->
            ${roundComparison.length > 0 ? `
            <div class="card mb-3" style="padding:0;overflow:hidden;">
              <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border-light);">
                <h3 style="font-size:1rem;">Round-wise Cutoff Trend (OPEN — Home State)</h3>
                <p class="text-sm text-muted mt-1">How closing ranks changed across counselling rounds in ${DATA_YEAR}</p>
              </div>
              <div style="overflow-x:auto;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th>Round</th>
                      <th>Opening Rank</th>
                      <th>Closing Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${roundComparison.map(c => `
                      <tr>
                        <td>${getBranchName(c.branchCode)}</td>
                        <td>${c.round}</td>
                        <td>${formatRank(c.openingRank)}</td>
                        <td><strong>${formatRank(c.closingRank)}</strong></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            ` : ''}

            <!-- Cutoff Trend Chart -->
            ${chartBranches.length > 0 ? `
            <div class="card mb-3" style="padding:1.5rem;">
              <h3 style="font-size:1rem;margin-bottom:1rem;">Cutoff Trends Across Rounds (OPEN — Home State)</h3>
              <div style="position:relative;height:300px;">
                <canvas id="cutoff-trend-chart"></canvas>
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Sidebar -->
          <div class="detail-sidebar">
            <!-- Quick Stats -->
            <div class="card" style="padding:1.5rem;margin-bottom:1.5rem;">
              <h3 style="font-size:0.9375rem;margin-bottom:1rem;">Quick Info</h3>
              <div style="display:flex;flex-direction:column;gap:0.75rem;">
                <div style="display:flex;justify-content:space-between;font-size:0.8125rem;">
                  <span class="text-muted">Type</span>
                  <strong>${college.type}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8125rem;">
                  <span class="text-muted">City</span>
                  <strong>${college.city}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8125rem;">
                  <span class="text-muted">Region</span>
                  <strong>${college.region}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8125rem;">
                  <span class="text-muted">Branches</span>
                  <strong>${college.branches.length}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8125rem;">
                  <span class="text-muted">Data Year</span>
                  <strong>${DATA_YEAR}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8125rem;">
                  <span class="text-muted">Records</span>
                  <strong>${collegeCutoffs.length}</strong>
                </div>
              </div>
            </div>

            <!-- Branches Offered -->
            <div class="card" style="padding:1.5rem;margin-bottom:1.5rem;">
              <h3 style="font-size:0.9375rem;margin-bottom:0.75rem;">Branches Offered</h3>
              <div style="display:flex;flex-wrap:wrap;gap:0.375rem;">
                ${college.branches.map(b => `<span class="tag">${b}</span>`).join('')}
              </div>
            </div>

            <!-- Data Source -->
            <div class="card" style="padding:1.5rem;margin-bottom:1.5rem;background:var(--bg-secondary);">
              <h3 style="font-size:0.9375rem;margin-bottom:0.75rem;">📊 Data Source</h3>
              <p style="font-size:0.75rem;color:var(--text-muted);line-height:1.5;">
                All cutoff data is from the <strong>Official UPTAC ${DATA_YEAR} B.Tech Counselling OR-CR report</strong> published on admissions.nic.in by Dr. A.P.J. Abdul Kalam Technical University.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initCollegeDetailEvents(params) {
  // Cleanup previous subscriptions
  if (unsubBookmarks) { unsubBookmarks(); unsubBookmarks = null; }
  if (unsubCompare) { unsubCompare(); unsubCompare = null; }

  const collegeId = params.id;

  // Helper: update bookmark button to match current state
  function updateBookmarkButton() {
    const btn = document.getElementById('detail-bookmark-btn');
    if (!btn) return;
    const nowBookmarked = isCollegeBookmarked(collegeId);
    const iconName = nowBookmarked ? 'bookmark-check' : 'bookmark';
    const label = nowBookmarked ? 'Saved' : 'Save';
    btn.innerHTML = `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i> ${label}`;
    btn.classList.toggle('btn-primary', nowBookmarked);
    btn.classList.toggle('btn-secondary', !nowBookmarked);
    if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
  }

  // Helper: update compare button to match current state
  function updateCompareButton() {
    const btn = document.getElementById('detail-compare-btn');
    if (!btn) return;
    const nowCompared = isInCompare(collegeId);
    const iconName = nowCompared ? 'check-square' : 'columns-2';
    const label = nowCompared ? 'Comparing' : 'Compare';
    btn.innerHTML = `<i data-lucide="${iconName}" style="width:16px;height:16px;"></i> ${label}`;
    btn.classList.toggle('btn-primary', nowCompared);
    btn.classList.toggle('btn-secondary', !nowCompared);
    if (window.lucide) window.lucide.createIcons({ nodes: [btn] });
  }

  // Bookmark handler — instant UI update
  window.__detailBookmark__ = (id, btn) => {
    const added = toggleCollegeBookmark(id);
    showToast(added ? 'College saved!' : 'Bookmark removed', added ? 'success' : 'info');
    // State change triggers subscriber below, but we also update immediately
    updateBookmarkButton();
    renderHeader();
    if (window.lucide) window.lucide.createIcons();
  };

  // Compare handler — instant UI update
  window.__detailCompare__ = (id, btn) => {
    const success = toggleCompare(id);
    if (!success) {
      showToast('Maximum 3 colleges can be compared', 'error');
      return;
    }
    const nowCompared = isInCompare(id);
    showToast(nowCompared ? 'Added to compare!' : 'Removed from compare', nowCompared ? 'success' : 'info');
    // State change triggers subscriber below, but we also update immediately
    updateCompareButton();
    renderHeader();
    if (window.lucide) window.lucide.createIcons();
  };

  // Subscribe to external state changes (e.g., if another component modifies bookmarks/compare)
  unsubBookmarks = subscribe('bookmarks', () => {
    updateBookmarkButton();
  });
  unsubCompare = subscribe('compareList', () => {
    updateCompareButton();
  });

  // Render chart
  renderCutoffChart(params.id);
}

function renderCutoffChart(collegeId) {
  const canvas = document.getElementById('cutoff-trend-chart');
  if (!canvas || !window.Chart) return;

  const collegeCutoffs = getCutoffs({ collegeId });
  const branchCodes = [...new Set(collegeCutoffs.map(c => c.branchCode))].slice(0, 4);
  
  const colors = ['#4f46e5', '#0891b2', '#ea580c', '#16a34a'];
  const datasets = branchCodes.map((bc, i) => {
    const data = collegeCutoffs
      .filter(c => c.branchCode === bc && c.category === 'OPEN' && c.quota === 'Home State' && c.seatGender === 'Both Male and Female Seats')
      .sort((a, b) => {
        const rA = parseInt(a.round.replace('Round ', ''));
        const rB = parseInt(b.round.replace('Round ', ''));
        return rA - rB;
      });
    
    return {
      label: bc + ' (Closing)',
      data: data.map(d => ({ x: d.round, y: d.closingRank })),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + '20',
      tension: 0.3,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 7,
    };
  });

  const labels = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 6', 'Round 7'];

  new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, usePointStyle: true } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: Rank ${formatRank(ctx.raw.y || ctx.raw)}` } }
      },
      scales: {
        y: { reverse: true, title: { display: true, text: 'Closing Rank', font: { family: 'Inter', size: 12 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
}
