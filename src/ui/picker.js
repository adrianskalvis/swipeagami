import { PAPERS, COLORS, sizeNote, tooSmall, squareSide } from '../lib/paper.js';
import { backIcon } from './icons.js';

const PHONE = { w: 7.2, h: 14.7 };

function paperSvg(t, sideCm) {
  // Phone outline and the sheet, drawn to the same scale (cm).
  const W = 46, H = 34, bottom = 32;
  const px = 2, py = bottom - PHONE.h;
  const w = t.custom ? sideCm : t.w, h = t.custom ? sideCm : t.h;
  const sx = 12, sy = bottom - h;
  const rx = t.strip ? 0.2 : 0.3;
  return `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
<rect class="pp-phone" x="${px}" y="${py}" width="${PHONE.w}" height="${PHONE.h}" rx="1"/>
<rect class="pp-phone" x="${px + 2.6}" y="${py + 0.8}" width="2" height="0.5" rx="0.25"/>
<rect class="pp-sheet${w !== h ? ' rect' : ''}" x="${sx}" y="${sy.toFixed(2)}" width="${w}" height="${h}" rx="${rx}"/>
${t.custom ? `<circle class="pp-handle" cx="${sx + w}" cy="${sy.toFixed(2)}" r="2.2" fill="#c0392b"/>` : ''}
</svg>`;
}

// mode: 'first' (first launch), 'change' (before a model), 'default' (settings).
export function renderPicker(root, { mode = 'first', model, paper, onDone, onBack }) {
  root.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen picker fade-in';
  root.appendChild(screen);
  const chosen = { type: paper ? paper.type : null, w: paper ? paper.w : 15, h: paper ? paper.h : 15, color: paper ? paper.color : null };
  let customSide = paper && paper.type === 'custom' ? squareSide(paper) : 12;

  const header = (label, title, sub, back) => {
    screen.innerHTML = `
    <div class="topbar">${back ? `<button class="iconbtn back" aria-label="Back">${backIcon}</button>` : '<span style="width:40px"></span>'}<span class="label">${label}</span><span style="width:40px"></span></div>
    <h1>${title}</h1>${sub ? `<p class="quiet sub">${sub}</p>` : ''}`;
    if (back) screen.querySelector('.back').addEventListener('click', back);
  };

  function stage1() {
    header('Paper', 'What paper do you have?', 'Tap one. Each sheet is drawn next to a phone.', onBack);
    const grid = document.createElement('div');
    grid.className = 'grid2 scroll';
    grid.style.flex = '1';
    const use = document.createElement('button');
    use.className = 'primary filled';
    use.textContent = 'Use this size';
    use.style.display = 'none';
    for (const t of PAPERS) {
      const card = document.createElement('button');
      card.className = 'pcard' + (chosen.type === t.id ? ' selected' : '');
      card.setAttribute('aria-label', `${t.name}, ${t.dim}`);
      const draw = () => { card.innerHTML = `${paperSvg(t, customSide)}<div class="pname">${t.name}</div><div class="pdim">${t.custom ? `about ${customSide} cm square` : t.dim}</div>`; };
      draw();
      if (t.custom) {
        // Drag sideways anywhere on the card to resize the square. A plain tap also selects it.
        let dragging = false, startX = 0, startSide = customSide, moved = false;
        card.addEventListener('pointerdown', (e) => { dragging = true; moved = false; startX = e.clientX; startSide = customSide; try { card.setPointerCapture(e.pointerId); } catch { /* ignore */ } });
        card.addEventListener('pointermove', (e) => {
          if (!dragging) return;
          const cmPerPx = 46 / card.getBoundingClientRect().width;
          if (Math.abs(e.clientX - startX) > 4) moved = true;
          if (moved) { customSide = Math.round(Math.max(3, Math.min(30, startSide + (e.clientX - startX) * cmPerPx)) * 2) / 2; draw(); }
        });
        const end = () => {
          if (!dragging) return;
          dragging = false;
          chosen.type = t.id; chosen.w = chosen.h = customSide;
          [...grid.children].forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          if (!moved) stage2(); else use.style.display = 'block';
        };
        card.addEventListener('pointerup', end);
        card.addEventListener('pointercancel', end);
      } else {
        card.addEventListener('click', () => { chosen.type = t.id; chosen.w = t.w; chosen.h = t.h; stage2(); });
      }
      grid.appendChild(card);
    }
    screen.appendChild(grid);
    use.addEventListener('click', stage2);
    screen.appendChild(use);
  }

  function stage2() {
    header('Color', 'Which color is the paper?', 'The other side is drawn white.', stage1);
    const wrap = document.createElement('div');
    wrap.className = 'swatches';
    for (const c of COLORS) {
      const b = document.createElement('button');
      b.className = 'swatch';
      b.setAttribute('aria-label', c.name);
      b.innerHTML = `<div class="dot" style="background:${c.hex}"></div><span>${c.name}</span>`;
      b.addEventListener('click', () => { chosen.color = c.id; stage3(); });
      wrap.appendChild(b);
    }
    screen.appendChild(wrap);
  }

  function stage3() {
    const p = { type: chosen.type, w: chosen.w, h: chosen.h, color: chosen.color };
    header('Size', model ? 'Ready to fold' : 'Paper set', '', stage2);
    const note = document.createElement('div');
    note.className = 'sizenote';
    if (model) {
      note.textContent = sizeNote(model, p);
      if (tooSmall(model, p)) {
        const w = document.createElement('span');
        w.className = 'warn';
        w.textContent = `This paper is small for the ${model.name.toLowerCase()}. It works best from ${model.minPaperCm} cm. Fold slowly.`;
        note.appendChild(w);
      }
    } else {
      note.textContent = `A ${COLORS.find((c) => c.id === p.color).name.toLowerCase()} square of about ${Math.round(squareSide(p))} cm.`;
    }
    screen.appendChild(note);
    const go = document.createElement('button');
    go.className = 'primary filled';
    go.textContent = model ? (mode === 'first' ? 'Fold the swan' : `Fold the ${model.name.toLowerCase()}`) : 'Done';
    go.addEventListener('click', () => onDone(p));
    screen.appendChild(go);
  }

  stage1();
}
