// Shared bases: precreased paper, collapse keyframes and the flat base layering.
// Faces follow the physical fold directions (see README, "How the diagrams are computed").
import { shape, square, diamond, linkAll } from '../lib/shapes.js';

const tri = (pts, face, tags, edges) => shape(pts, face, tags, edges);

// ---- Preliminary (square) base, diamond frame -----------------------------
// Paper: diamond with corners C3 top (50,0), C2 right, C1 bottom, C4 left. O = (50,50).
// Base: diamond T=(50,25) B=(50,75) L=(25,50) R=(75,50). Corners meet at B.
export const PB = { T: [50, 25], B: [50, 75], L: [25, 50], R: [75, 50] };

export function prelimBase() {
  const { T, B, L, R } = PB;
  const left = (face, tags) => tri([T, L, B], face, tags, ['fold', 'edge', 'fold']);
  const right = (face, tags) => tri([T, R, B], face, tags, ['fold', 'edge', 'fold']);
  // z-order bottom to top: back layer, side flaps (2 layers), front layer.
  const sh = [left('back', ['b4', 'back']), right('back', ['b4', 'back']), left('front', ['l3', 'side']), right('front', ['r3', 'side']), left('back', ['l2', 'side']), right('back', ['r2', 'side']), left('front', ['f1', 'front']), right('front', ['f1', 'front'])];
  // Physical joins: back pair along the spine, sides to back along T-L/T-R, side halves along the spine, front to sides along T-L/T-R, front pair along the spine.
  const sp = [T, B], tl = [T, L], tr = [T, R];
  return linkAll(sh, [[0, 1, sp], [0, 2, tl], [1, 3, tr], [2, 4, sp], [3, 5, sp], [4, 6, tl], [5, 7, tr], [6, 7, sp]]);
}

export function prelimCollapseFrames() {
  const O = [50, 50], C1 = [50, 100], C2 = [100, 50], C3 = [50, 0], C4 = [0, 50];
  const M1 = [25, 75], M2 = [75, 75], M3 = [75, 25], M4 = [25, 25];
  const { T, B, L, R } = PB;
  const e = ['crease', 'edge', 'crease'];
  // Paper triangles in the same order as prelimBase().
  const F0 = [
    tri([O, M4, C3], 'front', ['b4'], e), tri([O, M3, C3], 'front', ['b4'], e),
    tri([O, M4, C4], 'front', ['l3'], e), tri([O, M3, C2], 'front', ['r3'], e),
    tri([O, M1, C4], 'front', ['l2'], e), tri([O, M2, C2], 'front', ['r2'], e),
    tri([O, M1, C1], 'front', ['f1'], e), tri([O, M2, C1], 'front', ['f1'], e),
  ];
  const mid = (a, b, k = 0.5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  // Half way: corners drawn toward the bottom, midpoints toward the sides.
  const F1 = [
    tri([O, mid(M4, L), mid(C3, B)], 'front', ['b4'], e), tri([O, mid(M3, R), mid(C3, B)], 'front', ['b4'], e),
    tri([O, mid(M4, L), mid(C4, B)], 'front', ['l3'], e), tri([O, mid(M3, R), mid(C2, B)], 'front', ['r3'], e),
    tri([O, mid(M1, L), mid(C4, B)], 'front', ['l2'], e), tri([O, mid(M2, R), mid(C2, B)], 'front', ['r2'], e),
    tri([O, mid(M1, L), mid(C1, B)], 'front', ['f1'], e), tri([O, mid(M2, R), mid(C1, B)], 'front', ['f1'], e),
  ];
  const F2 = prelimBase().map((s) => ({ ...s, pts: s.pts.map((p) => [p[0], p[1]]) }));
  // Frames must share point order: base triangles are [T, L/R, B] = [O, M, C].
  return [F0, F1, F2];
}

// ---- Waterbomb base, square frame ----------------------------------------
// Paper: square (0,0)-(100,100). Base: triangle apex A=(50,25), corners (0,75) and (100,75), M=(50,75).
export const WB = { A: [50, 25], CL: [0, 75], CR: [100, 75], M: [50, 75] };

export function waterbombBase() {
  const { A, CL, CR, M } = WB;
  const left = (face, tags) => tri([A, M, CL], face, tags, ['fold', 'edge', 'fold']);
  const right = (face, tags) => tri([A, M, CR], face, tags, ['fold', 'edge', 'fold']);
  // Bottom to top: back flaps (2 layers each side), then front flaps (2 layers each side).
  const sh = [left('back', ['l4', 'back']), right('back', ['r4', 'back']), left('front', ['l3', 'back']), right('front', ['r3', 'back']), left('back', ['l2', 'front']), right('back', ['r2', 'front']), left('front', ['l1', 'front']), right('front', ['r1', 'front'])];
  // Joins: back pair at the spine, l4-l3 at the outer edge, l3-l2 at the spine, l2-l1 at the outer edge, front pair at the spine.
  const sp = [A, M], ol = [A, CL], or = [A, CR];
  return linkAll(sh, [[0, 1, sp], [0, 2, ol], [1, 3, or], [2, 4, sp], [3, 5, sp], [4, 6, ol], [5, 7, or], [6, 7, sp]]);
}

export function waterbombCollapseFrames() {
  const O = [50, 50], Ctl = [0, 0], Ctr = [100, 0], Cbl = [0, 100], Cbr = [100, 100];
  const Mt = [50, 0], Mb = [50, 100], Ml = [0, 50], Mr = [100, 50];
  const e = ['crease', 'edge', 'crease'];
  const F0 = [
    tri([O, Mt, Ctl], 'back', ['l4'], e), tri([O, Mt, Ctr], 'back', ['r4'], e),
    tri([O, Ml, Ctl], 'back', ['l3'], e), tri([O, Mr, Ctr], 'back', ['r3'], e),
    tri([O, Ml, Cbl], 'back', ['l2'], e), tri([O, Mr, Cbr], 'back', ['r2'], e),
    tri([O, Mb, Cbl], 'back', ['l1'], e), tri([O, Mb, Cbr], 'back', ['r1'], e),
  ];
  const F1 = [
    tri([[50, 40], [50, 70], [12, 76]], 'back', ['l4'], e), tri([[50, 40], [50, 70], [88, 76]], 'back', ['r4'], e),
    tri([[50, 40], [28, 84], [12, 76]], 'back', ['l3'], e), tri([[50, 40], [72, 84], [88, 76]], 'back', ['r3'], e),
    tri([[50, 40], [28, 84], [10, 92]], 'back', ['l2'], e), tri([[50, 40], [72, 84], [90, 92]], 'back', ['r2'], e),
    tri([[50, 40], [50, 96], [10, 92]], 'back', ['l1'], e), tri([[50, 40], [50, 96], [90, 92]], 'back', ['r1'], e),
  ];
  const F2 = waterbombBase();
  return [F0, F1, F2];
}

export { square, diamond, shape };
