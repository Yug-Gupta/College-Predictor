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
      content.style.transform = `translate(${moveX * 4}px, ${moveY * 4}px)`;
      content.style.transition = 'transform 0.3s ease-out';
    }
  };

  const leaveHandler = () => {
    const content = hero.querySelector('.hero-content');
    if (content) {
      content.style.transform = 'translate(0, 0)';
    }
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
