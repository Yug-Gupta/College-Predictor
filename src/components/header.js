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
    let badge = '';
    if (item.path === '/compare' && compareCount > 0) {
      badge = `<span style="background:var(--accent-primary);color:white;font-size:0.6rem;padding:1px 5px;border-radius:10px;margin-left:auto;font-weight:800;">${compareCount}</span>`;
    }
    if (item.path === '/saved' && savedCount > 0) {
      badge = `<span style="background:var(--accent-primary);color:white;font-size:0.6rem;padding:1px 5px;border-radius:10px;margin-left:auto;font-weight:800;">${savedCount}</span>`;
    }
    return `<a href="#${item.path}" data-link class="mobile-nav-link ${isActive ? 'active' : ''}" data-mobile-link>
      <i data-lucide="${item.icon}" style="width:18px;height:18px;"></i>
      ${item.label}
      ${badge}
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
            <button class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Open menu" aria-expanded="false">
              <i data-lucide="menu"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-nav" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div class="mobile-nav-content">
        <button class="mobile-nav-close" id="mobile-nav-close" aria-label="Close menu">
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

function closeMobileNav() {
  const mobileNav = document.getElementById('mobile-nav');
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  if (mobileNav) {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }
}

function openMobileNav() {
  const mobileNav = document.getElementById('mobile-nav');
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  if (mobileNav) {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }
}

function initHeaderEvents() {
  const mobileNav = document.getElementById('mobile-nav');
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-nav-close');

  // Open mobile nav
  if (toggleBtn) {
    toggleBtn.addEventListener('click', openMobileNav);
  }

  // Close on close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileNav);
  }

  // Close on overlay click
  if (mobileNav) {
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) {
        closeMobileNav();
      }
    });
  }

  // Close on nav link click
  document.querySelectorAll('[data-mobile-link]').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
    }
  });
}

