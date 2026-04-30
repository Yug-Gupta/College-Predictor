// ============================================
// ROUTER.JS — Hash-based SPA Router
// ============================================

const routes = {};
let currentRoute = null;

/**
 * Register a route handler
 * @param {string} path - Route path (e.g., '/', '/predict')
 * @param {Function} handler - Async function that returns HTML string
 */
export function registerRoute(path, handler) {
  routes[path] = handler;
}

/**
 * Navigate to a route
 * @param {string} path - Target path
 * @param {object} params - Optional route params
 */
export function navigate(path, params = {}) {
  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  const hash = paramStr ? `#${path}?${paramStr}` : `#${path}`;
  window.location.hash = hash;
}

/**
 * Parse current hash into route + params
 */
function parseHash() {
  const hash = window.location.hash.slice(1) || '/';
  const [path, queryStr] = hash.split('?');
  const params = {};
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [key, val] = pair.split('=');
      params[key] = decodeURIComponent(val || '');
    });
  }
  return { path: path || '/', params };
}

/**
 * Resolve and render the current route
 */
async function resolveRoute() {
  const { path, params } = parseHash();
  const pageContent = document.getElementById('page-content');

  // Show loader
  pageContent.innerHTML = `
    <div class="page-loader" id="page-loader">
      <div class="loader-spinner"></div>
      <p>Loading...</p>
    </div>
  `;

  // Try exact match, then fallback to 404
  const handler = routes[path] || routes['/404'] || (() => '<div class="empty-state"><h3>Page Not Found</h3></div>');

  try {
    const html = await handler(params);
    pageContent.innerHTML = `<div class="page-enter">${html}</div>`;
    currentRoute = path;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Re-init Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Dispatch route change event
    window.dispatchEvent(new CustomEvent('routechange', { detail: { path, params } }));
  } catch (err) {
    console.error('Route error:', err);
    pageContent.innerHTML = `
      <div class="empty-state">
        <h3>Something went wrong</h3>
        <p>Please try again later.</p>
        <button class="btn btn-primary" onclick="location.hash='#/'">Go Home</button>
      </div>
    `;
  }
}

/**
 * Initialize the router
 */
export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  
  // Handle initial load
  resolveRoute();

  // Intercept link clicks for SPA navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      window.location.hash = href.startsWith('#') ? href : `#${href}`;
    }
  });
}

/**
 * Get current route path
 */
export function getCurrentRoute() {
  return parseHash().path;
}

/**
 * Get current route params
 */
export function getRouteParams() {
  return parseHash().params;
}
