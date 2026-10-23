import { load, save } from './lib/storage.js';
import { DEFAULT_PAPER } from './lib/paper.js';
import { base } from './lib/env.js';
import { renderSplash } from './ui/splash.js';
import { renderPicker } from './ui/picker.js';

const app = document.getElementById('app');
let teardown = null;
let modelsReady = null;

function models() {
  if (!modelsReady) modelsReady = import('./models/index.js');
  return modelsReady;
}

function clear() {
  if (teardown) { teardown(); teardown = null; }
}

async function showHome() {
  clear();
  const [{ renderHome }, { MODELS }] = await Promise.all([import('./ui/home.js'), models()]);
  location.hash = '';
  renderHome(app, {
    onOpen: (id, rect) => showStep(id, { originRect: rect, withLessons: true }),
    onPaper: () => showPicker({ mode: 'change', model: MODELS.swan, onDone: () => showHome(), onBack: () => showHome() }),
    onDefaultPaper: () => showPicker({ mode: 'default', onDone: () => showHome(), onBack: () => showHome() }),
  });
}

function showPicker({ mode, model, onDone, onBack }) {
  clear();
  renderPicker(app, {
    mode, model, paper: load().paper, onBack,
    onDone: (paper) => { save({ paper, launched: true }); onDone(paper); },
  });
}

async function showStep(id, opts = {}) {
  clear();
  const [{ renderStep }, { MODELS, levelOf }] = await Promise.all([import('./ui/step.js'), models()]);
  if (!MODELS[id]) return showHome();
  if (opts.setHash !== false) history.replaceState(null, '', '#m/' + id);
  teardown = renderStep(app, {
    modelId: id,
    withLessons: opts.withLessons,
    startIndex: opts.startIndex,
    originRect: opts.originRect,
    onHome: () => showHome(),
    onNext: (next) => {
      const lv = levelOf(next), cur = levelOf(id);
      showStep(next, { withLessons: lv && cur && lv.n !== cur.n, startIndex: undefined });
    },
    onChangePaper: (next) => showPicker({ mode: 'change', model: MODELS[next], onDone: () => showStep(next, { withLessons: true }), onBack: () => showStep(next, { withLessons: true }) }),
  });
}

async function boot() {
  const s = load();
  const h = location.hash;
  const m = h.match(/^#m\/(\w+)(?:\/(\d+))?/);
  if (m) {
    if (!s.paper) save({ paper: DEFAULT_PAPER, launched: true });
    return showStep(m[1], { startIndex: m[2] ? +m[2] - 1 : undefined, withLessons: false });
  }
  if (h.startsWith('#grid/')) return showGrid();
  if (!s.launched || !s.paper) {
    renderSplash(app, {
      onDone: async () => {
        const { MODELS } = await models();
        showPicker({ mode: 'first', model: MODELS.swan, onDone: () => showStep('swan', { withLessons: false, startIndex: undefined }) });
      },
    });
    return;
  }
  showHome();
}

// Development view: every step of a model in a grid (#grid/<id>/<hex>/<from>-<to>).
async function showGrid() {
  clear();
  const { renderDiagram, playAnimation } = await import('./lib/render.js');
  const { MODELS } = await models();
  const m = location.hash.match(/^#grid\/(\w+)(?:\/(\w+))?(?:\/(\d+)-(\d+))?/);
  const model = MODELS[m[1]];
  if (!model) { app.textContent = 'No such model'; return; }
  const color = '#' + (m[2] || 'f1c232');
  app.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'gridview';
  const from = m[3] ? +m[3] - 1 : 0, to = m[4] ? +m[4] : model.steps.length;
  if (m[3]) grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(420px, 1fr))';
  model.steps.slice(from, to).forEach((step, k) => {
    const i = from + k;
    const cell = document.createElement('div');
    cell.className = 'cell';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (m[3]) svg.style.height = '400px';
    cell.appendChild(svg);
    const p = document.createElement('p');
    p.textContent = `${i + 1}. ${step.text}` + (step.tricky ? ' *' : '');
    cell.appendChild(p);
    grid.appendChild(cell);
    const r = renderDiagram(svg, step, color, 'p' + i);
    svg.addEventListener('click', () => playAnimation(svg, step, r, color, 'p' + i, { loops: 1 }));
  });
  app.appendChild(grid);
}

window.addEventListener('hashchange', () => {
  const h = location.hash;
  if (h.startsWith('#grid/')) showGrid();
  else if (/^#m\/\w+/.test(h) && !document.querySelector('.stepscreen')) boot();
});
boot();

// Offline: precache everything on first load.
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => { navigator.serviceWorker.register(base + 'sw.js').catch(() => {}); });
}
