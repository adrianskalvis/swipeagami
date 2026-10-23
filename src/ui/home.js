import { LEVELS, MODELS } from '../models/index.js';
import { load, save, reset } from '../lib/storage.js';
import { colorHex, paperLabel, paperType } from '../lib/paper.js';
import { renderDiagram } from '../lib/render.js';
import { settingsIcon, lockIcon, stamp, shareIcon, closeIcon } from './icons.js';
import { openSheet, button } from './sheet.js';
import { isIOS, isStandalone } from '../lib/env.js';

export function levelUnlocked(n) {
  const s = load();
  if (n === 1 || s.unlockedAll) return true;
  const prev = LEVELS.find((l) => l.n === n - 1);
  return prev.models.some((id) => s.completed[id]);
}

export function thumb(model, hex, idp) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('thumb');
  svg.setAttribute('aria-hidden', 'true');
  const last = model.steps[model.steps.length - 1];
  renderDiagram(svg, { shapes: last.shapes, symbols: [], minView: 40 }, hex, idp);
  return svg;
}

export function renderHome(root, { onOpen, onPaper, onDefaultPaper }) {
  root.innerHTML = '';
  const s = load();
  const screen = document.createElement('div');
  screen.className = 'screen home fade-in';
  const hex = colorHex(s.paper);
  screen.innerHTML = `
    <div class="topbar">
      <span class="brand">Swipegami</span>
      <button class="chip paper" aria-label="${paperLabel(s.paper)}, tap to change paper"><span class="sw" style="background:${hex}"></span>${paperLabel(s.paper)}</button>
      <button class="iconbtn settings" aria-label="Settings">${settingsIcon}</button>
    </div>
    <div class="hairline"></div>`;
  const path = document.createElement('div');
  path.className = 'path scroll';
  path.style.flex = '1';
  LEVELS.forEach((lv) => {
    const unlocked = levelUnlocked(lv.n);
    const done = lv.models.every((id) => s.completed[id]);
    const div = document.createElement('section');
    div.className = 'level' + (unlocked ? '' : ' locked') + (done ? ' done' : '');
    div.innerHTML = `<div class="node"></div>
      <div class="label">Level ${lv.n}</div>
      <div class="lname">${lv.name}${unlocked ? '' : `<span class="lock" aria-label="Locked">${lockIcon}</span>`}</div>
      <div class="moves">${lv.moves}</div>`;
    const row = document.createElement('div');
    row.className = 'mrow';
    lv.models.forEach((id) => {
      const m = MODELS[id];
      if (!m) return;
      const card = document.createElement('button');
      card.className = 'mcard';
      card.setAttribute('aria-label', `${m.name}${s.completed[id] ? ', folded' : ''}${unlocked ? '' : ', locked'}`);
      if (!unlocked) card.tabIndex = -1;
      card.appendChild(thumb(m, hex, 't' + id));
      const name = document.createElement('div');
      name.className = 'mname';
      name.textContent = m.name;
      card.appendChild(name);
      const last = s.lastStep[id];
      if (last > 0 && !s.completed[id]) {
        const r = document.createElement('div');
        r.className = 'resume';
        r.textContent = `step ${last + 1}`;
        card.appendChild(r);
      }
      if (s.completed[id]) card.insertAdjacentHTML('beforeend', stamp('stamp'));
      card.addEventListener('click', () => { if (unlocked) onOpen(id, card.getBoundingClientRect()); });
      row.appendChild(card);
    });
    div.appendChild(row);
    path.appendChild(div);
  });
  screen.appendChild(path);
  root.appendChild(screen);

  screen.querySelector('.paper').addEventListener('click', onPaper);
  screen.querySelector('.settings').addEventListener('click', () => openSettings(root, { onDefaultPaper, rerender: () => renderHome(root, { onOpen, onPaper, onDefaultPaper }) }));

  // One install hint, only in Safari browser mode on iOS, never from the Home Screen.
  if (isIOS && !isStandalone() && !s.installHintDone) {
    setTimeout(() => {
      openSheet(root, (sheet, close) => {
        const d = document.createElement('div');
        d.className = 'hint';
        d.innerHTML = `<span class="ico">${shareIcon}</span><p>Add to Home Screen to fold offline. Tap Share, then “Add to Home Screen”.</p>`;
        const x = button('', 'iconbtn', close);
        x.innerHTML = closeIcon;
        x.setAttribute('aria-label', 'Dismiss');
        d.appendChild(x);
        sheet.appendChild(d);
      }, { onClose: () => save({ installHintDone: true }) });
    }, 600);
  }
}

function openSettings(root, { onDefaultPaper, rerender }) {
  openSheet(root, (sheet, close) => {
    const s = load();
    sheet.insertAdjacentHTML('beforeend', '<h2>Settings</h2>');
    const unlock = document.createElement('button');
    unlock.className = 'srow';
    const setUnlock = () => { unlock.innerHTML = `<span>Unlock all levels</span><span class="val">${load().unlockedAll ? 'On' : 'Off'}</span>`; };
    setUnlock();
    unlock.addEventListener('click', () => { save({ unlockedAll: !load().unlockedAll }); setUnlock(); rerender(); });
    sheet.appendChild(unlock);

    const paper = document.createElement('button');
    paper.className = 'srow';
    paper.innerHTML = `<span>Default paper</span><span class="val">${paperLabel(s.paper)}, ${paperType(s.paper).custom ? '' : ''}${(s.paper && s.paper.color) || 'yellow'}</span>`;
    paper.addEventListener('click', () => { close(); onDefaultPaper(); });
    sheet.appendChild(paper);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'srow danger';
    resetBtn.innerHTML = '<span>Reset progress</span>';
    resetBtn.addEventListener('click', () => {
      resetBtn.replaceWith(confirmRow());
    });
    sheet.appendChild(resetBtn);

    function confirmRow() {
      const c = document.createElement('div');
      c.className = 'confirm';
      c.innerHTML = '<p class="quiet" style="flex:1;align-self:center">Clear all progress?</p>';
      c.appendChild(button('Keep', '', () => { c.replaceWith(resetBtn); }));
      c.appendChild(button('Reset', 'danger', () => { reset(); close(); rerender(); }));
      return c;
    }
  });
}
