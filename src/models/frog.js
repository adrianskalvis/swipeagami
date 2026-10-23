// Traditional jumping frog from a rectangle. Sources: origami-fun.com/origami-jumping-frog.html, origami.me/jumping-frog/.
import { builder } from '../lib/builder.js';
import { shape, linkAll } from '../lib/shapes.js';

export default function frog() {
  // Rectangle 2:1, portrait, x 25..75. Top square is y 0..50.
  const start = [shape([[25, 0], [75, 0], [75, 100], [25, 100]], 'back', ['body'])];
  const b = builder({ id: 'frog', name: 'Jumping frog', level: 2, base: 'waterbomb', minPaperCm: 7.5, finishedSizeRatio: 0.45, sizeWord: 'long', startsFromRect: true, start });
  b.start('Start with the rectangle, colored side down.');
  b.crease([{ from: [25, 0], to: [75, 50], arrow: false }, { from: [75, 0], to: [25, 50], arrows: [[[73, 2], [27, 48]]] }], { text: 'Fold the top corners to the opposite edges. Unfold each.' });
  b.crease({ from: [50, 0], to: [50, 50], arrows: [[[50, 2], [50, 48]]], bend: 0.5 }, { text: 'Fold the top edge behind, down to the middle. Unfold.', mode: 'mountain' });
  // Collapse the top square into a triangle. The corners fold toward you, so the colored side ends up outside.
  const O = [50, 25], Ctl = [25, 0], Ctr = [75, 0], Cbl = [25, 50], Cbr = [75, 50], Mt = [50, 0], Mb = [50, 50], Ml = [25, 25], Mr = [75, 25];
  const e = ['crease', 'edge', 'crease'];
  const tri = (pts, face, tags, edges) => shape(pts, face, tags, edges || e);
  const bodyRect = shape([[25, 50], [75, 50], [75, 100], [25, 100]], 'back', ['body'], ['crease', 'edge', 'edge', 'edge']);
  const F0 = [
    bodyRect,
    tri([O, Mb, Cbl], 'back', ['l1']), tri([O, Mb, Cbr], 'back', ['r1']),
    tri([O, Ml, Cbl], 'back', ['l2']), tri([O, Mr, Cbr], 'back', ['r2']),
    tri([O, Ml, Ctl], 'back', ['l3']), tri([O, Mr, Ctr], 'back', ['r3']),
    tri([O, Mt, Ctl], 'back', ['l4']), tri([O, Mt, Ctr], 'back', ['r4']),
  ];
  const A = [50, 25], M = [50, 50];
  const fl = (face, tags, edges) => tri([A, M, Cbl], face, tags, edges);
  const fr = (face, tags, edges) => tri([A, M, Cbr], face, tags, edges);
  // Mirror of the standard waterbomb layering: top-corner flaps land in front.
  const F2 = linkAll([
    bodyRect,
    fl('back', ['l1'], ['fold', 'crease', 'fold']), fr('back', ['r1'], ['fold', 'crease', 'fold']),
    fl('front', ['l2'], ['fold', 'edge', 'fold']), fr('front', ['r2'], ['fold', 'edge', 'fold']),
    fl('back', ['l3'], ['fold', 'edge', 'fold']), fr('back', ['r3'], ['fold', 'edge', 'fold']),
    fl('front', ['l4', 'leg'], ['fold', 'edge', 'fold']), fr('front', ['r4', 'leg'], ['fold', 'edge', 'fold']),
  ], [[0, 1, [[25, 50], [75, 50]]], [0, 2, [[25, 50], [75, 50]]], [1, 2, [A, M]], [1, 3, [A, Cbl]], [2, 4, [A, Cbr]], [3, 5, [A, M]], [4, 6, [A, M]], [5, 7, [A, Cbl]], [6, 8, [A, Cbr]], [7, 8, [A, M]]]);
  const F1 = [
    bodyRect,
    tri([[50, 30], [50, 50], [27, 50]], 'back', ['l1']), tri([[50, 30], [50, 50], [73, 50]], 'back', ['r1']),
    tri([[50, 30], [36, 44], [27, 50]], 'back', ['l2']), tri([[50, 30], [64, 44], [73, 50]], 'back', ['r2']),
    tri([[50, 30], [36, 44], [34, 38]], 'back', ['l3']), tri([[50, 30], [64, 44], [66, 38]], 'back', ['r3']),
    tri([[50, 30], [50, 42], [34, 38]], 'back', ['l4']), tri([[50, 30], [50, 42], [66, 38]], 'back', ['r4']),
  ];
  b.custom({
    text: 'Push the sides in. The top corners fold down to the sides.',
    shapes: F0,
    next: F2,
    frames: [F0, F1, F2],
    tricky: true,
    symbols: [{ t: 'valley', seg: [[25, 0], [75, 50]] }, { t: 'valley', seg: [[75, 0], [25, 50]] }, { t: 'mountain', seg: [[25, 25], [75, 25]] }, { t: 'arrow', from: [14, 25], to: [38, 25], bend: 0, tail: 'push' }, { t: 'arrow', from: [86, 25], to: [62, 25], bend: 0, tail: 'push' }],
    minView: 100,
  });
  // Front legs: front corners up to the top point.
  b.valley([{ from: Cbl, to: A, select: 'top', bend: 0.3 }, { from: Cbr, to: A, select: 'top', bend: 0.3 }], { text: 'Fold the front corners up to the top. Front legs.' });
  // Sides of the body in to the center.
  b.valley([{ line: [[37.5, 50], [37.5, 100]], moving: [25, 75], select: 'body', arrows: [[[26, 75], [49, 75]]], bend: 0.3 }, { line: [[62.5, 50], [62.5, 100]], moving: [75, 75], select: 'body', arrows: [[[74, 75], [51, 75]]], bend: 0.3 }], { text: 'Fold the sides of the body in to the center.' });
  // Spring: bottom up, then back down in half.
  b.valley({ line: [[0, 75], [100, 75]], moving: [50, 100], arrows: [[[50, 99], [50, 51]]], bend: 0.4 }, { text: 'Fold the bottom edge up to the base of the head.' });
  b.valley({ line: [[0, 62.5], [100, 62.5]], moving: [50, 51], select: 'top', arrows: [[[50, 51], [50, 74]]], bend: 0.4 }, { text: 'Fold the same part back down in half. This is the spring.' });
  b.turnOver('Turn over.');
  b.finish('The finished frog. Press its back and let go to jump.');
  return b;
}
