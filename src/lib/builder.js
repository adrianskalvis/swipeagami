// Authoring API for a model: each op records a step (the state before the
// move plus its symbols and animation) and then applies the move.
import * as S from './shapes.js';
import { bisector, reflect, lineAngle, norm, sub, add, bbox, mid, centroid, dist } from './geom.js';
import { foldSymbols } from './render.js';
import { allPoints } from './shapes.js';

function resolveLine(spec) {
  if (spec.line) return { line: spec.line, moving: spec.moving || spec.from };
  if (spec.from && spec.to) return { line: bisector(spec.from, spec.to), moving: spec.from };
  if (spec.at && spec.angle != null) return { line: lineAngle(spec.at, spec.angle), moving: spec.moving };
  throw new Error('fold spec needs line or from/to');
}

// Bisector of the angle at `v` between directions to p1 and p2 (a fold that lays edge v->p1 on edge v->p2).
export function angleBisector(v, p1, p2) {
  const d = add(norm(sub(p1, v)), norm(sub(p2, v)));
  return [v, add(v, d)];
}

function sideSign(line, p) { const d = sub(line[1], line[0]); return d[0] * (p[1] - line[0][1]) - d[1] * (p[0] - line[0][0]); }

// Pieces that move in none of the folds (for a combined animation).
function stationaryRemainder(shapes, folds) {
  let cur = shapes.map(S.clone);
  for (const f of folds) {
    const out = [];
    const sel = S.resolveSelect(cur, f.select, f.moving, f.line);
    const sign = Math.sign(sideSign(f.line, f.moving)) || 1;
    cur.forEach((s, i) => {
      if (!sel(s, i, cur)) { out.push(s); return; }
      const a = S.clipShape(s, f.line, -sign, f.cutType || 'fold');
      if (a) out.push(a);
    });
    cur = out;
  }
  return cur;
}

// Apply one or more folds (same step). Returns symbols, animation and the new state.
function applyFolds(state, mode, list, { unfoldAll = false } = {}) {
  const before = state;
  let symbols = [];
  let cur = state;
  const folds = [];
  for (const spec of list) {
    const { line, moving } = resolveLine(spec);
    const m = spec.mode || mode;
    const sel = S.resolveSelect(cur, spec.select, moving, line);
    const cutType = spec.unfold || unfoldAll ? 'crease' : 'fold';
    symbols = symbols.concat(foldSymbols(cur, line, moving, m, { arrows: spec.arrows, arrow: spec.arrow, bend: spec.bend ?? (unfoldAll ? 0.2 : undefined), head: spec.head, tail: spec.tail, selectFn: spec.select ? sel : null, extend: spec.extend, to: spec.to, back: unfoldAll || !!spec.back }));
    folds.push({ line, moving, select: spec.select, cutType, mode: m, tag: spec.tag, flip: spec.flip });
    if (unfoldAll) cur = S.crease(cur, line, { select: spec.select, moving });
    else cur = S.fold(cur, line, { moving, select: spec.select, mode: m, cutType, tag: spec.tag, flip: spec.flip !== false && !spec.reverse, keepOrder: !!spec.reverse }).shapes;
  }
  // Animation groups come from single folds applied to the original state.
  const groups = folds.map((f) => ({ line: f.line, moving: S.fold(before, f.line, { moving: f.moving, select: f.select, mode: f.mode }).anim.moving }));
  const fixed = stationaryRemainder(before, folds);
  return { symbols, anim: { type: 'fold', fixed, groups, mode, unfold: unfoldAll }, next: cur };
}

export function builder(meta) {
  const steps = [];
  let state = meta.start ? meta.start : S.diamond('back');
  const record = (text, shapes, symbols, anim, opts = {}) => {
    steps.push({ text, shapes, symbols, anim, tricky: !!opts.tricky, inset: opts.inset, view: opts.view, minView: opts.minView, extraPoints: opts.extraPoints, credit: opts.credit });
  };
  const b = {
    meta,
    steps,
    get state() { return state; },
    set(shapes) { state = shapes; return b; },

    start(text, opts = {}) { record(text, state, opts.symbols || [], null, opts); return b; },

    fold(mode, specs, opts = {}) {
      const list = Array.isArray(specs) ? specs : [specs];
      const r = applyFolds(state, mode, list);
      record(opts.text || '', state, r.symbols.concat(opts.symbols || []), r.anim, opts);
      state = r.next;
      return b;
    },
    valley(specs, opts) { return b.fold('valley', specs, opts); },
    mountain(specs, opts) { return b.fold('mountain', specs, opts); },

    // Fold and unfold: leaves a crease.
    crease(specs, opts = {}) {
      const list = Array.isArray(specs) ? specs : [specs];
      const r = applyFolds(state, opts.mode || 'valley', list, { unfoldAll: true });
      record(opts.text || '', state, r.symbols.concat(opts.symbols || []), r.anim, opts);
      state = r.next;
      return b;
    },

    // Several moves shown as one step, animated one after the other.
    // ops: [{ mode: 'valley'|'mountain'|'crease', specs, symbols: false? }]
    combo(ops, opts = {}) {
      const before = state;
      let cur = state;
      const parts = [];
      let symbols = [];
      for (const o of ops) {
        const list = Array.isArray(o.specs) ? o.specs : [o.specs];
        const r = applyFolds(cur, o.mode === 'crease' ? 'valley' : o.mode, list, { unfoldAll: o.mode === 'crease' });
        if (o.symbols !== false) symbols = symbols.concat(r.symbols);
        parts.push(r.anim);
        cur = r.next;
      }
      record(opts.text || '', before, (opts.symbols ? opts.symbols : symbols), { type: 'seq', parts }, opts);
      state = cur;
      return b;
    },

    turnOver(text, opts = {}) {
      const bb = bbox(allPoints(state));
      const at = opts.at || [bb.x1 + 11, (bb.y0 + bb.y1) / 2];
      const before = state;
      const axis = opts.axis ?? (bb.x0 + bb.x1) / 2;
      const after = S.turnOver(state, axis);
      const frames = [before, before.map((s) => ({ ...s, pts: s.pts.map((p) => [axis, p[1]]) })), after.slice().reverse()];
      record(text, before, [{ t: 'turn', at }].concat(opts.symbols || []), { type: 'frames', frames }, opts);
      state = after;
      return b;
    },

    // Silent transforms between steps (no step recorded).
    rotate(deg, c) { state = S.rotateAll(state, deg, c); return b; },
    translate(d) { state = S.translateAll(state, d); return b; },
    scale(k, c) { state = S.scaleAll(state, k, c); return b; },
    tag(pred, tag) { state = S.tagShapes(state, pred, tag); return b; },
    creaseOnly(line, opts = {}) { state = S.crease(state, line, opts); return b; },
    apply(mode, specs) { const list = Array.isArray(specs) ? specs : [specs]; state = applyFolds(state, mode === 'crease' ? 'valley' : mode, list, { unfoldAll: mode === 'crease' }).next; return b; },

    // A hand-authored move: `next` is the resulting state, `frames` the keyframes.
    custom({ text, symbols = [], next, frames, anim, tricky = false, inset, view, minView, extraPoints, shapes, credit }) {
      const before = shapes || state;
      const a = anim || (frames ? { type: 'frames', frames } : null);
      record(text, before, symbols, a, { tricky, inset, view, minView, extraPoints, credit });
      if (next) state = next;
      return b;
    },

    finish(text, opts = {}) {
      const shapes = opts.shapes || state;
      steps.push({ text, shapes, symbols: opts.symbols || [], anim: null, tricky: false, final: true, view: opts.view, minView: opts.minView, credit: opts.credit });
      state = shapes;
      return b;
    },

    reflect: (line, p) => reflect(line, p),
    bisector,
    angleBisector,
    mid,
    centroid: () => centroid(allPoints(state)),
    bbox: () => bbox(allPoints(state)),
  };
  return b;
}

export function finishedShapes(model) {
  return model.steps[model.steps.length - 1].shapes;
}

export { S, dist };
