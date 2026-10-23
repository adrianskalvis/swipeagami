// Paper facets and fold operations.
// A shape: { pts, edges, face, tags, pid, links }
//   edges[i] describes the edge from pts[i] to pts[i+1]: 'edge' (cut paper edge),
//   'fold' (folded edge, drawn thick) or 'crease' (crease line, drawn thin).
//   pid is a unique piece id; links holds the pids of physically adjacent pieces
//   (pieces joined along a crease or fold). The array order is the z-order, bottom first.
import { sideOf, reflect, lerp, dist, area, pointInPoly, segmentsShare, EPS, sub, add, norm, dot, rot } from './geom.js';

let PID = 1;
export function shape(pts, face = 'back', tags = [], edges) {
  return { pts: pts.map((p) => [p[0], p[1]]), edges: edges ? edges.slice() : pts.map(() => 'edge'), face, tags: tags.slice(), pid: PID++, links: new Map() };
}
export function clone(s) {
  return { pts: s.pts.map((p) => [p[0], p[1]]), edges: s.edges.slice(), face: s.face, tags: s.tags.slice(), pid: s.pid, links: new Map(s.links) };
}
// links: pid -> { ei, ej }: this piece's edge ei is joined to the other piece's edge ej.
export function link(a, b, hint) {
  const sh = sharedEdgeIdx(a, b, hint);
  if (!sh) return false;
  a.links.set(b.pid, { ei: sh.ei, ej: sh.ej });
  b.links.set(a.pid, { ei: sh.ej, ej: sh.ei });
  return true;
}
export function linkAll(shapes, pairs) { for (const [i, j, hint] of pairs) link(shapes[i], shapes[j], hint); return shapes; }
export const square = (face = 'back') => [shape([[0, 0], [100, 0], [100, 100], [0, 100]], face)];
export const diamond = (face = 'back') => [shape([[50, 0], [100, 50], [50, 100], [0, 50]], face)];
export const rect = (w, h, face = 'back') => [shape([[50 - w / 2, 50 - h / 2], [50 + w / 2, 50 - h / 2], [50 + w / 2, 50 + h / 2], [50 - w / 2, 50 + h / 2]], face)];

function dedupe(out) {
  const res = [];
  for (const o of out) {
    if (res.length && dist(res[res.length - 1].p, o.p) < 1e-5) continue;
    res.push(o);
  }
  while (res.length > 1 && dist(res[0].p, res[res.length - 1].p) < 1e-5) res.pop();
  return res;
}

// Clip a shape to the half plane keep*side >= 0. New edges along the line get cutType.
export function clipShape(s, line, keep, cutType = 'crease') {
  const pts = s.pts, n = pts.length;
  const sd = pts.map((p) => sideOf(line, p) * keep);
  const out = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = pts[i], b = pts[j], sa = sd[i], sb = sd[j], t = s.edges[i];
    const ain = sa >= -1e-6, bin = sb >= -1e-6;
    if (ain && bin) out.push({ p: b, inType: t });
    else if (ain && !bin) out.push({ p: lerp(a, b, sa / (sa - sb)), inType: t });
    else if (!ain && bin) { out.push({ p: lerp(a, b, sa / (sa - sb)), inType: cutType }); out.push({ p: b, inType: t }); }
  }
  const o = dedupe(out);
  if (o.length < 3) return null;
  const rp = o.map((x) => x.p);
  if (Math.abs(area(rp)) < 1e-3) return null;
  const edges = rp.map((_, i) => o[(i + 1) % o.length].inType);
  return { pts: rp, edges, face: s.face, tags: s.tags.slice(), pid: PID++, links: new Map() };
}

export function reflectShape(s, line, flip = true) {
  return { ...s, pts: s.pts.map((p) => reflect(line, p)), edges: s.edges.slice(), face: flip ? (s.face === 'front' ? 'back' : 'front') : s.face, tags: s.tags.slice(), links: new Map(s.links) };
}

function markOnLine(s, line, type) {
  const n = s.pts.length;
  for (let i = 0; i < n; i++) {
    const a = s.pts[i], b = s.pts[(i + 1) % n];
    if (Math.abs(sideOf(line, a)) < 1e-4 && Math.abs(sideOf(line, b)) < 1e-4) s.edges[i] = type;
  }
  return s;
}

export function topShapeAt(shapes, p) {
  for (let i = shapes.length - 1; i >= 0; i--) if (pointInPoly(p, shapes[i].pts, 0.05)) return i;
  return -1;
}

// Overlap of two collinear segments along a1->a2, or null.
function overlap(a1, a2, b1, b2) {
  if (!segmentsShare(a1, a2, b1, b2)) return null;
  const d = norm(sub(a2, a1));
  const t = [0, dot(sub(a2, a1), d), dot(sub(b1, a1), d), dot(sub(b2, a1), d)];
  const lo = Math.max(Math.min(t[0], t[1]), Math.min(t[2], t[3]));
  const hi = Math.min(Math.max(t[0], t[1]), Math.max(t[2], t[3]));
  return { p0: add(a1, [d[0] * lo, d[1] * lo]), p1: add(a1, [d[0] * hi, d[1] * hi]) };
}

// A joint between two pieces: a crease or fold edge they share. Cut edges never join.
// With `hint` (a line), only edges lying on that line count.
function sharedEdgeIdx(a, b, hint) {
  for (let ei = 0; ei < a.pts.length; ei++) {
    if (a.edges[ei] === 'edge') continue;
    const a1 = a.pts[ei], a2 = a.pts[(ei + 1) % a.pts.length];
    if (hint && (Math.abs(sideOf(hint, a1)) > 1e-3 || Math.abs(sideOf(hint, a2)) > 1e-3)) continue;
    for (let ej = 0; ej < b.pts.length; ej++) {
      if (b.edges[ej] === 'edge') continue;
      const o = overlap(a1, a2, b.pts[ej], b.pts[(ej + 1) % b.pts.length]);
      if (o) return { ei, ej, p0: o.p0, p1: o.p1 };
    }
  }
  return null;
}

// The flap at shape k: pieces joined to it along creases, or along folded edges
// that have a stretch on the moving side of `line`.
export function flapAt(shapes, k, line, ms) {
  const byPid = new Map(shapes.map((s, i) => [s.pid, i]));
  const inSet = new Set([k]);
  const queue = [k];
  while (queue.length) {
    const i = queue.pop();
    const a = shapes[i];
    for (const [pid, { ei, ej }] of a.links) {
      const j = byPid.get(pid);
      if (j == null || inSet.has(j)) continue;
      const b = shapes[j];
      const o = overlap(a.pts[ei], a.pts[(ei + 1) % a.pts.length], b.pts[ej], b.pts[(ej + 1) % b.pts.length]);
      if (!o) continue;
      const type = a.edges[ei] === 'crease' || b.edges[ej] === 'crease' ? 'crease' : 'fold';
      if (type === 'fold' && line) {
        const m = lerp(o.p0, o.p1, 0.5);
        const on = sideOf(line, o.p0) * ms > 1e-3 || sideOf(line, o.p1) * ms > 1e-3 || sideOf(line, m) * ms > 1e-3;
        if (!on) continue;
      }
      inSet.add(j); queue.push(j);
    }
  }
  return inSet;
}

export function resolveSelect(shapes, select, movingPt, line) {
  if (!select || select === 'all') return () => true;
  if (typeof select === 'function') return select;
  if (select === 'top') {
    const k = topShapeAt(shapes, movingPt);
    if (k < 0) return () => true;
    const ms = line ? (sideOf(line, movingPt) >= 0 ? 1 : -1) : 1;
    const set = flapAt(shapes, k, line, ms);
    return (s, i) => set.has(i);
  }
  if (typeof select === 'string') return (s) => s.tags.includes(select);
  if (Array.isArray(select)) return (s, i) => select.includes(i);
  return () => true;
}

// Split selected shapes along a line and rebuild links. Returns pieces (pre-move
// coordinates) with a `moved` flag for pieces on the moving side.
function splitAll(shapes, line, sel, ms, cutType, splitMode) {
  const out = [];
  const children = new Map(); // old pid -> [new pieces]
  shapes.forEach((s, i) => {
    if (!sel(s, i, shapes)) { const c = clone(s); c.links = new Map(); out.push({ s: c, moved: false, old: s }); children.set(s.pid, [c]); return; }
    const a = clipShape(s, line, -ms, cutType);
    const b = clipShape(s, line, ms, cutType);
    if (a && b) {
      markOnLine(a, line, cutType); markOnLine(b, line, cutType);
      link(a, b, line);
      out.push({ s: a, moved: false, old: s }, { s: b, moved: splitMode === 'fold', old: s });
      children.set(s.pid, [a, b]);
    } else {
      const c = clone(s);
      c.links = new Map();
      const onMoving = !a && !!b;
      if (onMoving) markOnLine(c, line, cutType);
      out.push({ s: c, moved: splitMode === 'fold' && onMoving, old: s });
      children.set(s.pid, [c]);
    }
  });
  // Inherit the parents' joints: a child keeps a joint where it still touches the neighbour's children on the same line.
  for (const o of out) {
    const old = o.old, n = old.pts.length;
    for (const [pid, { ei }] of old.links) {
      const kids = children.get(pid);
      if (!kids) continue;
      const jointLine = [old.pts[ei], old.pts[(ei + 1) % n]];
      if (dist(jointLine[0], jointLine[1]) < 1e-6) continue;
      for (const k of kids) if (!o.s.links.has(k.pid)) link(o.s, k, jointLine);
    }
  }
  return out;
}

// Fold the paper on `line`. `moving` is a point on the side that moves.
// mode 'valley' puts the moved flap on top, 'mountain' puts it behind.
export function fold(shapes, line, { moving, select, mode = 'valley', cutType = 'fold', tag, flip = true, keepOrder = false } = {}) {
  const ms = sideOf(line, moving) >= 0 ? 1 : -1;
  const sel = resolveSelect(shapes, select, moving, line);
  const pieces = splitAll(shapes, line, sel, ms, cutType, 'fold');
  const fixed = [], mov = [], movSrc = [];
  for (const o of pieces) {
    if (!o.moved) { fixed.push(o.s); continue; }
    movSrc.push(o.s);
    const r = reflectShape(o.s, line, flip);
    if (tag) r.tags.push(tag);
    mov.push(r);
  }
  const moved = keepOrder ? mov : mov.slice().reverse();
  const result = mode === 'valley' ? fixed.concat(moved) : moved.concat(fixed);
  return { shapes: result, anim: { type: 'fold', line, fixed, moving: movSrc, mode, cutType } };
}

// Split along a line without moving anything (a crease).
export function crease(shapes, line, { select, moving } = {}) {
  const sel = resolveSelect(shapes, select, moving || line[0], line);
  return splitAll(shapes, line, sel, 1, 'crease', 'crease').map((o) => o.s);
}

export function turnOver(shapes, axis = 50) {
  return shapes.slice().reverse().map((s) => ({
    ...s,
    pts: s.pts.map((p) => [2 * axis - p[0], p[1]]),
    edges: s.edges.slice(),
    face: s.face === 'front' ? 'back' : 'front',
    tags: s.tags.slice(),
    links: new Map(s.links),
  }));
}

export function transformAll(shapes, fn) {
  return shapes.map((s) => ({ ...s, pts: s.pts.map(fn), edges: s.edges.slice(), tags: s.tags.slice(), links: new Map(s.links) }));
}
export const rotateAll = (shapes, deg, c = [50, 50]) => transformAll(shapes, (p) => rot(p, deg, c));
export const translateAll = (shapes, d) => transformAll(shapes, (p) => add(p, d));
export const scaleAll = (shapes, k, c = [50, 50]) => transformAll(shapes, (p) => add(c, [(p[0] - c[0]) * k, (p[1] - c[1]) * k]));

export function allPoints(shapes) {
  const pts = [];
  for (const s of shapes) for (const p of s.pts) pts.push(p);
  return pts;
}

// The stretch of `line` that crosses the selected shapes.
export function lineSpan(shapes, line, select) {
  const d = norm(sub(line[1], line[0]));
  let t0 = Infinity, t1 = -Infinity;
  const sel = typeof select === 'function' ? select : () => true;
  shapes.forEach((s, i) => {
    if (!sel(s, i)) return;
    const n = s.pts.length;
    for (let k = 0; k < n; k++) {
      const a = s.pts[k], b = s.pts[(k + 1) % n];
      const sa = sideOf(line, a), sb = sideOf(line, b);
      const onA = Math.abs(sa) < 1e-6, onB = Math.abs(sb) < 1e-6;
      const hits = [];
      if (onA) hits.push(a);
      if (onB) hits.push(b);
      if (!onA && !onB && (sa > 0) !== (sb > 0)) hits.push(lerp(a, b, sa / (sa - sb)));
      for (const h of hits) { const t = dot(sub(h, line[0]), d); if (t < t0) t0 = t; if (t > t1) t1 = t; }
    }
  });
  if (t0 === Infinity) return null;
  return [add(line[0], [d[0] * t0, d[1] * t0]), add(line[0], [d[0] * t1, d[1] * t1])];
}

export function tagShapes(shapes, pred, tag) {
  return shapes.map((s, i) => { const c = clone(s); if (pred(s, i)) c.tags.push(tag); return c; });
}

export { EPS };
