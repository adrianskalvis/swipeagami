// Traditional swan from the kite base.
// Sequence checked against the brief and two public sources (see README credits).
import { builder, angleBisector } from '../lib/builder.js';
import { diamond, shape } from '../lib/shapes.js';
import { intersect, rot, add, mul, perp, norm, sub } from '../lib/geom.js';

export default function swan() {
  const b = builder({ id: 'swan', name: 'Swan', level: 1, base: 'kite', minPaperCm: 7, finishedSizeRatio: 0.62, sizeWord: 'long', start: diamond('back') });
  const T = [50, 0], R = [100, 50], B = [50, 100], L = [0, 50];

  b.start('Start colored side down, as a diamond.');
  b.crease({ from: L, to: R }, { text: 'Fold in half, corner to corner. Unfold.' });

  // Kite: lower edges to the center crease.
  const l1 = angleBisector(B, L, T), r1 = angleBisector(B, R, T);
  b.valley([{ line: l1, moving: L }, { line: r1, moving: R }], { text: 'Fold the lower edges to the center crease.' });
  b.turnOver('Turn over.');

  // Second kite fold from the same bottom point.
  const KL = intersect(l1, [L, T]), KR = intersect(r1, [R, T]);
  const l2 = angleBisector(B, KL, T), r2 = angleBisector(B, KR, T);
  b.valley([{ line: l2, moving: KL }, { line: r2, moving: KR }], { text: 'Fold the lower edges to the center again.' });

  // Neck up, head down.
  b.valley({ from: B, to: T, tag: 'neck' }, { text: 'Fold the bottom point up to the top point.' });
  const headLen = 13;
  b.valley({ line: [[0, headLen], [100, headLen]], moving: T, select: 'neck', arrows: [[T, [50, headLen * 2]]], bend: 0.5 }, { text: 'Fold the tip down a little. This is the head.' });

  // Fold in half, sides going back, then view from the side.
  const W = intersect(l2, [KL, T]);
  const WR = [100 - W[0], W[1]];
  b.mountain({ line: [T, B], moving: [70, 20], arrows: [[WR, W]], bend: 0.6 }, {
    text: 'Mountain-fold in half. The sides go back.',
    symbols: [{ t: 'rotate', at: [80, 72], deg: -90 }],
  });

  // ---- Side view (hand-authored 3D steps) ------------------------------
  // The flat model turned so the spine is horizontal and the swan faces right.
  const R90 = (p) => rot(p, -90, [50, 50]);
  // Kite edge at the neck crease (y = 50 in the flat frame).
  const tEdge = (50 - W[1]) / (B[1] - W[1]);
  const edgeX = W[0] + (B[0] - W[0]) * tEdge; // about 40
  const depth = 50 - edgeX; // body depth at the breast
  const body = shape([R90(T), R90(W), R90([edgeX, 50]), R90([50, 50])], 'front', ['body'], ['fold', 'edge', 'edge', 'fold']);
  // Small white "shoulder" triangle seen on the side of the body.
  const C2 = [50, 100 - Math.hypot(50 - KL[0], 100 - KL[1])];
  const shoulder = shape([R90(W), R90(C2), R90([W[0] + (B[0] - W[0]) * ((29 - W[1]) / (B[1] - W[1])), 29])], 'back', ['shoulder'], ['edge', 'edge', 'edge']);
  // Neck: thin triangle along the spine, base at the breast.
  const base1 = [50, 50], base2 = [50, 50 + depth], tipFlat = [0, 50];
  const pivot = [50, 50 + depth / 2];
  const neck = (deg) => shape([base1, base2, tipFlat].map((p) => rot(p, deg, pivot)), 'front', ['neck'], ['fold', 'edge', 'edge']);
  const hw = (headLen / 50) * depth * 1.5; // head width, slightly exaggerated for readability
  // Head flap: a thin triangle at the neck tip, pointing along `dir`.
  const headAt = (tip, dir, side = 1) => {
    const d = norm(dir), n = mul(perp(d), side);
    return shape([tip, add(tip, mul(n, hw)), add(tip, mul(d, headLen))], 'front', ['head'], ['fold', 'edge', 'edge']);
  };
  const neckDir = (deg) => norm(sub(rot(tipFlat, deg, pivot), rot(base1, deg, pivot)));
  const headBack = (deg) => { const tip = rot(tipFlat, deg, pivot); return headAt(tip, mul(neckDir(deg), -1), 1); };
  const F0 = [body, shoulder, neck(0), headBack(0)];
  const F1 = [body, shoulder, neck(55), headBack(55)];
  const F2 = [body, shoulder, neck(110), headBack(110)];
  const tip2 = rot(tipFlat, 110, pivot);
  b.custom({
    text: 'Pull the neck up. Pinch the base to hold it.',
    shapes: F0,
    next: F2,
    frames: [F0, F1, F2],
    tricky: true,
    symbols: [
      { t: 'mountain', seg: [base1, base2] },
      { t: 'arrow', from: [6, 44], to: [tip2[0] - 4, tip2[1] + 4], bend: -0.3, kind: 'valley' },
    ],
    minView: 100,
  });
  // Head forward: the flap swings from along the neck to pointing forward and down.
  const G0 = [body, shoulder, neck(110), headBack(110)];
  const G1 = [body, shoulder, neck(110), headAt(tip2, neckDir(110), -1)];
  const G2 = [body, shoulder, neck(110), headAt(tip2, [Math.cos(0.45), Math.sin(0.45)], -1)];
  b.custom({
    text: 'Pull the head forward a little.',
    shapes: G0,
    next: G2,
    frames: [G0, G1, G2],
    tricky: true,
    symbols: [
      { t: 'arrow', from: [tip2[0] - 9, tip2[1] + 12], to: [tip2[0] + 12, tip2[1] + 6], bend: -0.45, kind: 'valley', tail: 'push' },
    ],
    minView: 100,
  });
  b.finish('The finished swan.', { minView: 100 });
  return b;
}
