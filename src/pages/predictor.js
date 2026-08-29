// ============================================
// PREDICTOR.JS — Predictor Form Page (Updated for Official Data)
// ============================================

import { mainCategories, categories, categoryNames, quotas, seatGenders, seatGenderNames, regions } from '../data/categories.js';
import { branches } from '../data/branches.js';
import { setFormData, getFormData } from '../state.js';
import { navigate } from '../router.js';
import { predict } from '../engine/predictor.js';
import { setResults } from '../state.js';
import { DATA_YEAR, TOTAL_RECORDS } from '../data/cutoffs.js';
import { colleges } from '../data/colleges.js';

// Official round values from UPTAC 2025
const officialRounds = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 6', 'Round 7'];

// College type filter options
const collegeTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'Government', label: 'Government' },
  { value: 'Private', label: 'Private' },
];

export async function renderPredictor() {
  const savedForm = getFormData();

  const categoryOptions = categories.map(c =>
    `<option value="${c}" ${savedForm?.category === c ? 'selected' : ''}>${categoryNames[c] || c}</option>`
  ).join('');

  const quotaOptions = quotas.map(q =>
    `<option value="${q}" ${savedForm?.quota === q ? 'selected' : ''}>${q}</option>`
  ).join('');

  const roundOptions = officialRounds.map(r =>
    `<option value="${r}" ${savedForm?.round === r ? 'selected' : ''}>${r}</option>`
  ).join('');

  const branchOptions = branches.map(b =>
    `<option value="${b.code}" ${savedForm?.branch === b.code ? 'selected' : ''}>${b.name}</option>`
  ).join('');

  const typeOptions = collegeTypes.map(t =>
    `<option value="${t.value}" ${savedForm?.collegeType === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('');

  const regionOptions = regions.map(r =>
    `<option value="${r}" ${savedForm?.region === r ? 'selected' : ''}>${r}</option>`
  ).join('');

  const genderOptions = seatGenders.map(g =>
    `<option value="${g}" ${(!savedForm?.seatGender && g === 'Both Male and Female Seats') || savedForm?.seatGender === g ? 'selected' : ''}>${seatGenderNames[g] || g}</option>`
  ).join('');

  return `
    <div class="predictor-page">
      <div class="container-sm">
        <div class="predictor-card reveal">
          <div class="predictor-card-header">
            <h2>UPTAC B.Tech College Predictor</h2>
            <p>Enter your details below to find the best colleges for 2026 counselling</p>
          </div>

          <form class="predictor-form" id="predictor-form">
            <!-- Section: Basic Info -->
            <div class="form-grid-2">
              <div class="form-section-title">Your Rank & Category</div>

              <div class="form-group" id="fg-rank">
                <label class="form-label">JEE Main CRL Rank <span class="required">*</span></label>
                <input type="number" class="form-input" id="input-rank" name="rank"
                       placeholder="Enter your JEE Main rank"
                       value="${savedForm?.rank || ''}"
                       min="1" max="1500000" required />
                <span class="form-error" id="err-rank">Please enter a valid rank (1 - 15,00,000)</span>
              </div>

              <div class="form-group">
                <label class="form-label">Counselling Round <span class="required">*</span></label>
                <select class="form-select" id="input-round" name="round" required>
                  ${roundOptions}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Category <span class="required">*</span></label>
                <select class="form-select" id="input-category" name="category" required>
                  ${categoryOptions}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Quota <span class="required">*</span></label>
                <select class="form-select" id="input-quota" name="quota" required>
                  ${quotaOptions}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Seat Gender</label>
                <select class="form-select" id="input-gender" name="seatGender">
                  ${genderOptions}
                </select>
                <span class="form-hint">Filter by seat gender from official UPTAC data</span>
              </div>

              <!-- Section: Preferences -->
              <div class="form-divider"></div>
              <div class="form-section-title">Preferences (Optional)</div>

              <div class="form-group">
                <label class="form-label">Preferred Branch</label>
                <select class="form-select" id="input-branch" name="branch">
                  <option value="all" ${!savedForm?.branch || savedForm?.branch === 'all' ? 'selected' : ''}>All Branches</option>
                  ${branchOptions}
                </select>
                <span class="form-hint">Leave as "All" to see all available branches</span>
              </div>

              <div class="form-group">
                <label class="form-label">College Type</label>
                <select class="form-select" id="input-type" name="collegeType">
                  ${typeOptions}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Region Preference</label>
                <select class="form-select" id="input-region" name="region">
                  <option value="all" ${!savedForm?.region || savedForm?.region === 'all' ? 'selected' : ''}>All Regions</option>
                  ${regionOptions}
                </select>
              </div>

              <!-- Submit -->
              <div class="form-actions">
                <button type="submit" class="btn btn-primary btn-lg btn-ripple" id="predict-btn">
                  <i data-lucide="search" style="width:20px;height:20px;"></i>
                  Predict Colleges
                </button>
                <button type="button" class="btn btn-ghost btn-lg" id="reset-btn">
                  <i data-lucide="rotate-ccw" style="width:18px;height:18px;"></i>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Data Source Info -->
        <div class="card-flat reveal" style="margin-top:1.5rem; padding:1.5rem;">
          <h3 style="font-size:1rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <i data-lucide="info" style="width:18px;height:18px;color:var(--accent-primary);"></i>
            How Predictions Work
          </h3>
          <div style="font-size:0.8125rem; color:var(--text-secondary); line-height:1.7;">
            <p>Predictions based on <strong>official UPTAC ${DATA_YEAR} counselling data</strong> from admissions.nic.in.
            Results are estimates for 2026 UPTAC counselling with a ±5% adjustment for yearly variation.</p>
            <div style="display:flex; gap:1rem; margin-top:0.75rem; flex-wrap:wrap;">
              <span class="chance-badge chance-safe"><span class="chance-dot safe"></span> Safe — High admission probability</span>
              <span class="chance-badge chance-moderate"><span class="chance-dot moderate"></span> Moderate — Decent chance</span>
              <span class="chance-badge chance-ambitious"><span class="chance-dot ambitious"></span> Ambitious — Lower probability</span>
            </div>
            <div style="margin-top:1rem; padding:0.75rem; background:var(--bg-secondary); border-radius:0.5rem; display:flex; gap:1.5rem; flex-wrap:wrap; font-size:0.75rem; color:var(--text-muted);">
              <span>📊 <strong>${colleges.length}</strong> Colleges</span>
              <span>🎓 <strong>${branches.length}</strong> Branches</span>
              <span>📋 <strong>${TOTAL_RECORDS.toLocaleString()}</strong> Official Records</span>
              <span>📅 <strong>${DATA_YEAR}</strong> → <strong>2026</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize predictor form events
 */
export function initPredictorEvents() {
  const form = document.getElementById('predictor-form');
  const resetBtn = document.getElementById('reset-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate
      const rankInput = document.getElementById('input-rank');
      const rank = parseInt(rankInput.value, 10);
      const rankGroup = document.getElementById('fg-rank');

      if (isNaN(rank) || rank <= 0 || rank > 1500000) {
        rankGroup.classList.add('error');
        rankInput.focus();
        return;
      }
      rankGroup.classList.remove('error');

      // Collect form data
      const formData = {
        rank: rankInput.value,
        round: document.getElementById('input-round').value,
        category: document.getElementById('input-category').value,
        quota: document.getElementById('input-quota').value,
        branch: document.getElementById('input-branch').value,
        collegeType: document.getElementById('input-type').value,
        region: document.getElementById('input-region').value,
        seatGender: document.getElementById('input-gender').value,
      };

      // Save & run prediction
      setFormData(formData);
      const results = predict(formData);
      setResults(results);

      // Navigate to results
      navigate('/results');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const form = document.getElementById('predictor-form');
      if (form) form.reset();
      const rankGroup = document.getElementById('fg-rank');
      if (rankGroup) rankGroup.classList.remove('error');
    });
  }

  // Real-time rank validation
  const rankInput = document.getElementById('input-rank');
  if (rankInput) {
    rankInput.addEventListener('input', () => {
      const rankGroup = document.getElementById('fg-rank');
      rankGroup.classList.remove('error');
    });
  }
}
