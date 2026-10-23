// The step screen: a deck of cards driven by swipes. No buttons.
import { MODELS, nextModelId, levelOf } from '../models/index.js';
import { lessonCards } from '../models/lessons.js';
import { renderDiagram, playAnimation } from '../lib/render.js';
import { load, setLastStep, markCompleted, markLessonSeen, save } from '../lib/storage.js';
import { colorHex } from '../lib/paper.js';
import { prepSteps } from '../lib/prep.js';
import { reducedMotion } from '../lib/env.js';
import { stamp, hand } from './icons.js';
import { thumb } from './home.js';

function buildCards(modelId, { withLessons }) {
  const model = MODELS[modelId];
  const s = load();
  const lv = levelOf(modelId);
  const cards = [];
  if (withLessons && lv && !s.lessonsSeen[lv.n]) for (const c of lessonCards(lv.n)) cards.push({ type: 'lesson', ...c, level: lv.n });
  const prep = prepSteps(model, s.paper || { w: 15, h: 15 });
  prep.forEach((step, i) => cards.push({ type: 'prep', step, index: i, count: prep.length }));
  model.steps.forEach((step, i) => cards.push({ type: 'step', step, index: i, count: model.steps.length }));
  cards.push({ type: 'finish', model });
  const next = nextModelId(modelId);
  if (next) cards.push({ type: 'ask', model, next });
  return cards;
}

export function renderStep(root, { modelId, withLessons = false, startIndex, originRect, onHome, onNext, onChangePaper }) {
  const model = MODELS[modelId];
  const s = load();
  const hex = colorHex(s.paper);
  const reduced = reducedMotion();
  const cards = buildCards(modelId, { withLessons });
  const firstStep = cards.findIndex((c) => c.type === 'step');
  const last = Math.min(s.lastStep[modelId] || 0, model.steps.length - 1);
  // A fresh model starts at the first card (lessons, then paper prep); a started one resumes at its step.
  let index = startIndex != null ? firstStep + startIndex : last > 0 ? firstStep + last : 0;
  if (cards[index] == null) index = firstStep;

  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen stepscreen';
  screen.innerHTML = `<div class="counter" aria-live="polite"></div><div class="mtitle">${model.name}</div><div class="deck"></div>`;
  root.appendChild(screen);
  const counter = screen.querySelector('.counter');
  const deck = screen.querySelector('.deck');
  const slots = [0, 1, 2].map(() => { const c = document.createElement('div'); c.className = 'card'; deck.appendChild(c); return c; });
  let W = screen.clientWidth || window.innerWidth;
  let stopAnim = null;
  let seq = 0;

  function fillCard(el, i) {
    el.className = 'card';
    el.innerHTML = '';
    el.onclick = null;
    const c = cards[i];
    if (!c) { el.style.visibility = 'hidden'; return; }
    el.style.visibility = '';
    if (c.type === 'step' || c.type === 'prep' || c.type === 'lesson') {
      if (c.type === 'lesson') el.classList.add('lesson');
      const d = document.createElement('div');
      d.className = 'diagram';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', c.step.text);
      d.appendChild(svg);
      if (c.type === 'lesson') el.insertAdjacentHTML('beforeend', `<div class="label">${c.title}</div>`);
      el.appendChild(d);
      const t = document.createElement('div');
      t.className = 'text';
      t.textContent = c.step.text;
      if (c.step.credit) t.insertAdjacentHTML('beforeend', `<span class="credit">${c.step.credit}</span>`);
      if ((c.step.tricky || c.type === 'lesson') && c.step.anim) t.insertAdjacentHTML('beforeend', '<span class="tap">tap to see the move</span>');
      el.appendChild(t);
      const idp = 'c' + (seq++) + '_';
      el._rendered = renderDiagram(svg, c.step, hex, idp);
      el._play = () => {
        if (!c.step.anim) return;
        if (stopAnim) stopAnim();
        stopAnim = playAnimation(svg, c.step, el._rendered, hex, idp, { loops: 2, duration: 2400, reduced, onEnd: () => { stopAnim = null; } });
      };
    } else if (c.type === 'finish') {
      el.classList.add('finish');
      const big = thumb(c.model, hex, 'fin');
      big.classList.add('big');
      el.appendChild(big);
      el.insertAdjacentHTML('beforeend', `<div class="fname">${c.model.name}</div><div class="stampwrap">${stamp('')}</div>`);
      const next = nextModelId(modelId);
      el.insertAdjacentHTML('beforeend', `<div class="next">${next ? `Next: ${MODELS[next].name}` : 'You folded every model.'}</div>`);
      if (!next) el.insertAdjacentHTML('beforeend', '<div class="quiet">Swipe down to go home.</div>');
    } else if (c.type === 'ask') {
      el.classList.add('ask');
      el.innerHTML = `<div class="q">Same paper?</div><p class="quiet">Next: ${MODELS[c.next].name}</p><div class="choices"><button class="filled same">Same</button><button class="change">Change</button></div>`;
      el.querySelector('.same').addEventListener('click', (e) => { e.stopPropagation(); onNext(c.next); });
      el.querySelector('.change').addEventListener('click', (e) => { e.stopPropagation(); onChangePaper(c.next); });
    }
  }

  function layout() {
    W = screen.clientWidth || window.innerWidth;
    slots[0].style.transform = `translateX(${-W}px)`;
    slots[1].style.transform = 'translateX(0)';
    slots[2].style.transform = `translateX(${W}px)`;
  }
  function renderAll() {
    fillCard(slots[0], index - 1);
    fillCard(slots[1], index);
    fillCard(slots[2], index + 1);
    layout();
    onIndex();
  }
  function onIndex() {
    const c = cards[index];
    if (c.type === 'step') {
      counter.textContent = `${c.index + 1} / ${c.count}`;
      setLastStep(modelId, c.index);
      if (c.index === c.count - 1) markCompleted(modelId);
    } else if (c.type === 'prep') counter.textContent = 'Make a square';
    else if (c.type === 'lesson') { counter.textContent = 'Lesson'; markLessonSeen(c.level); }
    else if (c.type === 'finish') { counter.textContent = 'Folded'; setTimeout(() => { const w = slots[1].querySelector('.stampwrap'); if (w) w.classList.add('land'); }, 80); }
    else counter.textContent = '';
    if (c.type === 'prep' && cards[index].index === 0 && cards[index].step.text.startsWith('Fold the square')) counter.textContent = 'Make a rectangle';
  }

  // Swipe hint, once ever, on the first model step.
  let hint = null;
  if (!s.swipeHintDone && cards[index].type === 'step') {
    screen.insertAdjacentHTML('beforeend', hand);
    hint = screen.querySelector('.swipehint');
  }
  const dropHint = () => { if (hint) { hint.remove(); hint = null; save({ swipeHintDone: true }); } };

  renderAll();

  // ---- gestures --------------------------------------------------------
  let down = null, axis = null, dx = 0, dy = 0, samples = [];
  let busy = false;
  const atStart = () => index === 0, atEnd = () => index === cards.length - 1;

  function setDeck(x, snap) {
    deck.classList.toggle('snap', !!snap);
    deck.style.transform = `translateX(${x}px)`;
  }
  function go(dir) {
    // dir +1 = next, -1 = previous
    if (busy) return;
    if ((dir > 0 && atEnd()) || (dir < 0 && atStart())) { setDeck(0, true); return; }
    busy = true;
    if (stopAnim) stopAnim();
    setDeck(-dir * W, true);
    const finish = () => {
      deck.removeEventListener('transitionend', finish);
      clearTimeout(timer);
      index += dir;
      // Rotate the slot elements so only one card re-renders.
      if (dir > 0) { const first = slots.shift(); slots.push(first); fillCard(first, index + 1); }
      else { const last = slots.pop(); slots.unshift(last); fillCard(last, index - 1); }
      deck.classList.remove('snap');
      deck.style.transform = 'translateX(0)';
      layout();
      onIndex();
      busy = false;
      if (dir > 0) dropHint();
    };
    const timer = setTimeout(finish, reduced ? 30 : 320);
    deck.addEventListener('transitionend', finish);
  }

  function close() {
    if (busy) return;
    busy = true;
    if (stopAnim) stopAnim();
    const cur = slots[1];
    const r = cur.getBoundingClientRect();
    cur.style.transition = reduced ? 'opacity 1ms' : 'transform 320ms cubic-bezier(0.3,0.7,0.4,1), opacity 300ms ease';
    cur.style.transformOrigin = '0 0';
    if (originRect) {
      const sx = originRect.width / r.width, sy = originRect.height / r.height;
      cur.style.transform = `translate(${originRect.left - r.left}px, ${originRect.top - r.top}px) scale(${sx}, ${sy})`;
    } else {
      cur.style.transform = 'translateY(40px) scale(0.9)';
    }
    cur.style.opacity = '0';
    slots[0].style.opacity = '0';
    slots[2].style.opacity = '0';
    setTimeout(onHome, reduced ? 20 : 300);
  }

  function onDown(e) {
    if (busy) return;
    if (e.target.closest('button')) return;
    down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    axis = null; dx = 0; dy = 0; samples = [{ x: e.clientX, t: down.t }];
    deck.classList.remove('snap');
    try { deck.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }
  function onMove(e) {
    if (!down || e.pointerId !== down.id) return;
    dx = e.clientX - down.x; dy = e.clientY - down.y;
    if (!axis) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : (dy > 0 ? 'y' : 'x');
      else return;
    }
    if (axis === 'x') {
      samples.push({ x: e.clientX, t: performance.now() });
      if (samples.length > 6) samples.shift();
      let x = dx;
      if ((dx > 0 && atStart()) || (dx < 0 && atEnd())) x = dx * 0.3; // rubber band
      setDeck(x, false);
    } else {
      const k = Math.max(0, dy);
      slots[1].style.transform = `translateY(${k * 0.9}px) scale(${1 - Math.min(0.2, k / 900)})`;
    }
  }
  function onUp(e) {
    if (!down || e.pointerId !== down.id) return;
    const dt = performance.now() - down.t;
    const wasDown = down; down = null;
    if (!axis) {
      if (dt < 400 && Math.abs(dx) < 8 && Math.abs(dy) < 8) {
        const cur = slots[1];
        if (cur._play) cur._play();
      }
      return;
    }
    if (axis === 'x') {
      const a = samples[0], b = samples[samples.length - 1];
      const v = b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0; // px per ms
      if (dx < -W * 0.25 || v < -0.55) go(1);
      else if (dx > W * 0.25 || v > 0.55) go(-1);
      else setDeck(0, true);
    } else {
      const vy = dy / Math.max(1, dt);
      if (dy > 110 || vy > 0.6) close();
      else { slots[1].style.transition = 'transform 260ms var(--spring)'; slots[1].style.transform = 'translateX(0)'; setTimeout(() => { slots[1].style.transition = ''; }, 280); }
    }
    void wasDown;
  }
  deck.addEventListener('pointerdown', onDown);
  deck.addEventListener('pointermove', onMove);
  deck.addEventListener('pointerup', onUp);
  deck.addEventListener('pointercancel', onUp);
  deck.addEventListener('contextmenu', (e) => e.preventDefault());

  function onKey(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === ' ' || e.key === 'Enter') { if (!e.target.closest('button')) { e.preventDefault(); const cur = slots[1]; if (cur._play) cur._play(); } }
  }
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', layout);
  return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', layout); if (stopAnim) stopAnim(); };
}
