// ============================================
// THEME-SWITCHER.JS — Theme Picker Component
// ============================================

import { getTheme, setTheme } from '../state.js';

const themes = [
  { id: 'indigo', name: 'Indigo Pro', swatch: 'swatch-indigo' },
  { id: 'midnight', name: 'Midnight Dark', swatch: 'swatch-midnight' },
  { id: 'ocean', name: 'Ocean Breeze', swatch: 'swatch-ocean' },
  { id: 'sunset', name: 'Sunset Warm', swatch: 'swatch-sunset' },
  { id: 'forest', name: 'Forest Green', swatch: 'swatch-forest' },
];

/**
 * Render theme switcher HTML
 * @param {boolean} inline - If true, renders as inline list (for mobile)
 * @returns {string}
 */
export function renderThemeSwitcher(inline = false) {
  const currentTheme = getTheme();

  if (inline) {
    const options = themes.map(t => `
      <button class="theme-option ${t.id === currentTheme ? 'active' : ''}" 
              onclick="window.__setTheme__('${t.id}')">
        <span class="theme-swatch ${t.swatch}"></span>
        <span>${t.name}</span>
        <svg class="theme-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
    `).join('');

    return `
      <div style="margin-top:0.25rem;">
        <p style="font-size:0.75rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.5rem;">Theme</p>
        ${options}
      </div>
    `;
  }

  const options = themes.map(t => `
    <button class="theme-option ${t.id === currentTheme ? 'active' : ''}" 
            onclick="window.__setTheme__('${t.id}')">
      <span class="theme-swatch ${t.swatch}"></span>
      <span>${t.name}</span>
      <svg class="theme-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </button>
  `).join('');

  return `
    <div class="theme-switcher">
      <button class="theme-switcher-btn" onclick="this.parentElement.querySelector('.theme-dropdown').classList.toggle('open')" aria-label="Change theme">
        <i data-lucide="palette" style="width:16px;height:16px;"></i>
        <span class="hide-mobile">Theme</span>
      </button>
      <div class="theme-dropdown" id="theme-dropdown">
        ${options}
      </div>
    </div>
  `;
}

/**
 * Initialize theme switcher global handler
 */
export function initThemeSwitcher() {
  // Global theme setter is defined in main.js
  // This function is kept for potential future initialization logic
  // The window.__setTheme__ is defined in main.js to avoid circular imports

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('theme-dropdown');
    if (dropdown && !e.target.closest('.theme-switcher')) {
      dropdown.classList.remove('open');
    }
  });
}
