// Traditional rabbit. Sources: reference/rabbit-style.png (paperkawaii diagram), origami.me/rabbit/.
import { builder, angleBisector } from '../lib/builder.js';
import { diamond, shape } from '../lib/shapes.js';
import { rot } from '../lib/geom.js';

export default function rabbit() {
  const b = builder({ id: 'rabbit', name: 'Rabbit', level: 3, base: 'kite', minPaperCm: 10, finishedSizeRatio: 0.45, sizeWord: 'long', start: diamond('back') });
  const T = [50, 0], R = [100, 50], B = [50, 100], L = [0, 50];
  b.start('Start colored side down, as a diamond.');
  b.valley({ from: T, to: B }, { text: 'Fold the top corner down to the bottom corner.' });
  b.valley([{ from: L, to: B, bend: 0.3 }, { from: R, to: B, bend: 0.3 }], { text: 'Fold both side corners down to the bottom point.' });
  // Kite folds on the front flaps.
  const lineL = angleBisector(B, [25, 75], [50, 50]), lineR = angleBisector(B, [75, 75], [50, 50]);
  b.valley([{ line: lineL, moving: [25, 75], select: 'top', bend: 0.3 }, { line: lineR, moving: [75, 75], select: 'top', bend: 0.3 }], { text: 'Fold the lower edges of the front flaps to the center.' });
  // Squash: open each narrow flap and press it flat (hand-authored result).
  const pre = b.state;
  const E3 = ['edge', 'edge', 'edge'];
  const back = shape([[50, 50], [25, 75], [50, 100], [75, 75]], 'front', ['body'], ['edge', 'edge', 'edge', 'edge']);
  const earL = (k) => shape([[50, 50], [50 - 14 * k, 60 + 8 * k], [50 - 6 * k, 78 - 4 * k], [50, 72]], 'front', ['earL'], ['fold', 'edge', 'edge', 'edge']);
  const earR = (k) => shape([[50, 50], [50 + 14 * k, 60 + 8 * k], [50 + 6 * k, 78 - 4 * k], [50, 72]], 'front', ['earR'], ['fold', 'edge', 'edge', 'edge']);
  const Q0 = [back, earL(0.3), earR(0.3)];
  const Q1 = [back, earL(0.7), earR(0.7)];
  const Q2 = [back, earL(1), earR(1)];
  b.custom({
    text: 'Open each narrow flap and squash it flat.',
    shapes: pre,
    next: Q2,
    frames: [Q0, Q1, Q2],
    tricky: true,
    symbols: [{ t: 'arrow', from: [44, 62], to: [30, 64], bend: 0.3, tail: 'open' }, { t: 'arrow', from: [56, 62], to: [70, 64], bend: -0.3, tail: 'open' }],
  });
  b.turnOver('Turn over.');
  b.mountain({ line: [[50, 0], [50, 100]], moving: [70, 75], arrows: [[[72, 75], [28, 75]]], bend: 0.6 }, { text: 'Mountain-fold in half. The sides go back.', symbols: [{ t: 'rotate', at: [80, 90], deg: 90 }] });
  // ---- Side view (hand-authored): a sitting rabbit facing left ----
  const E = ['edge', 'edge', 'edge'];
  const body = shape([[24, 84], [88, 84], [82, 62], [62, 46], [38, 50]], 'front', ['body'], ['edge', 'edge', 'edge', 'fold', 'edge']);
  // Head flap: starts as a point along the back, ends pointing down and forward.
  const head = (k) => shape([[38, 50], [30 - 10 * k, 46 - 20 * (1 - k)], [18 - 2 * k, 58 - 14 * (1 - k)], [26, 66 - 10 * (1 - k)], [40, 62]], 'front', ['head'], ['fold', 'edge', 'edge', 'edge', 'edge']);
  const ear1 = (k) => shape([[32, 50], [30 + 20 * (1 - k), 12 + 26 * (1 - k)], [40, 48]], 'front', ['ear'], E);
  const ear2 = (k) => shape([[38, 51], [40 + 18 * (1 - k), 8 + 28 * (1 - k)], [46, 48]], 'frontDark', ['ear'], E);
  const tail = (k) => shape([[88, 84], [88 + 8 * k, 72 + 6 * (1 - k)], [92 + 2 * k, 86]], 'front', ['tail'], E);
  const S0 = [body, head(0), ear2(0), ear1(0), tail(0)];
  const S1 = [body, head(0), ear2(1), ear1(1), tail(0)];
  b.custom({
    text: 'Pull the two ears up. Crease them so they stay.',
    shapes: S0,
    next: S1,
    frames: [S0, S1],
    tricky: true,
    symbols: [{ t: 'arrow', from: [52, 34], to: [36, 8], bend: -0.3, tail: 'push' }],
    minView: 100,
  });
  const S2 = [body, head(1), ear2(1), ear1(1), tail(0)];
  b.custom({
    text: 'Reverse-fold the front point down for the head.',
    shapes: S1,
    next: S2,
    frames: [S1, S2],
    tricky: true,
    symbols: [{ t: 'valley', seg: [[38, 50], [26, 56]] }, { t: 'arrow', from: [16, 36], to: [14, 58], bend: 0.3, tail: 'push' }],
    minView: 100,
  });
  const S3 = [body, head(1), ear2(1), ear1(1), tail(1)];
  b.custom({
    text: 'Reverse-fold the back corner for the tail.',
    shapes: S2,
    next: S3,
    frames: [S2, S3],
    tricky: true,
    symbols: [{ t: 'valley', seg: [[82, 84], [88, 74]] }, { t: 'arrow', from: [96, 90], to: [98, 74], bend: -0.4, tail: 'push' }],
    minView: 100,
  });
  b.finish('The finished rabbit.', { minView: 100 });
  void rot;
  return b;
}
