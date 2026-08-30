// ============================================
// EFFECTS3D.JS — Global 3D Animations & Effects
// ============================================
//
// Provides:
//  1. Three.js interactive 3D hero background (particles + wireframe + rings)
//  2. Mouse-driven 3D tilt on cards with spotlight tracking
//  3. Custom cursor glow (desktop only)
//  4. Scroll progress bar
//  5. Back-to-top button
//
// All effects respect `prefers-reduced-motion` and are skipped on coarse
// pointer devices when appropriate.

const TILT_SELECTOR = [
  '[data-tilt]',
  '.card',
  '.feature-card',
  '.step-card',
  '.stat-card',
  '.college-card',
  '.compare-card',
  '.compare-add-slot',
  '.predictor-card',
  '.guide-section .card',
  '.about-content .card',
].join(',');

// Accent colors per theme (for the Three.js scene)
const THEME_COLORS = {
  indigo:  { a: '#4f46e5', b: '#a5b4fc', c: '#fbbf24' },
  midnight: { a: '#38bdf8', b: '#818cf8', c: '#38bdf8' },
  ocean:   { a: '#0891b2', b: '#67e8f9', c: '#fde68a' },
  sunset:  { a: '#ea580c', b: '#fdba74', c: '#fde68a' },
  forest:  { a: '#16a34a', b: '#86efac', c: '#fde68a' },
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

let theme = 'ocean';
let heroScene = null;
let tiltBound = false;
let activeTilt = null;
let cursorInited = false;
let chromeInited = false;

/* ============================================
   1. THREE.JS HERO BACKGROUND
   ============================================ */

// Three.js loaded on-demand from CDN as an ES module (kept out of the bundle).
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
let threePromise = null;

function loadThree() {
  if (!threePromise) {
    threePromise = import(/* @vite-ignore */ THREE_URL).catch((err) => {
      threePromise = null;
      console.warn('[effects3d] Failed to load Three.js:', err);
      throw err;
    });
  }
  return threePromise;
}

/**
 * Initialize (or re-bind) the 3D hero scene inside #hero-canvas.
 * Automatically disposes the old scene if the hero is removed from the DOM.
 */
export async function initHero3D() {
  const container = document.getElementById('hero-canvas');
  if (!container) {
    if (heroScene) {
      heroScene.dispose();
      heroScene = null;
    }
    return;
  }
  if (reducedMotion) return;
  if (heroScene) {
    heroScene.bind(container);
    return;
  }

  let THREE;
  try {
    THREE = await loadThree();
  } catch {
    return;
  }

  // Hero may have been replaced while we were loading Three.js
  if (document.getElementById('hero-canvas') !== container || !container.isConnected) {
    return;
  }

  heroScene = createHeroScene(container, THREE);
}

function createHeroScene(container, THREE) {
  const colors = THEME_COLORS[theme] || THEME_COLORS.ocean;
  const isMobile = container.clientWidth < 768;
  const count = isMobile ? 700 : 1400;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 6;

  const group = new THREE.Group();
  scene.add(group);

  // --- Particle field (galaxy-ish sphere) ---
  const positions = new Float32Array(count * 3);
  const colorArr = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const cA = new THREE.Color(colors.a);
  const cB = new THREE.Color(colors.b);

  for (let i = 0; i < count; i++) {
    const r = 2.0 + Math.random() * 2.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    seeds[i] = Math.random();
    const col = cA.clone().lerp(cB, seeds[i]);
    colorArr[i * 3] = col.r;
    colorArr[i * 3 + 1] = col.g;
    colorArr[i * 3 + 2] = col.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colorArr, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(pGeo, pMat);
  group.add(points);

  // --- Wireframe icosahedron ---
  const ico = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.55, 1),
    new THREE.MeshBasicMaterial({ color: colors.a, wireframe: true, transparent: true, opacity: 0.22 })
  );
  ico.position.z = -1;
  group.add(ico);

  // --- Orbital rings ---
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.022, 10, 72),
    new THREE.MeshBasicMaterial({ color: colors.c, transparent: true, opacity: 0.4 })
  );
  ring1.rotation.x = Math.PI / 2;
  ring1.position.z = -0.4;

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.016, 10, 72),
    new THREE.MeshBasicMaterial({ color: colors.b, transparent: true, opacity: 0.28 })
  );
  ring2.rotation.x = Math.PI / 2 + 0.45;
  ring2.rotation.z = 0.35;
  ring2.position.z = -0.9;

  group.add(ring1, ring2);

  const state = {
    renderer, scene, camera, group, points, ico, ring1, ring2, seeds, count,
    mouseX: 0, mouseY: 0, targetX: 0, targetY: 0,
    paused: false, disposed: false, raf: null, container,
    observer: null,
  };

  const onMouse = (e) => {
    state.targetX = (e.clientX / window.innerWidth) - 0.5;
    state.targetY = (e.clientY / window.innerHeight) - 0.5;
  };
  window.addEventListener('mousemove', onMouse, { passive: true });

  const tick = () => {
    if (state.disposed) return;
    state.raf = requestAnimationFrame(tick);
    if (state.paused) return;

    state.mouseX += (state.targetX - state.mouseX) * 0.045;
    state.mouseY += (state.targetY - state.mouseY) * 0.045;

    const gx = state.mouseY * 0.5;
    const gy = state.mouseX * 0.6;
    state.group.rotation.x += (gx - state.group.rotation.x) * 0.03;
    state.group.rotation.y += (gy - state.group.rotation.y) * 0.03;

    state.points.rotation.y -= 0.0014;
    state.points.rotation.x += 0.0003;
    state.ico.rotation.x += 0.0008;
    state.ico.rotation.y += 0.0011;
    state.ico.rotation.z += 0.0004;
    state.ring1.rotation.z += 0.0009;
    state.ring2.rotation.z -= 0.0013;

    state.camera.position.x += (state.mouseX * 0.5 - state.camera.position.x) * 0.05;
    state.camera.position.y += (-state.mouseY * 0.5 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);

    state.renderer.render(state.scene, state.camera);
  };
  tick();

  const onResize = () => {
    if (state.disposed || !state.container.isConnected) return;
    const w = state.container.clientWidth;
    const h = state.container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // Pause rendering when hero scrolls out of view (performance)
  state.observer = new IntersectionObserver((entries) => {
    state.paused = !entries[0].isIntersecting;
  }, { threshold: 0 });
  state.observer.observe(container);

  return {
    bind(nextContainer) {
      state.container = nextContainer;
      if (state.observer) state.observer.unobserve(state.container);
      state.observer.observe(nextContainer);
      onResize();
    },
    setTheme(nextTheme) {
      const cols = THEME_COLORS[nextTheme];
      if (!cols) return;
      state.ico.material.color.set(cols.a);
      state.ring1.material.color.set(cols.c);
      state.ring2.material.color.set(cols.b);
      const attr = state.points.geometry.attributes.color;
      const arr = attr.array;
      const a = new THREE.Color(cols.a);
      const b = new THREE.Color(cols.b);
      for (let i = 0; i < state.count; i++) {
        const col = a.clone().lerp(b, state.seeds[i]);
        arr[i * 3] = col.r;
        arr[i * 3 + 1] = col.g;
        arr[i * 3 + 2] = col.b;
      }
      attr.needsUpdate = true;
    },
    dispose() {
      state.disposed = true;
      cancelAnimationFrame(state.raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      if (state.observer) state.observer.disconnect();
      pGeo.dispose();
      pMat.dispose();
      ico.geometry.dispose();
      ico.material.dispose();
      ring1.geometry.dispose();
      ring1.material.dispose();
      ring2.geometry.dispose();
      ring2.material.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    },
  };
}

export function updateHero3DTheme(nextTheme) {
  theme = nextTheme;
  if (heroScene) heroScene.setTheme(nextTheme);
}

/* ============================================
   2. MOUSE 3D TILT ON CARDS
   ============================================ */

function resetTilt() {
  if (!activeTilt) return;
  const el = activeTilt;
  el.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
  el.style.transform = '';
  el.style.setProperty('--mx', '50%');
  el.style.setProperty('--my', '50%');
  el.classList.remove('tilt-active');
  activeTilt = null;
}

function onTiltOver(e) {
  const t = e.target.closest(TILT_SELECTOR);
  if (!t) {
    if (activeTilt) resetTilt();
    return;
  }
  if (t === activeTilt) return;
  resetTilt();
  activeTilt = t;
  t.style.transition = 'transform 0.18s ease-out';
  t.classList.add('tilt-active');
}

function onTiltMove(e) {
  if (!activeTilt) return;
  if (!activeTilt.isConnected) {
    resetTilt();
    return;
  }
  const rect = activeTilt.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const px = (e.clientX - rect.left) / rect.width;
  const py = (e.clientY - rect.top) / rect.height;
  const rx = (0.5 - py) * 6;
  const ry = (px - 0.5) * 6;
  activeTilt.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  activeTilt.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
  activeTilt.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);
}

function onTiltOut(e) {
  if (!activeTilt) return;
  if (!e.relatedTarget) resetTilt();
  else if (!e.relatedTarget.closest) resetTilt();
}

/**
 * Bind global tilt listeners (idempotent).
 */
export function initTilt() {
  if (reducedMotion || !finePointer) return;
  if (tiltBound) return;
  tiltBound = true;
  document.addEventListener('mouseover', onTiltOver, { passive: true });
  document.addEventListener('mousemove', onTiltMove, { passive: true });
  document.addEventListener('mouseout', onTiltOut, { passive: true });
}

/* ============================================
   3. CUSTOM CURSOR GLOW
   ============================================ */

function initCursorGlow() {
  if (reducedMotion || !finePointer) return;
  if (cursorInited) return;
  cursorInited = true;

  const el = document.createElement('div');
  el.id = 'cursor-glow';
  document.body.appendChild(el);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;

  const move = (e) => { tx = e.clientX; ty = e.clientY; };
  document.addEventListener('mousemove', move, { passive: true });

  const raf = () => {
    x += (tx - x) * 0.1;
    y += (ty - y) * 0.1;
    el.style.transform = `translate3d(${x - 150}px, ${y - 150}px, 0)`;
    requestAnimationFrame(raf);
  };
  raf();
}

/* ============================================
   4. SCROLL PROGRESS BAR + BACK-TO-TOP
   ============================================ */

function initChrome() {
  if (chromeInited) return;
  chromeInited = true;

  // Scroll progress bar
  const progress = document.createElement('div');
  progress.id = 'scroll-progress';
  document.body.appendChild(progress);

  // Back-to-top button
  const toTop = document.createElement('button');
  toTop.id = 'back-to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
  document.body.appendChild(toTop);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      progress.style.width = `${p}%`;
      toTop.classList.toggle('visible', window.scrollY > 420);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================
   PUBLIC — init everything for a route change
   ============================================ */

export function initEffects() {
  initHero3D();
  initTilt();
  initCursorGlow();
  initChrome();
}
