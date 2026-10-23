// SVG rendering of a step: paper facets, creases and fold symbols.
import { sub, add, mul, norm, perp, lerp, mid, dist, bbox, overlapArea, centroid, footOf, sideOf } from './geom.js';
import { lineSpan, allPoints } from './shapes.js';

const NS = 'http://www.w3.org/2000/svg';
export const INK = '#1b1b1b';
export const SEAL = '#c0392b';

export function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

// ---- colours -------------------------------------------------------------
export function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}
export const hsl = (h, s, l) => `hsl(${h.toFixed(1)} ${Math.max(0, Math.min(100, s)).toFixed(1)}% ${Math.max(0, Math.min(100, l)).toFixed(1)}%)`;

export function paperFills(hex) {
  const [h, s, l] = hexToHsl(hex);
  const white = hex.toLowerCase() === '#ffffff';
  return {
    front: [hsl(h, s, Math.min(96, l + 5)), hsl(h, s, l - 4)],
    frontDark: [hsl(h, s, l - 6), hsl(h, s, l - 14)],
    back: white ? ['#ededea', '#dcdcd8'] : ['#ffffff', '#efefec'],
    backDark: white ? ['#dadad6', '#c9c9c4'] : ['#f0f0ee', '#e0e0dc'],
  };
}

export function paintDefs(svg, hex, idp) {
  const defs = el('defs', {}, svg);
  const f = paperFills(hex);
  const grad = (id, [c0, c1]) => {
    const g = el('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 100, y2: 100 }, defs);
    el('stop', { offset: '0', 'stop-color': c0 }, g);
    el('stop', { offset: '1', 'stop-color': c1 }, g);
  };
  grad(idp + 'f', f.front); grad(idp + 'fd', f.frontDark); grad(idp + 'b', f.back); grad(idp + 'bd', f.backDark);
}

// ---- shapes ---------------------------------------------------------------
const pathD = (pts) => 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join('L') + 'Z';

function edgePaths(s) {
  const thick = [], thin = [];
  const n = s.pts.length;
  for (let i = 0; i < n; i++) {
    const a = s.pts[i], b = s.pts[(i + 1) % n];
    const seg = `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
    (s.edges[i] === 'crease' ? thin : thick).push(seg);
  }
  return { thick: thick.join(''), thin: thin.join('') };
}

// Facets covered by a higher facet get the darker shade.
export function shadeOf(shapes) {
  const boxes = shapes.map((s) => bbox(s.pts));
  return shapes.map((s, i) => {
    const a = Math.abs(areaOf(s.pts));
    const bi = boxes[i];
    for (let j = i + 1; j < shapes.length; j++) {
      const bj = boxes[j];
      if (bj.x0 > bi.x1 || bj.x1 < bi.x0 || bj.y0 > bi.y1 || bj.y1 < bi.y0) continue;
      if (overlapArea(shapes[j].pts, s.pts) > Math.max(0.5, a * 0.03)) return true;
    }
    return false;
  });
}
function areaOf(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }

function fillKey(face, dark) {
  if (face === 'frontDark') return 'fd';
  if (face === 'backDark') return 'bd';
  return face === 'front' ? (dark ? 'fd' : 'f') : (dark ? 'bd' : 'b');
}

export function drawShapes(g, shapes, idp, opts = {}) {
  const dark = opts.shade || shadeOf(shapes);
  const nodes = [];
  shapes.forEach((s, i) => {
    const fillId = idp + fillKey(s.face, dark[i]);
    const fill = el('path', { d: pathD(s.pts), fill: `url(#${fillId})`, stroke: 'none' }, g);
    const ep = edgePaths(s);
    const thin = el('path', { d: ep.thin || 'M0 0', class: 'crease', fill: 'none' }, g);
    const thick = el('path', { d: ep.thick || 'M0 0', class: 'edge', fill: 'none' }, g);
    nodes.push({ fill, thin, thick });
  });
  return nodes;
}

export function updateShapes(nodes, shapes, idp, dark) {
  shapes.forEach((s, i) => {
    const n = nodes[i];
    const fillId = idp + fillKey(s.face, dark && dark[i]);
    n.fill.setAttribute('d', pathD(s.pts));
    n.fill.setAttribute('fill', `url(#${fillId})`);
    const ep = edgePaths(s);
    n.thin.setAttribute('d', ep.thin || 'M0 0');
    n.thick.setAttribute('d', ep.thick || 'M0 0');
  });
}

// ---- symbols -------------------------------------------------------------
function arrowHead(g, tip, dir, kind, size) {
  const d = norm(dir), n = perp(d);
  const base = sub(tip, mul(d, size));
  const l = add(base, mul(n, size * 0.55)), r = sub(base, mul(n, size * 0.55));
  if (kind === 'half') {
    el('path', { d: `M${tip[0]} ${tip[1]}L${l[0]} ${l[1]}L${base[0]} ${base[1]}Z`, class: 'arrow-head' }, g);
    return;
  }
  el('path', { d: `M${tip[0]} ${tip[1]}L${l[0]} ${l[1]}L${r[0]} ${r[1]}Z`, class: kind === 'hollow' ? 'arrow-head hollow' : 'arrow-head' }, g);
}

function curve(from, to, bend) {
  const m = mid(from, to);
  const c = add(m, mul(perp(sub(to, from)), bend));
  return { c, d: `M${from[0]} ${from[1]}Q${c[0]} ${c[1]} ${to[0]} ${to[1]}` };
}

export function drawArrow(g, a, scale) {
  const { from, to } = a;
  const L = dist(from, to);
  const head = (a.headSize || 4.2) * scale;
  const bend = a.bend == null ? 0.22 : a.bend;
  const k = a.kind || 'valley';
  const headKind = a.head || (k === 'mountain' ? 'hollow' : 'solid');
  const { c, d } = curve(from, to, bend);
  el('path', { d, class: 'arrow' + (a.dashed ? ' dashed' : ''), fill: 'none' }, g);
  arrowHead(g, to, sub(to, c), headKind, head);
  if (a.back) {
    // Return path: a second arc back to the start, a little wider, with an open head.
    const off = mul(norm(perp(sub(to, from))), -(2.2 * scale));
    const r = curve(add(to, off), add(from, off), -bend * 1.25);
    el('path', { d: r.d, class: 'arrow', fill: 'none' }, g);
    arrowHead(g, add(from, off), sub(add(from, off), r.c), 'hollow', head);
  }
  if (a.tail === 'push') {
    // Short bar across the tail: "push in here".
    const dir = norm(sub(c, from)), n = perp(dir);
    const p1 = add(from, mul(n, head * 0.6)), p2 = sub(from, mul(n, head * 0.6));
    el('path', { d: `M${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}`, class: 'arrow' }, g);
  }
  if (a.tail === 'open') {
    // Small hollow "open" triangle at the tail: squash / open out.
    const dir = norm(sub(c, from));
    const t = sub(from, mul(dir, head * 0.2));
    arrowHead(g, t, mul(dir, -1), 'hollow', head * 0.8);
  }
  if (a.tail === 'repeat') {
    const dir = norm(sub(c, from)), n = perp(dir);
    for (let i = 0; i < 2; i++) {
      const b = sub(from, mul(dir, i * head * 0.5));
      const p1 = add(b, mul(n, head * 0.45)), p2 = sub(b, mul(n, head * 0.45));
      el('path', { d: `M${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}`, class: 'arrow' }, g);
    }
  }
  return L;
}

function drawTurnOver(g, at, scale) {
  const r = 7 * scale;
  const cx = at[0], cy = at[1];
  // Two curved arrows chasing each other (turn the model over).
  const a1 = `M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r * 0.1} ${cy - r * 0.98}`;
  const a2 = `M${cx + r} ${cy}A${r} ${r} 0 0 1 ${cx - r * 0.1} ${cy + r * 0.98}`;
  el('path', { d: a1, class: 'arrow', fill: 'none' }, g);
  el('path', { d: a2, class: 'arrow', fill: 'none' }, g);
  arrowHead(g, [cx + r * 0.1, cy - r * 0.98], [1, 0.1], 'solid', 3.6 * scale);
  arrowHead(g, [cx - r * 0.1, cy + r * 0.98], [-1, -0.1], 'solid', 3.6 * scale);
}

function drawRotate(g, at, scale, deg) {
  const r = 6 * scale;
  const cx = at[0], cy = at[1];
  const sweep = deg >= 0 ? 1 : 0;
  const d = `M${cx - r} ${cy}A${r} ${r} 0 1 ${sweep} ${cx} ${cy + r}`;
  el('path', { d, class: 'arrow', fill: 'none' }, g);
  arrowHead(g, [cx, cy + r], [1, 0], 'solid', 3.6 * scale);
  const t = el('text', { x: cx, y: cy + 0.8 * scale, class: 'sym-label', 'text-anchor': 'middle' }, g);
  t.textContent = Math.abs(deg) + '°';
}

function drawCut(g, line, scale) {
  const [a, b] = line;
  el('path', { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, class: 'cut', fill: 'none' }, g);
  // Scissors mark: two rings and two blades, placed at the midpoint.
  const m = mid(a, b), d = norm(sub(b, a)), n = perp(d);
  const s = 2.4 * scale;
  const h1 = add(m, add(mul(n, -s * 1.6), mul(d, -s * 0.9))), h2 = add(m, add(mul(n, -s * 1.6), mul(d, s * 0.9)));
  el('circle', { cx: h1[0], cy: h1[1], r: s * 0.7, class: 'arrow', fill: 'none' }, g);
  el('circle', { cx: h2[0], cy: h2[1], r: s * 0.7, class: 'arrow', fill: 'none' }, g);
  const t1 = add(m, add(mul(n, s * 1.7), mul(d, s * 0.9))), t2 = add(m, add(mul(n, s * 1.7), mul(d, -s * 0.9)));
  el('path', { d: `M${h1[0]} ${h1[1]}L${t1[0]} ${t1[1]}M${h2[0]} ${h2[1]}L${t2[0]} ${t2[1]}`, class: 'arrow', fill: 'none' }, g);
}

export function drawSymbols(g, symbols, shapes, scale = 1) {
  for (const s of symbols || []) {
    if (s.t === 'valley' || s.t === 'mountain' || s.t === 'hidden' || s.t === 'cut') {
      let seg = s.seg || (s.line ? lineSpan(shapes, s.line, s.select) : null);
      if (!seg) continue;
      if (s.extend) { const d = norm(sub(seg[1], seg[0])); seg = [sub(seg[0], mul(d, s.extend)), add(seg[1], mul(d, s.extend))]; }
      if (s.t === 'cut') { drawCut(g, seg, scale); continue; }
      el('path', { d: `M${seg[0][0]} ${seg[0][1]}L${seg[1][0]} ${seg[1][1]}`, class: s.t, fill: 'none' }, g);
    } else if (s.t === 'arrow') drawArrow(g, s, scale);
    else if (s.t === 'turn') drawTurnOver(g, s.at, scale);
    else if (s.t === 'rotate') drawRotate(g, s.at, scale, s.deg);
    else if (s.t === 'dot') el('circle', { cx: s.at[0], cy: s.at[1], r: 1.3 * scale, class: 'dot' }, g);
    else if (s.t === 'text') { const t = el('text', { x: s.at[0], y: s.at[1], class: 'sym-label', 'text-anchor': 'middle' }, g); t.textContent = s.text; }
  }
}

// ---- auto symbols for a fold ---------------------------------------------
export function foldSymbols(shapes, line, moving, mode, opts = {}) {
  const syms = [];
  const sel = opts.selectFn;
  syms.push({ t: mode === 'mountain' ? 'mountain' : 'valley', line, select: sel, extend: opts.extend ?? 0 });
  if (opts.arrow === false) return syms;
  const pts = opts.arrows || [moving];
  const c = centroid(allPoints(shapes));
  for (const p of pts) {
    let from = Array.isArray(p[0]) ? p[0] : p;
    let to = Array.isArray(p[0]) ? p[1] : (opts.to || add(mul(footOf(line, from), 2), mul(from, -1)));
    // Pull both ends in a little so the symbol does not sit on the corner.
    const d = norm(sub(to, from)), L = dist(from, to);
    const ins = Math.min(2.5, L * 0.08);
    from = add(from, mul(d, ins)); to = sub(to, mul(d, ins));
    const m = mid(from, to);
    const sgn = Math.sign(cross2(sub(to, from), sub(c, m))) || 1;
    syms.push({ t: 'arrow', from, to, bend: -sgn * (opts.bend ?? 0.22), kind: mode === 'mountain' ? 'mountain' : 'valley', head: opts.head, back: !!opts.back, tail: opts.tail || null });
  }
  return syms;
}
function cross2(a, b) { return a[0] * b[1] - a[1] * b[0]; }

// ---- fit ----------------------------------------------------------------
export function symbolPoints(symbols) {
  const pts = [];
  for (const s of symbols || []) {
    if (s.t === 'arrow') { pts.push(s.from, s.to); const { c } = curve(s.from, s.to, (s.bend == null ? 0.22 : s.bend) * (s.back ? 1.3 : 1)); pts.push(c); if (s.back) pts.push(curve(s.to, s.from, -(s.bend == null ? 0.22 : s.bend) * 1.3).c); }
    else if (s.t === 'turn' || s.t === 'rotate') { pts.push([s.at[0] - 9, s.at[1] - 9], [s.at[0] + 9, s.at[1] + 9]); }
    else if (s.seg) pts.push(...s.seg);
  }
  return pts;
}

export function fitBox(step) {
  const pts = allPoints(step.shapes).concat(symbolPoints(step.symbols));
  if (step.anim && step.anim.type === 'frames') for (const f of step.anim.frames) pts.push(...allPoints(f));
  const addFold = (a) => { for (const g of a.groups) for (const s of g.moving) for (const p of s.pts) { const f = footOf(g.line, p); pts.push(sub(mul(f, 2), p)); } };
  if (step.anim && step.anim.type === 'fold') addFold(step.anim);
  if (step.anim && step.anim.type === 'seq') for (const p of step.anim.parts) { if (p.type === 'fold') addFold(p); else if (p.type === 'frames') for (const f of p.frames) pts.push(...allPoints(f)); }
  if (step.extraPoints) pts.push(...step.extraPoints);
  const b = bbox(pts);
  const pad = 6;
  let w = b.w + pad * 2, h = b.h + pad * 2;
  const min = step.minView || 62;
  if (w < min) { const d = min - w; b.x0 -= d / 2; w = min; }
  if (h < min) { const d = min - h; b.y0 -= d / 2; h = min; }
  return { x: b.x0 - pad, y: b.y0 - pad, w, h };
}

// Render a complete step diagram into an svg element.
export function renderDiagram(svg, step, colorHex, idp = 'p') {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const box = step.view || fitBox(step);
  svg.setAttribute('viewBox', `${box.x.toFixed(2)} ${box.y.toFixed(2)} ${box.w.toFixed(2)} ${box.h.toFixed(2)}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  paintDefs(svg, colorHex, idp);
  const scale = Math.max(0.55, Math.min(1.25, Math.max(box.w, box.h) / 100));
  const gs = el('g', { class: 'paper' }, svg);
  const nodes = drawShapes(gs, step.shapes, idp);
  const gsym = el('g', { class: 'symbols' }, svg);
  drawSymbols(gsym, step.symbols, step.shapes, scale);
  if (step.inset) drawInset(svg, step.inset, box, colorHex, idp + 'i');
  return { nodes, gs, gsym, box, scale };
}

// A small side view in the corner of the card.
function drawInset(svg, inset, box, colorHex, idp) {
  const size = Math.min(box.w, box.h) * 0.34;
  const x = box.x + box.w - size - 2, y = box.y + 2;
  const g = el('g', { class: 'inset' }, svg);
  el('rect', { x, y, width: size, height: size, rx: 1.5, class: 'inset-bg' }, g);
  const ib = inset.view || fitBox({ shapes: inset.shapes, symbols: inset.symbols });
  const k = (size - 2) / Math.max(ib.w, ib.h);
  const inner = el('g', { transform: `translate(${x + 1 + (size - 2 - ib.w * k) / 2} ${y + 1 + (size - 2 - ib.h * k) / 2}) scale(${k}) translate(${-ib.x} ${-ib.y})` }, g);
  paintDefs(svg, colorHex, idp);
  drawShapes(inner, inset.shapes, idp);
  drawSymbols(inner, inset.symbols, inset.shapes, 1 / k);
  if (inset.label) { const t = el('text', { x: x + size / 2, y: y + size - 1.2, class: 'sym-label small', 'text-anchor': 'middle' }, g); t.textContent = inset.label; }
}

// ---- animation ---------------------------------------------------------
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Produce the frame function (t in 0..1) -> shapes for an animation spec.
export function animFrames(anim, baseShapes) {
  if (!anim) return null;
  if (anim.type === 'fold') {
    const { fixed, groups, mode, unfold } = anim;
    const lineOf = new Map();
    let movingAll = [];
    for (const g of groups) { for (const sh of g.moving) lineOf.set(sh, g.line); movingAll = movingAll.concat(g.moving); }
    const moved = movingAll.slice().reverse();
    const order = mode === 'mountain' ? moved.concat(fixed) : fixed.concat(moved);
    return {
      order,
      at(t) {
        const s = unfold ? Math.cos(2 * Math.PI * easeInOut(t)) : Math.cos(Math.PI * easeInOut(t));
        return order.map((sh) => {
          const line = lineOf.get(sh);
          if (!line) return sh;
          const pts = sh.pts.map((p) => { const f = footOf(line, p); return add(f, mul(sub(p, f), s)); });
          const face = s >= 0 ? sh.face : sh.face === 'front' ? 'back' : 'front';
          return { pts, edges: sh.edges, face, tags: sh.tags };
        });
      },
    };
  }
  if (anim.type === 'seq') {
    // Several fold animations one after the other; the renderer rebuilds nodes between parts.
    const parts = anim.parts.map((p) => animFrames(p));
    const n = parts.length;
    return {
      seq: true,
      partAt(t) { const x = Math.min(0.99999, Math.max(0, t)) * n; const i = Math.floor(x); return { i, part: parts[i], u: x - i }; },
      order: parts[0].order,
      at(t) { const { part, u } = this.partAt(t); return part.at(u); },
    };
  }
  if (anim.type === 'frames') {
    const frames = anim.frames;
    const n = frames.length - 1;
    return {
      order: frames[0],
      at(t) {
        if (n <= 0) return frames[0];
        const x = Math.min(0.99999, Math.max(0, t)) * n;
        const i = Math.floor(x), u = easeInOut(x - i);
        const a = frames[i], b = frames[i + 1];
        return a.map((sh, k) => {
          const tb = b[k];
          const f = u < 0.5 ? sh.face : tb.face;
          return { pts: sh.pts.map((p, j) => lerp(p, tb.pts[j] || p, u)), edges: u < 0.5 ? sh.edges : tb.edges, face: f, tags: sh.tags };
        });
      },
    };
  }
  return null;
}

// Play the animation of a rendered step. Returns a stop function.
export function playAnimation(svg, step, rendered, colorHex, idp, { loops = 2, duration = 2600, reduced = false, onEnd } = {}) {
  const fr = animFrames(step.anim, step.shapes);
  if (!fr) return () => {};
  const g = rendered.gs;
  while (g.firstChild) g.removeChild(g.firstChild);
  const first = fr.at(0);
  let nodes = drawShapes(g, first, idp, { shade: first.map(() => false) });
  let partIndex = 0;
  const frameAt = (t) => {
    if (fr.seq) {
      const { i } = fr.partAt(t);
      if (i !== partIndex) { partIndex = i; while (g.firstChild) g.removeChild(g.firstChild); const f = fr.at(t); nodes = drawShapes(g, f, idp, { shade: f.map(() => false) }); return; }
    }
    updateShapes(nodes, fr.at(t), idp);
  };
  rendered.gsym.classList.add('faded');
  let raf = 0, stopped = false;
  const hold = 450;
  const total = loops * (duration + hold);
  const start = performance.now();
  const finish = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    while (g.firstChild) g.removeChild(g.firstChild);
    rendered.nodes = drawShapes(g, step.shapes, idp);
    rendered.gsym.classList.remove('faded');
    if (onEnd) onEnd();
  };
  if (reduced) {
    // Reduced motion: show the end state for a moment, then return.
    frameAt(0.999);
    setTimeout(finish, 1200);
    return finish;
  }
  const tick = (now) => {
    if (stopped) return;
    const e = now - start;
    if (e >= total) return finish();
    const inLoop = e % (duration + hold);
    const t = Math.min(1, inLoop / duration);
    frameAt(t);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return finish;
}

export { pathD, sideOf };
