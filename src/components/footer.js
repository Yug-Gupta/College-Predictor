// ============================================
// FOOTER.JS — Professional Site Footer
// ============================================

export function renderFooter() {
  const footer = document.getElementById('site-footer');
  const currentYear = new Date().getFullYear();

  footer.innerHTML = `
    <div class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <div class="footer-brand-logo">
              <span class="footer-logo-icon" aria-hidden="true">
                <i data-lucide="graduation-cap"></i>
              </span>
              <h3>UPTAC College Predictor</h3>
            </div>
            <p>Helping engineering aspirants find the right AKTU college based on JEE Main rank, category, and preferences. Built on official 2025 counselling data.</p>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h4>Product</h4>
            <div class="footer-links-list">
              <a href="#/" data-link>Home</a>
              <a href="#/predict" data-link>College Predictor</a>
              <a href="#/compare" data-link>Compare Colleges</a>
              <a href="#/saved" data-link>Saved Colleges</a>
            </div>
          </div>

          <!-- Resources -->
          <div class="footer-col">
            <h4>Resources</h4>
            <div class="footer-links-list">
              <a href="#/guide" data-link>Counselling Guide</a>
              <a href="#/guide" data-link>FAQ</a>
              <a href="#/about" data-link>About</a>
              <a href="#/about" data-link>Disclaimer</a>
            </div>
          </div>

          <!-- Official Links -->
          <div class="footer-col">
            <h4>Official</h4>
            <div class="footer-links-list">
              <a href="https://uptac.admissions.nic.in" target="_blank" rel="noopener noreferrer">UPTAC Portal <i data-lucide="external-link" class="footer-external-icon"></i></a>
              <a href="https://aktu.ac.in" target="_blank" rel="noopener noreferrer">AKTU Official <i data-lucide="external-link" class="footer-external-icon"></i></a>
              <a href="https://jeemain.nta.ac.in" target="_blank" rel="noopener noreferrer">JEE Main <i data-lucide="external-link" class="footer-external-icon"></i></a>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="footer-divider"></div>

        <!-- Bottom Bar -->
        <div class="footer-bottom">
          <div class="footer-bottom-left">
            <p class="footer-copyright">&copy; ${currentYear} UPTAC College Predictor. All rights reserved.</p>
            <p class="footer-disclaimer">Predictions are estimates based on 2025 data. Always verify with the official UPTAC portal.</p>
          </div>

          <div class="footer-attribution">
            <span class="footer-attr-label">Designed &amp; Developed by</span>
            <span class="footer-attr-name" id="footer-dev-name">
              Yug Gupta
              <span class="footer-tooltip" id="footer-dev-tooltip" role="tooltip">Full Stack Developer &nbsp;|&nbsp; B.Tech CSIT &nbsp;|&nbsp; Building practical tech solutions</span>
            </span>
            <div class="footer-social-links">
              <a href="https://github.com/Yug-Gupta" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="GitHub">
                <i data-lucide="github"></i>
              </a>
              <a href="https://www.linkedin.com/in/guptayug/" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="LinkedIn">
                <i data-lucide="linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Re-initialize Lucide icons inside footer
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
