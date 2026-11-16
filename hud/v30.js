/* ==========================================================================
   Simurgh HUD · v30 atmosphere layer
   Self-contained: builds its own control, only writes body classes and the
   --v25-* / accent --k* custom properties that the existing skin already
   consumes. Nothing from the v28 application is patched.
   ========================================================================== */
(() => {
  'use strict';

  const STORE = 'simurgh.v30.prefs';
  const doc = document, root = doc.documentElement;
  if (root.dataset.v30 === '1') return;              // never double-mount
  root.dataset.v30 = '1';

  /* ---------- palettes ---------------------------------------------------- */

  const THEMES = {
    amber:  { name:'Amber',  stroke:'#f0a84a', hot:'#ffe4b0', fill:'#120e0a',
              gradA:'#3a2818', gradB:'#6a4324', edge:'#c4843a', dim:'#5c3a1c',
              grid:'#8a5a28', s:'240 168 74',  f:'18 14 10' },
    cyan:   { name:'Cyan',   stroke:'#4fd8ff', hot:'#dff8ff', fill:'#04121a',
              gradA:'#0d3446', gradB:'#136a89', edge:'#3ba9cc', dim:'#12485c',
              grid:'#1d6d88', s:'79 216 255',  f:'4 18 26' },
    mint:   { name:'Mint',   stroke:'#5ce8b0', hot:'#dcfff2', fill:'#04150f',
              gradA:'#0d3b2c', gradB:'#17795b', edge:'#3fbb8d', dim:'#12513e',
              grid:'#1d7a5e', s:'92 232 176',  f:'4 21 15' },
    violet: { name:'Violet', stroke:'#b18cff', hot:'#ece0ff', fill:'#0b0818',
              gradA:'#2a1f4d', gradB:'#5b3fa8', edge:'#8f6fd8', dim:'#3b2a63',
              grid:'#553f8f', s:'177 140 255', f:'11 8 24' },
    ice:    { name:'Ice',    stroke:'#9fd4ff', hot:'#eaf6ff', fill:'#080f18',
              gradA:'#16293d', gradB:'#2f5c85', edge:'#6fa6cc', dim:'#28455f',
              grid:'#35597a', s:'159 212 255', f:'8 15 24' }
  };

  /* Accent surfaces that the generated --k* palette drives. */
  const ACCENT_K = ['k1','k2','k3','k12','k27','k32','k39','k43','k48','k51','k54',
                    'k56','k57','k61','k64','k69','k70','k74','k79','k84','k102','k103'];
  const BG_K = ['k0','k9','k10'];

  /* ---------- preferences ------------------------------------------------- */

  const DEFAULTS = { theme:'amber', scanlines:null, glow:null, calm:false, motion:false, contrast:false };
  let prefs = { ...DEFAULTS };

  const read = () => {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; }
    catch { return {}; }
  };
  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch { /* private mode */ }
  };

  const painted = new Set();
  const paint = (name, value) => {
    if (value == null) { root.style.removeProperty(name); painted.delete(name); return; }
    root.style.setProperty(name, value); painted.add(name);
  };

  function applyTheme(key) {
    const t = THEMES[key] || THEMES.amber;
    paint('--v25-stroke', t.stroke);
    paint('--v25-stroke-hot', t.hot);
    paint('--v25-fill', t.fill);
    paint('--v25-grad-a', t.gradA);
    paint('--v25-grad-b', t.gradB);
    paint('--v25-grid', t.fill);
    paint('--v25-grid-line', t.grid);
    paint('--v25-menu-fill', t.fill);
    paint('--v25-menu-stroke', t.stroke);
    paint('--v25-menu-stroke-dim', t.dim);
    paint('--v25-menu-edge', t.edge);
    paint('--v25-menu-hot', t.hot);
    paint('--v25-menu-g0', t.hot);
    paint('--v25-menu-g1', t.stroke);
    paint('--v25-menu-g2', t.gradB);
    ACCENT_K.forEach(k => paint('--' + k, t.s));
    BG_K.forEach(k => paint('--' + k, t.f));
    root.dataset.v30Theme = key;
  }

  function applyFlags() {
    const b = doc.body;
    if (!b) return;
    b.classList.toggle('v30-calm', !!prefs.calm);
    b.classList.toggle('v30-rm', !!prefs.motion);
    b.classList.toggle('v30-hc', !!prefs.contrast);
    if (typeof prefs.scanlines === 'boolean') b.classList.toggle('v25fx', prefs.scanlines);
    if (typeof prefs.glow === 'boolean') b.classList.toggle('noGlow', !prefs.glow);
  }

  const scanOn = () => (typeof prefs.scanlines === 'boolean'
    ? prefs.scanlines
    : doc.body.classList.contains('v25fx'));
  const glowOn = () => (typeof prefs.glow === 'boolean'
    ? prefs.glow
    : !doc.body.classList.contains('noGlow'));

  /* ---------- panel ------------------------------------------------------- */

  const SWATCHES = Object.keys(THEMES).map(k =>
    '<button type="button" role="radio" aria-checked="false" data-theme="' + k + '"' +
    ' style="--c:' + THEMES[k].stroke + '" title="' + THEMES[k].name + '"' +
    ' aria-label="' + THEMES[k].name + ' accent"></button>').join('');

  const ROWS = [
    ['scanlines', 'Scanlines'],
    ['glow',      'Glow'],
    ['calm',      'Calm scenery'],
    ['motion',    'Reduce motion'],
    ['contrast',  'High contrast']
  ].map(([k, label]) =>
    '<button type="button" class="v30t" data-k="' + k + '" aria-pressed="false">' +
    '<span class="v30tL">' + label + '</span><span class="v30tSw" aria-hidden="true"></span></button>'
  ).join('');

  const wrap = doc.createElement('div');
  wrap.id = 'v30Atmo';
  wrap.innerHTML =
    '<button id="v30AtmoBtn" type="button" aria-expanded="false" aria-haspopup="dialog"' +
    ' aria-label="Accent and atmosphere" title="Accent &amp; atmosphere">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/>' +
    '<circle cx="12" cy="4.4" r="1.5"/><circle cx="18.6" cy="8.2" r="1.5"/>' +
    '<circle cx="18.6" cy="15.8" r="1.5"/><circle cx="12" cy="19.6" r="1.5"/>' +
    '<circle cx="5.4" cy="15.8" r="1.5"/><circle cx="5.4" cy="8.2" r="1.5"/></svg>' +
    '</button>' +
    '<div id="v30AtmoPanel" role="dialog" aria-label="Accent and atmosphere">' +
      '<div class="v30pHead"><strong>Atmosphere</strong>' +
      '<span class="v30pVer">v30</span>' +
      '<button type="button" class="v30pX" aria-label="Close">×</button></div>' +
      '<div class="v30pSec"><span class="v30pLab">Accent</span>' +
      '<div class="v30pSw" role="radiogroup" aria-label="Accent colour">' + SWATCHES + '</div></div>' +
      '<div class="v30pSec"><span class="v30pLab">Presentation</span>' +
      '<div class="v30pTg">' + ROWS + '</div></div>' +
      '<div class="v30pFoot"><button type="button" class="v30pReset">Reset</button>' +
      '<span class="v30pHint">Ctrl K</span></div>' +
    '</div>';

  const btn = wrap.querySelector('#v30AtmoBtn');
  const panel = wrap.querySelector('#v30AtmoPanel');
  const closeBtn = wrap.querySelector('.v30pX');
  const resetBtn = wrap.querySelector('.v30pReset');
  const swatchEls = [...panel.querySelectorAll('.v30pSw button')];
  const rowEls = [...panel.querySelectorAll('.v30t')];

  function mount() {
    if (doc.getElementById('v30Atmo')) return false;
    const bar = doc.querySelector('#top .rightTop') || doc.querySelector('#top');
    if (!bar) return false;
    bar.appendChild(wrap);
    return true;
  }

  function syncPanel() {
    const theme = root.dataset.v30Theme || 'amber';
    swatchEls.forEach(el => {
      el.setAttribute('aria-checked', String(el.dataset.theme === theme));
      el.tabIndex = el.dataset.theme === theme ? 0 : -1;
    });
    const state = { scanlines: scanOn(), glow: glowOn(), calm: !!prefs.calm,
                    motion: !!prefs.motion, contrast: !!prefs.contrast };
    rowEls.forEach(el => el.setAttribute('aria-pressed', String(!!state[el.dataset.k])));
  }

  function place() {
    const r = btn.getBoundingClientRect();
    const pw = panel.offsetWidth || 236;
    const ph = panel.offsetHeight || 300;
    let left = r.right - pw;
    left = Math.max(8, Math.min(innerWidth - pw - 8, left));
    let top = r.bottom + 8;
    if (top + ph > innerHeight - 8) top = Math.max(8, r.top - ph - 8);
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  function open() {
    if (!mount()) return;
    syncPanel();
    panel.classList.add('on');
    btn.setAttribute('aria-expanded', 'true');
    place();
    const active = swatchEls.find(el => el.getAttribute('aria-checked') === 'true');
    (active || closeBtn).focus({ preventScroll: true });
  }

  function close(refocus) {
    panel.classList.remove('on');
    btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus({ preventScroll: true });
  }

  const isOpen = () => panel.classList.contains('on');

  /* ---------- wiring ------------------------------------------------------ */

  btn.addEventListener('click', e => {
    e.stopPropagation();
    isOpen() ? close(true) : open();
  });
  closeBtn.addEventListener('click', () => close(true));
  resetBtn.addEventListener('click', () => { reset(); syncPanel(); });

  panel.addEventListener('click', e => e.stopPropagation());
  swatchEls.forEach(el => el.addEventListener('click', () => {
    prefs.theme = el.dataset.theme;
    applyTheme(prefs.theme);
    save();
    syncPanel();
    el.focus({ preventScroll: true });
  }));
  rowEls.forEach(el => el.addEventListener('click', () => {
    const k = el.dataset.k;
    if (k === 'scanlines') prefs.scanlines = !scanOn();
    else if (k === 'glow') prefs.glow = !glowOn();
    else prefs[k] = !prefs[k];
    applyFlags();
    save();
    syncPanel();
    el.focus({ preventScroll: true });
  }));

  doc.addEventListener('click', e => {
    if (isOpen() && !panel.contains(e.target) && !btn.contains(e.target)) close(false);
  }, true);

  doc.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen()) { e.stopPropagation(); close(true); return; }
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openLauncher();
    }
  }, true);

  addEventListener('resize', () => { if (isOpen()) place(); });
  addEventListener('scroll', () => { if (isOpen()) place(); }, true);

  /* Ctrl/Cmd+K → open the Simurgh launcher and put the caret in its search. */
  function openLauncher() {
    const menu = doc.getElementById('simurghMenu');
    const trigger = doc.getElementById('simurghBtn');
    const visible = menu && (menu.classList.contains('pmOn') ||
      getComputedStyle(menu).visibility === 'visible');
    if (!visible && trigger) trigger.click();
    setTimeout(() => {
      const input = doc.getElementById('globalSearch');
      if (input) { input.focus({ preventScroll: true }); input.select?.(); }
    }, 90);
  }

  function reset() {
    prefs = { ...DEFAULTS };
    painted.forEach(p => root.style.removeProperty(p));
    painted.clear();
    delete root.dataset.v30Theme;
    root.dataset.v30 = '1';
    doc.body.classList.remove('v30-calm', 'v30-rm', 'v30-hc');
    applyTheme('amber');
    applyFlags();
    save();
  }

  /* ---------- boot -------------------------------------------------------- */

  const stored = read();
  Object.keys(DEFAULTS).forEach(k => {
    if (stored[k] !== undefined && stored[k] !== null) prefs[k] = stored[k];
  });
  if (!THEMES[prefs.theme]) prefs.theme = 'amber';
  applyTheme(prefs.theme);
  applyFlags();

  if (!mount()) {
    const obs = new MutationObserver(() => { if (mount()) obs.disconnect(); });
    obs.observe(doc.body, { childList:true, subtree:true });
    setTimeout(() => obs.disconnect(), 8000);
  }
})();
