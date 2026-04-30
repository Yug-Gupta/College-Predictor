// ============================================
// HEADER.JS — Site Header + Navigation
// ============================================

import { getCurrentRoute } from '../router.js';
import { renderThemeSwitcher } from './theme-switcher.js';
import { getCompareList, getBookmarks } from '../state.js';

export function renderHeader() {
  const route = getCurrentRoute();
  
  const navItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/predict', label: 'Predict', icon: 'search' },
    { path: '/compare', label: 'Compare', icon: 'columns-2' },
    { path: '/saved', label: 'Saved', icon: 'bookmark' },
    { path: '/guide', label: 'Guide', icon: 'book-open' },
    { path: '/about', label: 'About', icon: 'info' },
  ];

  const compareCount = getCompareList().length;
  const savedCount = getBookmarks().length;

  const navLinksHtml = navItems.map(item => {
    const isActive = route === item.path;
    let badge = '';
    if (item.path === '/compare' && compareCount > 0) {
      badge = `<span style="background:var(--header-accent);color:#000;font-size:0.6rem;padding:1px 5px;border-radius:10px;margin-left:4px;font-weight:800;">${compareCount}</span>`;
    }
    if (item.path === '/saved' && savedCount > 0) {
      badge = `<span style="background:var(--header-accent);color:#000;font-size:0.6rem;padding:1px 5px;border-radius:10px;margin-left:4px;font-weight:800;">${savedCount}</span>`;
    }
    return `<a href="#${item.path}" data-link class="nav-link ${isActive ? 'active' : ''}">${item.label}${badge}</a>`;
  }).join('');

  const mobileNavLinksHtml = navItems.map(item => {
    const isActive = route === item.path;
    return `<a href="#${item.path}" data-link class="mobile-nav-link ${isActive ? 'active' : ''}" onclick="document.getElementById('mobile-nav').classList.remove('open')">
      <i data-lucide="${item.icon}" style="width:18px;height:18px;"></i>
      ${item.label}
    </a>`;
  }).join('');

  const header = document.getElementById('site-header');
  header.innerHTML = `
    <div class="site-header">
      <div class="container">
        <div class="header-inner">
          <a href="#/" data-link class="header-logo">
            <div class="logo-icon">🎓</div>
            <span>UPTAC Predictor <span class="year-badge">2026</span></span>
          </a>
          
          <nav class="header-nav">
            ${navLinksHtml}
          </nav>

          <div class="header-actions">
            ${renderThemeSwitcher()}
            <button class="mobile-menu-btn" onclick="document.getElementById('mobile-nav').classList.add('open')" aria-label="Open menu">
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-nav" id="mobile-nav">
      <div class="mobile-nav-content">
        <button class="mobile-nav-close" onclick="document.getElementById('mobile-nav').classList.remove('open')" aria-label="Close menu">
          <i data-lucide="x" style="width:24px;height:24px;"></i>
        </button>
        <div style="padding:0.5rem 0.5rem;margin-bottom:0.5rem;">
          <span style="font-weight:700;font-size:1.1rem;color:var(--text-heading);">🎓 UPTAC Predictor</span>
        </div>
        ${mobileNavLinksHtml}
        <div class="divider"></div>
        <div style="padding:0.5rem;">
          ${renderThemeSwitcher(true)}
        </div>
      </div>
    </div>
  `;

  initHeaderEvents();
}

function initHeaderEvents() {
  // Close mobile nav on overlay click
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) {
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        mobileNav.classList.remove('open');
      }
    });
  }
}
