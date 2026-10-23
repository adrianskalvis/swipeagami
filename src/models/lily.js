// Traditional lily (iris) from the frog base. Sources: origami-fun.com/origami-lily.html, origami.me/lily/.
import { builder } from '../lib/builder.js';
import { diamond, shape } from '../lib/shapes.js';
import { creasedForSquareBase, birdBase, petalFront, PB } from './birdbase.js';
import { angleBisector } from '../lib/builder.js';

export default function lily() {
  const b = builder({ id: 'lily', name: 'Lily', level: 4, base: 'frog', minPaperCm: 12, finishedSizeRatio: 0.4, sizeWord: 'tall', start: diamond('front') });
  creasedForSquareBase(b);
  birdBase(b);
  const { T, B } = PB;
  const spine = [T, B];
  const onRight = (s) => s.pts.every((p) => p[0] >= 49.99), onLeft = (s) => s.pts.every((p) => p[0] <= 50.01);
  const has = (tags) => (s) => s.tags.some((t) => tags.includes(t));
  // Turn two pages: the front-right pages go left, the back-left pages go right behind.
  b.valley({ line: spine, moving: [60, 50], select: (s) => has(['f1', 'r2'])(s) && onRight(s), arrows: [[[62, 50], [38, 50]]], bend: 0.35 }, { text: 'Turn the two front-right flaps to the left, like pages.' });
  b.mountain({ line: spine, moving: [40, 50], select: (s) => has(['b4', 'l3'])(s) && onLeft(s), arrows: [[[38, 52], [62, 52]]], bend: 0.5 }, { text: 'Turn the two back-left flaps to the right, behind.' });
  // Petal fold the two remaining arms.
  petalFront(b, { leftTags: [], rightTags: [], frontTags: ['r2', 'r3'], text: 'Crease the edges to the center and the top down.' });
  b.turnOver('Turn over.');
  petalFront(b, { leftTags: [], rightTags: [], frontTags: ['l2', 'l3'], text: 'Crease the edges to the center and the top down.' });
  // Fold the small top triangles down, front and back.
  const hingeY = 39.64;
  b.valley({ line: [[0, 22], [100, 22]], moving: [50, 6], select: 'top', arrows: [[[50, 6], [50, 36]]], bend: 0.4 }, { text: 'Fold the front top point down.' });
  b.mountain({ line: [[0, 22], [100, 22]], moving: [50, 6], select: 'top', arrows: [[[50, 6], [50, 36]]], bend: 0.5 }, { text: 'Fold the back top point down behind.' });
  // Upside down: the long points are the petals.
  const upright = b.state;
  const flipped = b.rotate(180, [50, 50]).state;
  b.custom({ text: 'Turn the model upside down. The long points are the petals.', symbols: [{ t: 'rotate', at: [82, 50], deg: 180 }], next: flipped, anim: null, shapes: upright });
  void hingeY;
  // Narrow the petals: lower edges of the front to the center line, repeat behind.
  const tip = [50, 100 - B[1]];
  const SL = [35.36, 100 - 39.64], SR = [64.64, 100 - 39.64];
  const nl = (sign) => angleBisector(tip, sign < 0 ? SL : SR, [50, 100]);
  b.valley([{ line: nl(-1), moving: SL, select: 'top', bend: 0.3 }, { line: nl(1), moving: SR, select: 'top', bend: 0.3 }], { text: 'Fold the upper edges of the front petal in to the center.' });
  b.turnOver('Turn over.');
  b.valley([{ line: nl(-1), moving: SL, select: 'top', bend: 0.3 }, { line: nl(1), moving: SR, select: 'top', bend: 0.3 }], { text: 'Fold these upper edges in to the center too.' });
  // Open the flower: hand-authored view with four petals curling out.
  const flat = b.state;
  const E = ['edge', 'edge', 'edge'];
  const stem = shape([[44, 95], [56, 95], [50, 70]], 'frontDark', ['base'], E);
  const petal = (ang, k) => {
    const a = (ang * Math.PI) / 180;
    const len = 34 + 6 * k, spread = 10 + 16 * k;
    const dx = Math.cos(a), dy = Math.sin(a);
    const px = -dy, py = dx;
    const base = [50, 72];
    return shape([base, [base[0] + dx * len + px * spread, base[1] + dy * len + py * spread], [base[0] + dx * (len + 10 * k), base[1] + dy * (len + 10 * k)], [base[0] + dx * len - px * spread, base[1] + dy * len - py * spread]], 'front', ['petal'], ['fold', 'edge', 'edge', 'edge']);
  };
  const frame = (k) => [stem, petal(-150, k), petal(-30, k), petal(-110, k), petal(-70, k)];
  const L0 = frame(0), L1 = frame(1);
  b.custom({ text: 'Open the petals and curl each one down over a pencil.', shapes: flat, next: L1, frames: [L0, L1], tricky: true, symbols: [{ t: 'arrow', from: [40, 40], to: [14, 50], bend: 0.3 }, { t: 'arrow', from: [60, 40], to: [86, 50], bend: -0.3 }], minView: 100 });
  b.finish('The finished lily.', { minView: 100 });
  return b;
}
