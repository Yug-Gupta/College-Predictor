// ============================================
// ABOUT.JS — About + Disclaimer Page
// ============================================

export async function renderAbout() {
  return `
    <div class="about-page">
      <div class="container">
        <div class="about-hero">
          <h1>About UPTAC College Predictor</h1>
          <p>Helping engineering aspirants make informed counselling decisions</p>
        </div>

        <div class="about-content">
          <h2>Our Purpose</h2>
          <p>UPTAC College Predictor 2026 is a free, open-source tool designed to help JEE Main aspirants predict their chances of admission at various AKTU-affiliated engineering colleges in Uttar Pradesh.</p>
          <p>We believe every student deserves access to data-driven decision-making tools. Our predictor uses real counselling data from 2025 to estimate admission chances for the upcoming 2026 UPTAC counselling cycle.</p>

          <h2>How It Works</h2>
          <p>The prediction engine works by matching your JEE Main rank against <strong>official opening and closing rank data</strong> from the UPTAC 2025 B.Tech Counselling OR-CR report (admissions.nic.in). We apply a 5% adjustment factor to account for year-over-year variations in cutoff trends.</p>
          <p>Each college-branch combination is classified into three chance levels:</p>
          <ul style="list-style:disc;padding-left:1.5rem;margin:0.75rem 0;">
            <li><strong style="color:var(--chance-safe);">Safe</strong> — Your rank is well within the cutoff range. High probability of admission.</li>
            <li><strong style="color:var(--chance-moderate);">Moderate</strong> — Your rank is near the closing rank. Decent chance, depends on the year.</li>
            <li><strong style="color:var(--chance-ambitious);">Ambitious</strong> — Your rank slightly exceeds the cutoff. Lower probability but possible in later rounds.</li>
          </ul>

          <h2>Data Sources</h2>
          <p>Our dataset is sourced <strong>entirely from the official UPTAC counselling portal</strong> (<a href="https://uptac.admissions.nic.in" target="_blank" rel="noopener" style="color:var(--accent-primary);text-decoration:underline;">uptac.admissions.nic.in</a>). All 10,804 records were extracted directly from the official OR-CR (Opening Rank / Closing Rank) report for B.Tech 2025.</p>
          <p>The dataset covers <strong>200 colleges</strong> with <strong>50 B.Tech branches</strong>, across all official categories (OPEN, BC, SC, ST, EWS, and subcategories), both Home State and All India quotas, and all counselling rounds.</p>

          <div class="disclaimer-box">
            <h3>
              <i data-lucide="alert-triangle" style="width:18px;height:18px;"></i>
              Important Disclaimer
            </h3>
            <p style="font-size:0.875rem;line-height:1.7;color:var(--text-secondary);">
              This tool provides <strong>estimated predictions</strong> based on previous year's data. Actual cutoffs for 2026 UPTAC counselling may vary significantly based on:
            </p>
            <ul style="list-style:disc;padding-left:1.5rem;margin:0.5rem 0;font-size:0.875rem;color:var(--text-secondary);">
              <li>Number of applicants in 2026</li>
              <li>Difficulty level of JEE Main 2026</li>
              <li>Changes in college intake capacity</li>
              <li>Policy changes by AKTU/government</li>
              <li>New colleges or branches added</li>
            </ul>
            <p style="font-size:0.875rem;line-height:1.7;color:var(--text-secondary);margin-top:0.5rem;">
              <strong>Always verify</strong> with the official UPTAC portal and consult official OR-CR data before making final counselling decisions. We are not affiliated with AKTU, UPTAC, or any government body.
            </p>
          </div>

          <h2>Key Features</h2>
          <div class="grid grid-2 gap-md" style="margin:1rem 0;">
            <div class="card" style="padding:1.25rem;">
              <h4 style="margin-bottom:0.25rem;">🎯 Smart Predictions</h4>
              <p class="text-sm">Rank-based predictions with Safe/Moderate/Ambitious classification and confidence percentages.</p>
            </div>
            <div class="card" style="padding:1.25rem;">
              <h4 style="margin-bottom:0.25rem;">📊 Cutoff Trends</h4>
              <p class="text-sm">Visualize cutoff trends across rounds with interactive Chart.js charts.</p>
            </div>
            <div class="card" style="padding:1.25rem;">
              <h4 style="margin-bottom:0.25rem;">⚖️ College Compare</h4>
              <p class="text-sm">Side-by-side comparison of up to 3 colleges across multiple parameters.</p>
            </div>
            <div class="card" style="padding:1.25rem;">
              <h4 style="margin-bottom:0.25rem;">🔖 Bookmark & Export</h4>
              <p class="text-sm">Save favourite colleges and export prediction results as CSV files.</p>
            </div>
            <div class="card" style="padding:1.25rem;">
              <h4 style="margin-bottom:0.25rem;">🎨 5 Visual Themes</h4>
              <p class="text-sm">Indigo Pro, Midnight Dark, Ocean Breeze, Sunset Warm, and Forest Green themes.</p>
            </div>
            <div class="card" style="padding:1.25rem;">
              <h4 style="margin-bottom:0.25rem;">📱 Fully Responsive</h4>
              <p class="text-sm">Works flawlessly on mobile, tablet, and desktop screens.</p>
            </div>
          </div>

          <h2>Tech Stack</h2>
          <p>Built with modern web technologies for performance and reliability:</p>
          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin:0.75rem 0;">
            <span class="tag">Vite</span>
            <span class="tag">Vanilla JavaScript</span>
            <span class="tag">CSS Custom Properties</span>
            <span class="tag">Chart.js</span>
            <span class="tag">Lucide Icons</span>
            <span class="tag">SPA Router</span>
            <span class="tag">LocalStorage</span>
          </div>

          <h2>Contributing</h2>
          <p>This is an open-source project. Contributions are welcome! If you have access to updated UPTAC cutoff data, bug fixes, or feature suggestions, feel free to contribute.</p>

          <h2>Contact</h2>
          <p>For questions, suggestions, or data corrections, please reach out through the GitHub repository.</p>
          
          <div style="text-align:center;margin-top:2rem;padding-top:2rem;border-top:1px solid var(--border-light);">
            <p class="text-muted text-sm">Made with ❤️ for engineering aspirants • © 2026 UPTAC College Predictor</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initAboutEvents() {
  // No special events needed
}
