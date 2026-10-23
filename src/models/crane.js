// Traditional crane. Sources: origami-fun.com/origami-crane.html, origami.me/crane/.
import { builder, angleBisector } from '../lib/builder.js';
import { diamond, shape } from '../lib/shapes.js';
import { creasedForSquareBase, birdBase, PB } from './birdbase.js';
import { lineAngle, reflect, norm, sub, add, mul, dist } from '../lib/geom.js';

export function cranePart(b, { narrow }) {
  const { B } = PB;
  // Legs: the two bottom points. Neck on the left, tail on the right.
  if (narrow) {
    const hingeY = 39.64;
    const SL = [35.36, hingeY], SR = [64.64, hingeY];
    // Lower edges of the legs to the center line: the leg layers only, the petal flap stays.
    const nl = (sign) => angleBisector(B, sign < 0 ? SL : SR, [50, 0]);
    const has = (tags) => (s) => s.tags.some((t) => tags.includes(t));
    b.valley([{ line: nl(-1), moving: SL, select: has(['r3']), bend: 0.3 }, { line: nl(1), moving: SR, select: has(['l3']), bend: 0.3 }], { text: 'Fold the lower edges of the front to the center line.' });
    b.turnOver('Turn over.');
    b.valley([{ line: nl(-1), moving: SL, select: has(['l2']), bend: 0.3 }, { line: nl(1), moving: SR, select: has(['r2']), bend: 0.3 }], { text: 'Fold these lower edges to the center line too.' });
  }
  // Inside reverse folds: each leg swings up and out between the layers.
  const legSel = (side) => (s) => s.tags.some((t) => (side < 0 ? ['l2', 'l3'] : ['r2', 'r3']).includes(t)) && (side < 0 ? s.pts.every((p) => p[0] <= 50.01) : s.pts.every((p) => p[0] >= 49.99));
  const bendL = [46, 47], bendR = [54, 47];
  const revL = lineAngle(bendL, -15), revR = lineAngle(bendR, 195);
  const neckTip = reflect(revL, B), tailTip = reflect(revR, B);
  b.valley({ line: revL, moving: B, select: legSel(-1), reverse: true, arrows: [[[49, 72], [neckTip[0] + 1, neckTip[1] + 3]]], bend: 0.3, tail: 'push' }, { text: 'Inside reverse fold the left point up. This is the neck.', tricky: true, symbols: [{ t: 'mountain', seg: [[43.5, 47.7], [50, 46]] }] });
  b.valley({ line: revR, moving: B, select: legSel(1), reverse: true, arrows: [[[51, 72], [tailTip[0] - 1, tailTip[1] + 3]]], bend: -0.3, tail: 'push' }, { text: 'Inside reverse fold the right point up. This is the tail.', tricky: true, symbols: [{ t: 'mountain', seg: [[50, 46], [56.5, 47.7]] }] });
  // Head: reverse fold the last part of the neck so it points forward.
  const nd = norm(sub(neckTip, bendL));
  const P = add(neckTip, mul(nd, -9));
  const headLine = lineAngle(P, 20);
  const headTip = reflect(headLine, neckTip);
  b.valley({ line: headLine, moving: neckTip, select: (s) => legSel(-1)(s) && s.pts.some((p) => dist(p, neckTip) < 12), reverse: true, arrows: [[neckTip, headTip]], bend: -0.4, tail: 'push' }, { text: 'Inside reverse fold the tip of the neck for the head.', tricky: true });
}

export default function crane() {
  const b = builder({ id: 'crane', name: 'Crane', level: 4, base: 'bird', minPaperCm: 10, finishedSizeRatio: 0.5, sizeWord: 'long', start: diamond('front') });
  creasedForSquareBase(b);
  birdBase(b);
  cranePart(b, { narrow: true });
  // Wings down: the front petal folds down over the body, the back one behind.
  const hingeY = 39.64;
  b.valley({ line: [[0, hingeY], [100, hingeY]], moving: [50, 10], select: 'top', arrows: [[[50, 8], [50, 70]]], bend: 0.4 }, { text: 'Fold the front wing down.' });
  b.mountain({ line: [[0, hingeY], [100, hingeY]], moving: [50, 10], select: 'top', arrows: [[[50, 8], [50, 70]]], bend: 0.5 }, { text: 'Fold the back wing down behind.' });
  // Open out: a hand-drawn view with the wings spread.
  const flat = b.state;
  const E = ['edge', 'edge', 'edge'];
  const body = shape([[36, 44], [64, 44], [50, 72]], 'front', ['body'], E);
  const wingL = shape([[36, 44], [50, 56], [4, 40]], 'front', ['wing'], E);
  const wingR = shape([[64, 44], [50, 56], [96, 40]], 'front', ['wing'], E);
  const neck = shape([[36, 44], [42, 54], [24, 14]], 'front', ['neck'], E);
  const head = shape([[24, 14], [27, 20], [14, 20]], 'front', ['head'], E);
  const tail = shape([[64, 44], [58, 54], [78, 14]], 'front', ['tail'], E);
  const open = [tail, neck, head, wingL, wingR, body];
  const closed = [shape([[64, 44], [58, 54], [78, 14]], 'front', ['tail'], E), neck, head, shape([[36, 44], [50, 56], [42, 66]], 'front', ['wing'], E), shape([[64, 44], [50, 56], [58, 66]], 'front', ['wing'], E), body];
  b.custom({ text: 'Gently pull the wings apart and open the body.', shapes: flat, next: open, frames: [closed, open], tricky: true, symbols: [{ t: 'arrow', from: [40, 60], to: [10, 42], bend: 0.3 }, { t: 'arrow', from: [60, 60], to: [90, 42], bend: -0.3 }], minView: 100 });
  b.finish('The finished crane.', { minView: 100 });
  return b;
}
