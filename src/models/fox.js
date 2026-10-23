// Traditional sitting fox. Sources: origami.me/fox/ (Shingu adaptation), origami.guide (origami fox).
import { builder } from '../lib/builder.js';
import { diamond, shape } from '../lib/shapes.js';
import { rot } from '../lib/geom.js';

export default function fox() {
  const b = builder({ id: 'fox', name: 'Fox', level: 2, base: 'triangle', minPaperCm: 7, finishedSizeRatio: 0.5, sizeWord: 'tall', start: diamond('back') });
  const T = [50, 0], R = [100, 50], B = [50, 100], L = [0, 50];
  b.start('Start colored side down, as a diamond.');
  b.valley({ from: B, to: T }, { text: 'Fold the bottom corner up to the top corner.' });
  b.valley([{ from: L, to: T, bend: 0.3 }, { from: R, to: T, bend: 0.3 }], { text: 'Fold both corners up to the top corner.' });
  b.turnOver('Turn over.');
  b.valley({ line: [[50, 0], [50, 50]], moving: [25, 25], arrows: [[[25, 25], [75, 25]]], bend: 0.4 }, { text: 'Fold in half, left over right.' });
  // Stand the triangle on its folded edge: loose corners to the left.
  b.rotate(-90, [50, 25]);
  const flat = b.state;
  // Head: fold the loose-corner point over, then let the two outer flaps open back out (squash).
  const headLine = [[50, 0], [44, 25]];
  b.valley({ line: headLine, moving: [25, 25], arrows: [[[27, 23], [60, 14]]], bend: 0.35 }, { text: 'Fold the left point over to the right along the line.' });
  const folded = b.state;
  // Hand-authored fox: body triangle, white squashed face with two ears, tail.
  const E = ['edge', 'edge', 'edge'];
  const body = shape([[25, 25], [75, 25], [50, 0]], 'front', ['body'], ['fold', 'edge', 'edge']);
  const face = shape([[33, 16], [41, 1], [49, 16], [41, 25]], 'back', ['face'], ['edge', 'edge', 'edge', 'edge']);
  const earL = shape([[33, 16], [30, -4], [41, 1]], 'front', ['ear'], E);
  const earR = shape([[49, 16], [52, -4], [41, 1]], 'front', ['ear'], E);
  const tail0 = shape([[75, 25], [75, 25], [75, 25]], 'front', ['tail'], E);
  // The folded point (hand copy of the state after the last fold).
  const flapPts = [[50, 0], [44, 25], [68, 32]];
  const face0 = shape([[44, 25], [50, 0], [68, 32], [44, 25]], 'front', ['face'], ['fold', 'edge', 'edge', 'edge']);
  const ear0L = shape([[44, 25], [50, 0], [68, 32]], 'front', ['ear'], ['fold', 'edge', 'edge']);
  const ear0R = shape([[44, 25], [50, 0], [68, 32]], 'front', ['ear'], ['fold', 'edge', 'edge']);
  void flapPts;
  const faceMid = shape([[32, 20], [44, 6], [52, 20], [44, 30]], 'back', ['face'], ['edge', 'edge', 'edge', 'edge']);
  const F0 = [body, face0, ear0L, ear0R, tail0];
  const F1 = [body, faceMid, shape([[32, 20], [31, 4], [44, 6]], 'front', ['ear'], E), shape([[52, 20], [54, 4], [44, 6]], 'front', ['ear'], E), tail0];
  const F2 = [body, face, earL, earR, tail0];
  b.custom({
    text: 'Open the outer flaps back. Squash the middle flat.',
    shapes: folded,
    next: F2,
    frames: [F0, F1, F2],
    tricky: true,
    symbols: [{ t: 'arrow', from: [60, 14], to: [34, 6], bend: -0.3, tail: 'open' }],
    minView: 90,
  });
  const tail = shape([[75, 25], [90, 14], [84, 27]], 'front', ['tail'], E);
  const G2 = [body, face, earL, earR, tail];
  b.custom({
    text: 'Fold the back corner out for the tail.',
    shapes: F2,
    next: G2,
    frames: [F2, G2],
    symbols: [{ t: 'valley', seg: [[75, 25], [84, 14]] }, { t: 'arrow', from: [70, 20], to: [88, 10], bend: -0.3 }],
    minView: 90,
  });
  b.finish('The finished fox. Stand it on its base.', { minView: 90 });
  void rot;
  return b;
}
