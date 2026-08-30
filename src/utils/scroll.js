// ============================================
// SCROLL.JS — Scroll-based Effects & Reveals
// ============================================

let revealObserver = null;
let parallaxElements = [];

/**
 * Initialize scroll-triggered reveal animations
 * Uses IntersectionObserver for performance
 */
export function initScrollEffects() {
  // Cleanup previous observer
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }

  // Setup reveal observer
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optionally unobserve after reveal for performance
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    }
  );

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Setup subtle parallax on hero
  setupParallax();
}

/**
 * Setup subtle parallax on hero elements
 */
function setupParallax() {
  // Cleanup previous parallax listeners
  parallaxElements.forEach(({ el, handler }) => {
    el.removeEventListener('mousemove', handler);
  });
  parallaxElements = [];

  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  // Only apply on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const moveHandler = (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / centerX;
    const moveY = (y - centerY) / centerY;

    const content = hero.querySelector('.hero-content');
    if (content) {
      content.style.transform = `translate3d(${moveX * 6}px, ${moveY * 6}px, 0)`;
      content.style.transition = 'transform 0.35s ease-out';
    }

    // Parallax floating orbs for extra depth (via CSS vars so keyframes compose)
    const orbs = hero.querySelectorAll('.hero-orb');
    if (orbs.length) {
      orbs.forEach((orb, i) => {
        const depth = [12, -16, 22][i % 3] || 12;
        orb.style.setProperty('--par-x', `${(moveX * depth).toFixed(1)}px`);
        orb.style.setProperty('--par-y', `${(moveY * depth).toFixed(1)}px`);
      });
    }
  };

  const leaveHandler = () => {
    const content = hero.querySelector('.hero-content');
    if (content) {
      content.style.transform = 'translate3d(0, 0, 0)';
    }
    const orbs = hero.querySelectorAll('.hero-orb');
    orbs.forEach(orb => {
      orb.style.setProperty('--par-x', '0px');
      orb.style.setProperty('--par-y', '0px');
    });
  };

  hero.addEventListener('mousemove', moveHandler, { passive: true });
  hero.addEventListener('mouseleave', leaveHandler);

  parallaxElements.push({ el: hero, handler: moveHandler });
}

/**
 * Add reveal class to an element
 */
export function addReveal(el) {
  if (el && revealObserver) {
    el.classList.add('reveal');
    revealObserver.observe(el);
  }
}
