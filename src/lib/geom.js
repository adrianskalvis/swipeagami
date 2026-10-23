// 2D helpers. Points are [x, y]. A line is [p, q], two points on it.
export const EPS = 1e-7;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, k) => [a[0] * k, a[1] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
export const len = (a) => Math.hypot(a[0], a[1]);
export const dist = (a, b) => len(sub(a, b));
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
export const perp = (a) => [-a[1], a[0]];
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const mid = (a, b) => lerp(a, b, 0.5);
export const eq = (a, b, e = 1e-4) => Math.abs(a[0] - b[0]) < e && Math.abs(a[1] - b[1]) < e;
export const rnd = (v) => Math.round(v * 1000) / 1000;

export function rot(p, deg, c = [0, 0]) {
  const r = (deg * Math.PI) / 180, s = Math.sin(r), co = Math.cos(r);
  const d = sub(p, c);
  return [c[0] + d[0] * co - d[1] * s, c[1] + d[0] * s + d[1] * co];
}

// Signed distance of p from the line (positive on the left of p->q).
export function sideOf(line, p) {
  const d = sub(line[1], line[0]);
  return cross(d, sub(p, line[0])) / (len(d) || 1);
}
export function footOf(line, p) {
  const d = norm(sub(line[1], line[0]));
  return add(line[0], mul(d, dot(sub(p, line[0]), d)));
}
export function reflect(line, p) {
  return sub(mul(footOf(line, p), 2), p);
}
// Perpendicular bisector of p and q: folding on it lands p on q.
export function bisector(p, q) {
  const m = mid(p, q);
  return [m, add(m, perp(sub(q, p)))];
}
export function lineFrom(p, dir) { return [p, add(p, dir)]; }
export function lineAngle(p, deg) { return [p, add(p, [Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180)])]; }
export function intersect(l1, l2) {
  const p = l1[0], r = sub(l1[1], l1[0]), q = l2[0], s = sub(l2[1], l2[0]);
  const den = cross(r, s);
  if (Math.abs(den) < EPS) return null;
  const t = cross(sub(q, p), s) / den;
  return add(p, mul(r, t));
}
export function area(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) a += cross(pts[i], pts[(i + 1) % pts.length]);
  return a / 2;
}
export function centroid(pts) {
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
}
export function bbox(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}
export function pointInPoly(p, pts, tol = 1e-4) {
  // Winding-free test for convex or concave polygons, with tolerance on edges.
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    // On edge?
    const d = sub(b, a), l = len(d);
    if (l > EPS) {
      const t = dot(sub(p, a), d) / (l * l);
      if (t >= -1e-6 && t <= 1 + 1e-6) {
        const q = add(a, mul(d, t));
        if (dist(q, p) < tol) return true;
      }
    }
    if ((a[1] > p[1]) !== (b[1] > p[1])) {
      const x = a[0] + ((p[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
      if (p[0] < x) inside = !inside;
    }
  }
  return inside;
}
// Clip a plain polygon to the half-plane keep*side >= 0.
export function clipPoly(pts, line, keep) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const sa = sideOf(line, a) * keep, sb = sideOf(line, b) * keep;
    const ain = sa >= -1e-6, bin = sb >= -1e-6;
    if (ain && bin) out.push(b);
    else if (ain && !bin) out.push(lerp(a, b, sa / (sa - sb)));
    else if (!ain && bin) { out.push(lerp(a, b, sa / (sa - sb))); out.push(b); }
  }
  return out.length >= 3 ? out : null;
}
// Overlap area of two convex polygons.
export function overlapArea(a, b) {
  let p = a;
  const n = b.length;
  const sign = area(b) >= 0 ? 1 : -1;
  for (let i = 0; i < n && p; i++) p = clipPoly(p, [b[i], b[(i + 1) % n]], sign);
  return p ? Math.abs(area(p)) : 0;
}
export function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const lower = [];
  for (const p of pts) { while (lower.length >= 2 && cross(sub(lower[lower.length - 1], lower[lower.length - 2]), sub(p, lower[lower.length - 2])) <= 0) lower.pop(); lower.push(p); }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (upper.length >= 2 && cross(sub(upper[upper.length - 1], upper[upper.length - 2]), sub(p, upper[upper.length - 2])) <= 0) upper.pop(); upper.push(p); }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}
// Are two segments collinear and overlapping (sharing a stretch)?
export function segmentsShare(a1, a2, b1, b2, tol = 1e-3) {
  const line = [a1, a2];
  if (dist(a1, a2) < EPS) return false;
  if (Math.abs(sideOf(line, b1)) > tol || Math.abs(sideOf(line, b2)) > tol) return false;
  const d = norm(sub(a2, a1));
  const t0 = 0, t1 = dot(sub(a2, a1), d);
  let u0 = dot(sub(b1, a1), d), u1 = dot(sub(b2, a1), d);
  if (u0 > u1) [u0, u1] = [u1, u0];
  return Math.min(t1, u1) - Math.max(t0, u0) > tol * 10;
}
