// ============================================
// MAIN.JS — Application Bootstrap
// ============================================

import { registerRoute, initRouter } from './router.js';
import { initState, setTheme, getTheme, subscribe } from './state.js';
import { renderHeader, updateHeaderScroll } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { initScrollEffects } from './utils/scroll.js';
import { initEffects, updateHero3DTheme } from './utils/effects3d.js';

// --- Page Imports ---
import { renderHome } from './pages/home.js';
import { renderPredictor, initPredictorEvents } from './pages/predictor.js';
import { renderResults, initResultsEvents } from './pages/results.js';
import { renderCollegeDetail, initCollegeDetailEvents } from './pages/college-detail.js';
import { renderCompare, initCompareEvents } from './pages/compare.js';
import { renderSaved, initSavedEvents } from './pages/saved.js';
import { renderGuide, initGuideEvents } from './pages/guide.js';
import { renderAbout, initAboutEvents } from './pages/about.js';

// --- Initialize State ---
initState();

// --- Register Routes ---
registerRoute('/', async () => {
  return await renderHome();
});

registerRoute('/predict', async () => {
  return await renderPredictor();
});

registerRoute('/results', async () => {
  return await renderResults();
});

registerRoute('/college', async (params) => {
  return await renderCollegeDetail(params);
});

registerRoute('/compare', async () => {
  return await renderCompare();
});

registerRoute('/saved', async () => {
  return await renderSaved();
});

registerRoute('/guide', async () => {
  return await renderGuide();
});

registerRoute('/about', async () => {
  return await renderAbout();
});

registerRoute('/404', async () => {
  return `
    <div class="empty-state" style="min-height:60vh;">
      <div class="empty-state-icon"><i data-lucide="compass" style="width:80px;height:80px;"></i></div>
      <h3>Page Not Found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <a href="#/" data-link class="btn btn-primary mt-2">
        <i data-lucide="home" style="width:18px;height:18px;"></i>
        Go Home
      </a>
    </div>
  `;
});

// --- Post-Route Init ---
// After each page render, initialize page-specific events
window.addEventListener('routechange', (e) => {
  const { path, params } = e.detail;

  // Render header/footer on each route change
  renderHeader();
  renderFooter();

  // Initialize page-specific events
  setTimeout(() => {
    switch (path) {
      case '/predict':
        initPredictorEvents();
        break;
      case '/results':
        initResultsEvents();
        break;
      case '/college':
        initCollegeDetailEvents(params);
        break;
      case '/compare':
        initCompareEvents();
        break;
      case '/saved':
        initSavedEvents();
        break;
      case '/guide':
        initGuideEvents();
        break;
      case '/about':
        initAboutEvents();
        break;
    }

    // Re-init Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Re-init scroll effects
    initScrollEffects();

    // Re-init global 3D effects (hero scene, tilt, cursor, chrome)
    initEffects();
  }, 50);
});

// --- Global State → Header Reactivity ---
subscribe('bookmarks', () => {
  renderHeader();
  if (window.lucide) setTimeout(() => window.lucide.createIcons(), 10);
});

subscribe('compareList', () => {
  renderHeader();
  if (window.lucide) setTimeout(() => window.lucide.createIcons(), 10);
});

// --- Global Theme Handler ---
window.__setTheme__ = (themeId) => {
  setTheme(themeId);
  renderHeader();
  updateHero3DTheme(themeId);
  if (window.lucide) {
    setTimeout(() => window.lucide.createIcons(), 50);
  }
};

// Keep the 3D hero scene in sync with external theme changes
subscribe('theme', (themeId) => {
  updateHero3DTheme(themeId);
});

// --- Scroll Handler ---
window.addEventListener('scroll', () => {
  updateHeaderScroll();
}, { passive: true });

// --- Start Router ---
initRouter();

// Init Lucide after DOM is ready
window.addEventListener('load', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  // Initial scroll state
  updateHeaderScroll();
  // Init scroll effects
  initScrollEffects();
  // Init global 3D effects
  initEffects();
  updateHero3DTheme(getTheme());
});

// Log startup
console.log('%c🎓 UPTAC College Predictor 2026', 'font-size:16px;font-weight:bold;color:#4f46e5;');
console.log('%cReady! Theme:', 'color:#666;', getTheme());
