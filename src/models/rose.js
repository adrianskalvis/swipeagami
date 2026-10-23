// Rose with a twist fold, simplified after the Kawasaki rose (Toshikazu Kawasaki).
// Sources: Winson Chan's Kawasaki rose diagram (1996), en.wikipedia.org/wiki/Kawasaki_rose.
import { builder } from '../lib/builder.js';
import { square, shape } from '../lib/shapes.js';
import { rot } from '../lib/geom.js';

export default function rose() {
  const b = builder({ id: 'rose', name: 'Rose', level: 5, base: 'twist', minPaperCm: 15, finishedSizeRatio: 0.3, sizeWord: 'across', start: square('back'), credit: 'Simplified from the Kawasaki rose by Toshikazu Kawasaki.' });
  b.start('Start colored side down.', { credit: 'After the Kawasaki rose by Toshikazu Kawasaki, simplified.' });
  b.crease([{ from: [0, 50], to: [100, 50], arrow: false }, { from: [50, 0], to: [50, 100], arrows: [[[50, 2], [50, 98]]] }], { text: 'Fold in half both ways. Unfold each.' });
  b.crease([{ from: [0, 50], to: [50, 50], arrows: [[[2, 50], [48, 50]]] }, { from: [100, 50], to: [50, 50], arrows: [[[98, 50], [52, 50]]] }], { text: 'Fold the left and right edges to the center. Unfold.' });
  b.crease([{ from: [50, 0], to: [50, 50], arrows: [[[50, 2], [50, 48]]] }, { from: [50, 100], to: [50, 50], arrows: [[[50, 98], [50, 52]]] }], { text: 'Fold the top and bottom edges to the center. Unfold.' });
  b.turnOver('Turn over.');
  b.crease([{ from: [0, 0], to: [100, 100], arrow: false }, { from: [100, 0], to: [0, 100], arrows: [[[98, 2], [2, 98]]] }], { text: 'Fold both diagonals. Unfold each.' });
  // Twist: the center square turns while the four sides pleat in (hand keyframes).
  const pre = b.state;
  const E4 = ['fold', 'fold', 'fold', 'fold'];
  const center = (k) => shape([[37.5, 37.5], [62.5, 37.5], [62.5, 62.5], [37.5, 62.5]].map((p) => rot(p, 45 * k, [50, 50])).map((p) => [50 + (p[0] - 50) * (1 - 0.15 * k), 50 + (p[1] - 50) * (1 - 0.15 * k)]), 'front', ['center'], E4);
  const wing = (ang, k) => {
    // One of the four outer quadrants, pulled in and rotated as the twist closes.
    const base = [[0, 0], [100, 0], [100, 37.5], [62.5, 37.5], [37.5, 37.5], [0, 37.5]];
    const closed = [[22, 22], [78, 22], [78, 34], [62, 34], [38, 34], [22, 34]];
    const pts = base.map((p, i) => { const q = closed[i]; return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]; }).map((p) => rot(p, ang + 40 * Math.sin(k * Math.PI), [50, 50]));
    return shape(pts, 'front', ['wing'], ['edge', 'edge', 'fold', 'fold', 'fold', 'fold']);
  };
  const frame = (k) => [wing(0, k), wing(90, k), wing(180, k), wing(270, k), center(k)];
  const R0 = frame(0), R1 = frame(0.5), R2 = frame(1);
  b.custom({
    text: 'Twist the center square clockwise. The sides pleat in.',
    shapes: pre,
    next: R2,
    frames: [R0, R1, R2],
    tricky: true,
    symbols: [{ t: 'mountain', seg: [[37.5, 37.5], [62.5, 37.5]] }, { t: 'mountain', seg: [[62.5, 37.5], [62.5, 62.5]] }, { t: 'mountain', seg: [[62.5, 62.5], [37.5, 62.5]] }, { t: 'mountain', seg: [[37.5, 62.5], [37.5, 37.5]] }, { t: 'rotate', at: [50, 50], deg: 45 }, { t: 'arrow', from: [-6, 50], to: [20, 50], bend: 0, tail: 'push' }, { t: 'arrow', from: [106, 50], to: [80, 50], bend: 0, tail: 'push' }],
    minView: 100,
  });
  // Shape the base: fold the four outer corners behind.
  b.mountain([
    { line: [[22, 34], [34, 22]], moving: [22, 22], arrow: false },
    { line: [[66, 22], [78, 34]], moving: [78, 22], arrow: false },
    { line: [[78, 66], [66, 78]], moving: [78, 78], arrow: false },
    { line: [[34, 78], [22, 66]], moving: [22, 78], arrows: [[[23, 77], [31, 69]]], bend: 0.3 },
  ], { text: 'Fold the four corners behind to round the base.' });
  b.turnOver('Turn over. The petals face up.');
  // Curl the petals: the four outer wings roll outward.
  const flatRose = b.state;
  const E = ['edge', 'edge', 'edge', 'edge'];
  const petal = (ang, k) => shape([[50, 50], [62 + 10 * k, 24 - 6 * k], [50 + 8 * k, 14 - 8 * k], [38 - 10 * k, 24 - 6 * k]].map((p) => rot(p, ang, [50, 50])), 'front', ['petal'], E);
  const inner = (k) => shape([[50, 38 - 4 * k], [62 + 4 * k, 50], [50, 62 + 4 * k], [38 - 4 * k, 50]], 'frontDark', ['heart'], E);
  const P0 = [petal(0, 0), petal(90, 0), petal(180, 0), petal(270, 0), inner(0)];
  const P1 = [petal(0, 1), petal(90, 1), petal(180, 1), petal(270, 1), inner(1)];
  b.custom({
    text: 'Curl each petal outward over a pencil.',
    shapes: flatRose,
    next: P1,
    frames: [P0, P1],
    tricky: true,
    symbols: [{ t: 'arrow', from: [50, 22], to: [50, 4], bend: 0.3 }, { t: 'arrow', from: [78, 50], to: [96, 50], bend: 0.3 }],
    minView: 100,
  });
  b.finish('The finished rose.', { minView: 100, credit: 'After the Kawasaki rose, by Toshikazu Kawasaki.' });
  return b;
}
