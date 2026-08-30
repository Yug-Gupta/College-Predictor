// ============================================
// SAVED.JS — Saved/Bookmarked Colleges Page
// ============================================

import { getBookmarks, getRecentlyViewed, toggleBookmark, clearBookmarks, subscribe } from '../state.js';
import { getCollege } from '../data/colleges.js';
import { getBranchName } from '../data/branches.js';
import { parseCollegeKey, formatRank } from '../utils/format.js';
import { getCutoffs } from '../data/cutoffs.js';
import { showToast } from '../utils/dom.js';
import { exportToCSV } from '../utils/export.js';
import { renderHeader } from '../components/header.js';

let unsubBookmarks = null;

export async function renderSaved() {
  const bookmarks = getBookmarks();
  const recentlyViewed = getRecentlyViewed();

  const bookmarkCards = renderBookmarkCards(bookmarks);
  const recentCards = renderRecentCards(recentlyViewed);

  return `
    <div class="saved-page">
      <div class="container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
          <div>
            <h1>Saved Colleges</h1>
            <p class="text-muted text-sm" id="saved-count-label">${bookmarks.length} college${bookmarks.length !== 1 ? 's' : ''} saved</p>
          </div>
          <div style="display:flex;gap:0.5rem;" id="saved-actions">
            ${bookmarks.length > 0 ? `
              <button class="btn btn-secondary btn-sm" onclick="window.__exportSaved__()">
                <i data-lucide="download" style="width:14px;height:14px;"></i> Export
              </button>
              <button class="btn btn-ghost btn-sm" onclick="window.__clearAllSaved__()">
                <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Clear All
              </button>
            ` : ''}
          </div>
        </div>

        <div id="saved-grid-container">
          ${bookmarks.length > 0 ? `
            <div class="saved-grid stagger-in reveal" id="saved-grid">
              ${bookmarkCards}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="bookmark" style="width:64px;height:64px;"></i></div>
              <h3>No Saved Colleges</h3>
              <p>Bookmark colleges from your prediction results to save them here for quick access.</p>
              <a href="#/predict" data-link class="btn btn-primary mt-2 btn-3d">
                <i data-lucide="search" style="width:18px;height:18px;"></i>
                Predict Colleges
              </a>
            </div>
          `}
        </div>

        <div id="recent-section-container">
          ${recentlyViewed.length > 0 ? `
            <div style="margin-top:3rem;">
              <h2 style="font-size:1.25rem;margin-bottom:1rem;" class="reveal">
                <i data-lucide="clock" style="width:20px;height:20px;display:inline;vertical-align:text-bottom;margin-right:0.375rem;"></i>
                Recently Viewed
              </h2>
              <div class="grid grid-3 gap-md stagger-in reveal">
                ${recentCards}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderBookmarkCards(bookmarks) {
  return bookmarks.map(key => {
    const parts = key.split('__');
    const collegeId = parts[0];
    const branchCode = parts[1];
    const college = getCollege(collegeId);
    if (!college) return '';

    const cutoff = getCutoffs({ collegeId, branchCode, round: 'Round 1', category: 'OPEN', quota: 'Home State' })[0];

    return `
      <div class="college-card" data-bookmark-key="${key}" onclick="if(event.target.closest('button'))return; location.hash='#/college?id=${collegeId}'">
        <div class="college-card-top">
          <div class="college-card-info">
            <h3>${college.shortName}</h3>
            ${branchCode ? `<span class="college-branch">${getBranchName(branchCode)}</span>` : ''}
          </div>
          <button class="bookmarked" data-tooltip="Remove bookmark" onclick="window.__removeSavedBookmark__('${key}')">
            <i data-lucide="bookmark-x" style="width:18px;height:18px;"></i>
          </button>
        </div>
        <div class="college-card-meta">
          <span class="badge ${college.type === 'Government' ? 'badge-govt' : 'badge-pvt'}">${college.type}</span>
          <span class="text-xs text-muted">${college.city}</span>
          <span class="badge" style="font-size:0.625rem; padding:0.125rem 0.375rem; background:var(--accent-primary); color:white;">📅 2025 Data</span>
        </div>
        ${cutoff ? `
        <div class="college-card-ranks">
          <div class="rank-item">
            <span class="rank-label">Opening Rank</span>
            <span class="rank-value">${formatRank(cutoff.openingRank)}</span>
          </div>
          <div class="rank-item">
            <span class="rank-label">Closing Rank</span>
            <span class="rank-value">${formatRank(cutoff.closingRank)}</span>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderRecentCards(recentlyViewed) {
  return recentlyViewed.slice(0, 6).map(collegeId => {
    const college = getCollege(collegeId);
    if (!college) return '';
    return `
      <a href="#/college?id=${collegeId}" data-link class="card hover-lift reveal" style="padding:1rem;display:flex;align-items:center;gap:0.75rem;text-decoration:none;">
        <div style="width:36px;height:36px;border-radius:var(--radius-md);background:var(--accent-light);color:var(--accent-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i data-lucide="building-2" style="width:18px;height:18px;"></i>
        </div>
        <div>
          <div style="font-size:0.875rem;font-weight:600;color:var(--text-heading);">${college.shortName}</div>
          <div class="text-xs text-muted">${college.city} • ${college.type}</div>
        </div>
      </a>
    `;
  }).join('');
}

/**
 * Re-render the saved grid in-place without full page reload
 */
function refreshSavedUI() {
  const bookmarks = getBookmarks();

  // Update count label
  const countLabel = document.getElementById('saved-count-label');
  if (countLabel) {
    countLabel.textContent = `${bookmarks.length} college${bookmarks.length !== 1 ? 's' : ''} saved`;
  }

  // Update actions (show/hide Export + Clear All buttons)
  const actionsContainer = document.getElementById('saved-actions');
  if (actionsContainer) {
    if (bookmarks.length > 0) {
      actionsContainer.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="window.__exportSaved__()">
          <i data-lucide="download" style="width:14px;height:14px;"></i> Export
        </button>
        <button class="btn btn-ghost btn-sm" onclick="window.__clearAllSaved__()">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i> Clear All
        </button>
      `;
    } else {
      actionsContainer.innerHTML = '';
    }
  }

  // Update grid content
  const gridContainer = document.getElementById('saved-grid-container');
  if (gridContainer) {
    if (bookmarks.length > 0) {
      gridContainer.innerHTML = `
        <div class="saved-grid stagger-in reveal" id="saved-grid">
          ${renderBookmarkCards(bookmarks)}
        </div>
      `;
    } else {
      gridContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i data-lucide="bookmark" style="width:64px;height:64px;"></i></div>
          <h3>No Saved Colleges</h3>
          <p>Bookmark colleges from your prediction results to save them here for quick access.</p>
          <a href="#/predict" data-link class="btn btn-primary mt-2">
            <i data-lucide="search" style="width:18px;height:18px;"></i>
            Predict Colleges
          </a>
        </div>
      `;
    }
  }

  // Re-render header (badge counts)
  renderHeader();

  // Re-init icons
  if (window.lucide) window.lucide.createIcons();
}

export function initSavedEvents() {
  // Cleanup previous subscription
  if (unsubBookmarks) { unsubBookmarks(); unsubBookmarks = null; }

  window.__removeSavedBookmark__ = (key) => {
    toggleBookmark(key);
    showToast('Bookmark removed', 'info');
    refreshSavedUI();
  };

  window.__clearAllSaved__ = () => {
    clearBookmarks();
    showToast('All bookmarks cleared', 'info');
    refreshSavedUI();
  };

  window.__exportSaved__ = () => {
    const bookmarks = getBookmarks();
    const data = bookmarks.map(key => {
      const parts = key.split('__');
      const college = getCollege(parts[0]);
      return {
        College: college ? college.name : parts[0],
        Branch: parts[1] ? getBranchName(parts[1]) : 'All',
        Type: college ? college.type : '',
        City: college ? college.city : '',
      };
    });
    exportToCSV(data, 'uptac-saved-colleges.csv');
    showToast('Saved colleges exported!', 'success');
  };

  // Subscribe so external changes (e.g., from results page) also reflect here
  unsubBookmarks = subscribe('bookmarks', () => {
    refreshSavedUI();
  });
}
