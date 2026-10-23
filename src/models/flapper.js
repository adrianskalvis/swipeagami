// Traditional flapping bird. Sources: origami-fun.com/origami-flapping-bird.html, reference/bird-steps.png (wikiHow style sheet).
import { builder } from '../lib/builder.js';
import { diamond, shape } from '../lib/shapes.js';
import { creasedForSquareBase, birdBase } from './birdbase.js';
import { cranePart } from './crane.js';

export default function flapper() {
  const b = builder({ id: 'flapper', name: 'Flapping bird', level: 4, base: 'bird', minPaperCm: 10, finishedSizeRatio: 0.5, sizeWord: 'long', start: diamond('front') });
  creasedForSquareBase(b);
  birdBase(b);
  cranePart(b, { narrow: false });
  const hingeY = 39.64;
  b.valley({ line: [[0, hingeY], [100, hingeY]], moving: [50, 10], select: 'top', arrows: [[[50, 8], [50, 70]]], bend: 0.4 }, { text: 'Fold the front wing down.' });
  b.mountain({ line: [[0, hingeY], [100, hingeY]], moving: [50, 10], select: 'top', arrows: [[[50, 8], [50, 70]]], bend: 0.5 }, { text: 'Fold the back wing down behind.' });
  const flat = b.state;
  const E = ['edge', 'edge', 'edge'];
  const body = shape([[34, 46], [66, 46], [50, 70]], 'front', ['body'], E);
  const wing = (k, sign) => shape([[50 + sign * 16, 46], [50, 58], [50 + sign * (20 + 26 * k), 54 - 20 * k]], 'front', ['wing'], E);
  const neck = shape([[34, 46], [40, 56], [22, 16]], 'front', ['neck'], E);
  const head = shape([[22, 16], [25, 22], [12, 22]], 'front', ['head'], E);
  const tail = shape([[66, 46], [60, 56], [80, 16]], 'front', ['tail'], E);
  const F0 = [tail, neck, head, wing(0, -1), wing(0, 1), body];
  const F1 = [tail, neck, head, wing(1, -1), wing(1, 1), body];
  b.custom({ text: 'Hold the breast and pull the tail. The wings flap.', shapes: flat, next: F0, frames: [F0, F1, F0], tricky: true, symbols: [{ t: 'arrow', from: [84, 24], to: [92, 14], bend: -0.3 }], minView: 100 });
  b.finish('The finished flapping bird.', { minView: 100 });
  return b;
}
