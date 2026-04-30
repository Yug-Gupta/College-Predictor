// ============================================
// FOOTER.JS — Site Footer
// ============================================

export function renderFooter() {
  const footer = document.getElementById('site-footer');
  footer.innerHTML = `
    <div class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>🎓 UPTAC College Predictor 2026</h3>
            <p>Helping engineering aspirants find the right AKTU college based on JEE Main rank, category, and preferences. Built on 2025 counselling data for 2026 predictions.</p>
          </div>
          
          <div class="footer-col">
            <h4>Quick Links</h4>
            <div class="footer-links-list">
              <a href="#/" data-link>Home</a>
              <a href="#/predict" data-link>College Predictor</a>
              <a href="#/compare" data-link>Compare Colleges</a>
              <a href="#/saved" data-link>Saved Colleges</a>
            </div>
          </div>
          
          <div class="footer-col">
            <h4>Resources</h4>
            <div class="footer-links-list">
              <a href="#/guide" data-link>Counselling Guide</a>
              <a href="#/guide" data-link>FAQ</a>
              <a href="#/about" data-link>About</a>
              <a href="#/about" data-link>Disclaimer</a>
            </div>
          </div>
          
          <div class="footer-col">
            <h4>Official Links</h4>
            <div class="footer-links-list">
              <a href="https://uptac.admissions.nic.in" target="_blank" rel="noopener">UPTAC Portal</a>
              <a href="https://aktu.ac.in" target="_blank" rel="noopener">AKTU Official</a>
              <a href="https://jeemain.nta.ac.in" target="_blank" rel="noopener">JEE Main</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>© 2026 UPTAC College Predictor. Made with ❤️ for engineering aspirants.</p>
          <p>Predictions are estimates based on 2025 data. Always verify with official UPTAC portal.</p>
        </div>
      </div>
    </div>
  `;
}
