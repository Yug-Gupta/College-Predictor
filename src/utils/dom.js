// ============================================
// DOM.JS — DOM Helper Utilities
// ============================================

/**
 * Create element with optional class, attributes, and children
 * @param {string} tag
 * @param {object} opts
 * @returns {HTMLElement}
 */
export function createElement(tag, opts = {}) {
  const el = document.createElement(tag);
  if (opts.className) el.className = opts.className;
  if (opts.id) el.id = opts.id;
  if (opts.html) el.innerHTML = opts.html;
  if (opts.text) el.textContent = opts.text;
  if (opts.attrs) {
    Object.entries(opts.attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }
  if (opts.events) {
    Object.entries(opts.events).forEach(([k, v]) => el.addEventListener(k, v));
  }
  if (opts.children) {
    opts.children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        el.appendChild(child);
      }
    });
  }
  return el;
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {number} duration - ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '<i data-lucide="check-circle"></i>',
    error: '<i data-lucide="alert-circle"></i>',
    info: '<i data-lucide="info"></i>',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span>${message}</span>
    <button class="toast-close" aria-label="Close">
      <i data-lucide="x" style="width:14px;height:14px;"></i>
    </button>
  `;

  container.appendChild(toast);

  // Init icons in toast
  if (window.lucide) window.lucide.createIcons({ nodes: [toast] });

  // Close handler
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));

  // Auto dismiss
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.classList.add('toast-out');
  setTimeout(() => toast.remove(), 250);
}

/**
 * Show a modal with content
 * @param {string} title
 * @param {string} bodyHtml
 * @param {Array} actions - [{label, class, onClick}]
 */
export function showModal(title, bodyHtml, actions = []) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  const actionsHtml = actions.map(a =>
    `<button class="btn ${a.class || 'btn-secondary'}" data-action="${a.label}">${a.label}</button>`
  ).join('');

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" aria-label="Close modal">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      ${actionsHtml ? `<div class="modal-footer">${actionsHtml}</div>` : ''}
    </div>
  `;

  overlay.classList.add('active');

  if (window.lucide) window.lucide.createIcons({ nodes: [overlay] });

  // Close handlers
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Action handlers
  actions.forEach(a => {
    const btn = overlay.querySelector(`[data-action="${a.label}"]`);
    if (btn && a.onClick) {
      btn.addEventListener('click', () => {
        a.onClick();
        closeModal();
      });
    }
  });
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.innerHTML = '';
  }
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} delay - ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
