// Level lessons: one or two swipe cards that teach the level's new move.
import { builder } from '../lib/builder.js';
import { square, shape } from '../lib/shapes.js';

const cache = {};

function valleyLesson() {
  const b = builder({ start: square('front') });
  b.valley({ from: [100, 50], to: [0, 50], arrows: [[[98, 50], [2, 50]]], bend: 0.3 }, { text: 'Valley fold. Dashed line. Fold toward you.' });
  return { title: 'Valley fold', step: b.steps[0] };
}
function mountainLesson() {
  const b = builder({ start: square('front') });
  b.mountain({ from: [100, 50], to: [0, 50], arrows: [[[98, 50], [2, 50]]], bend: 0.5 }, { text: 'Mountain fold. Red dash-dot line. Fold behind.' });
  return { title: 'Mountain fold', step: b.steps[0] };
}
function waterbombLesson() {
  // Precreased square collapsing into the waterbomb base (hand keyframes).
  const b = builder({ start: square('front') });
  b.crease([{ from: [0, 0], to: [100, 100] }, { from: [100, 0], to: [0, 100] }], { text: 'Crease both diagonals.' });
  const pre = b.state;
  const tri = (pts, face) => shape(pts, face, [], ['fold', 'edge', 'edge']);
  // Final waterbomb base: triangle pointing down, two layers each side.
  const F = [
    tri([[0, 100], [100, 100], [50, 50]], 'back'),
    tri([[0, 100], [50, 100], [50, 50]], 'front'),
    tri([[100, 100], [50, 100], [50, 50]], 'front'),
    tri([[0, 100], [100, 100], [50, 50]], 'front'),
  ];
  const frames = [
    [tri([[0, 0], [100, 0], [50, 50]], 'front'), tri([[0, 0], [0, 100], [50, 50]], 'front'), tri([[100, 0], [100, 100], [50, 50]], 'front'), tri([[0, 100], [100, 100], [50, 50]], 'front')],
    [tri([[18, 40], [82, 40], [50, 58]], 'back'), tri([[18, 40], [18, 100], [50, 58]], 'front'), tri([[82, 40], [82, 100], [50, 58]], 'front'), tri([[18, 100], [82, 100], [50, 58]], 'front')],
    [tri([[2, 98], [98, 98], [50, 52]], 'back'), tri([[2, 98], [48, 100], [50, 52]], 'front'), tri([[98, 98], [52, 100], [50, 52]], 'front'), tri([[2, 100], [98, 100], [50, 52]], 'front')],
    F,
  ];
  return { title: 'Waterbomb base', step: { text: 'Push the sides in. The square folds down into a triangle.', shapes: pre, symbols: [{ t: 'arrow', from: [-6, 50], to: [22, 50], bend: 0, tail: 'push' }, { t: 'arrow', from: [106, 50], to: [78, 50], bend: 0, tail: 'push' }, { t: 'mountain', line: [[0, 50], [100, 50]] }], anim: { type: 'frames', frames }, tricky: true, minView: 100 } };
}
function rectLesson() {
  const b = builder({ start: [shape([[25, 0], [75, 0], [75, 100], [25, 100]], 'back')] });
  b.valley({ from: [25, 0], to: [75, 50], arrows: [[[27, 2], [73, 48]]], bend: 0.3 }, { text: 'From a rectangle: fold corners to edges to find the square.' });
  return { title: 'Folding a rectangle', step: b.steps[0] };
}
function squashLesson() {
  // A flap standing up is opened and pressed flat.
  const tri = (pts, face, e) => shape(pts, face, [], e || ['fold', 'edge', 'edge']);
  const base = shape([[20, 40], [80, 40], [80, 100], [20, 100]], 'front', [], ['edge', 'edge', 'edge', 'edge']);
  const flapUp = [base, tri([[50, 40], [50, 100], [20, 100]], 'front', ['fold', 'edge', 'edge'])];
  const mid = [base, tri([[50, 40], [50, 100], [35, 86]], 'front', ['fold', 'edge', 'edge'])];
  const flat = [base, tri([[50, 40], [50, 100], [50, 70]], 'front', ['fold', 'edge', 'edge'])];
  const open = [base, tri([[50, 40], [65, 100], [35, 100]], 'back', ['fold', 'edge', 'edge'])];
  return { title: 'Squash fold', step: { text: 'Squash fold. Lift the flap, open it and press it flat.', shapes: flapUp, symbols: [{ t: 'arrow', from: [30, 72], to: [58, 60], bend: 0.3, tail: 'open' }], anim: { type: 'frames', frames: [flapUp, mid, flat, open] }, tricky: true, minView: 100 } };
}
function reverseLesson() {
  // Inside reverse fold on a folded strip, side view.
  const tri = (pts, face, e) => shape(pts, face, [], e);
  const before = [tri([[10, 60], [60, 60], [90, 30], [90, 42], [60, 72], [10, 72]], 'front', ['edge', 'edge', 'edge', 'edge', 'edge', 'fold'])];
  const after = [tri([[10, 60], [60, 60], [50, 20], [62, 20], [60, 72], [10, 72]], 'front', ['edge', 'edge', 'edge', 'edge', 'edge', 'fold'])];
  const mid = [tri([[10, 60], [60, 60], [72, 22], [84, 28], [60, 72], [10, 72]], 'front', ['edge', 'edge', 'edge', 'edge', 'edge', 'fold'])];
  return { title: 'Inside reverse fold', step: { text: 'Inside reverse fold. Push the tip between the layers so it points the other way.', shapes: before, symbols: [{ t: 'valley', seg: [[60, 60], [90, 30]] }, { t: 'arrow', from: [96, 26], to: [66, 24], bend: -0.3, tail: 'push' }], anim: { type: 'frames', frames: [before, mid, after] }, tricky: true, minView: 100 } };
}
function squareBaseLesson() {
  const b = builder({ start: square('front') });
  b.crease([{ from: [0, 0], to: [100, 100] }, { from: [100, 0], to: [0, 100] }], { text: 'Crease both diagonals.' });
  const pre = b.state;
  const q = (pts, face) => shape(pts, face, [], ['fold', 'fold', 'edge', 'edge']);
  const F = [
    q([[50, 20], [50, 100], [10, 60], [50, 20]], 'front'),
    q([[50, 20], [50, 100], [90, 60], [50, 20]], 'front'),
    q([[50, 20], [50, 100], [10, 60], [50, 20]], 'front'),
    q([[50, 20], [50, 100], [90, 60], [50, 20]], 'front'),
  ];
  const frames = [
    [q([[50, 50], [0, 100], [0, 0], [50, 50]], 'front'), q([[50, 50], [100, 100], [100, 0], [50, 50]], 'front'), q([[50, 50], [0, 100], [50, 100], [50, 50]], 'front'), q([[50, 50], [100, 100], [50, 100], [50, 50]], 'front')],
    [q([[50, 36], [22, 100], [18, 50], [50, 36]], 'front'), q([[50, 36], [78, 100], [82, 50], [50, 36]], 'front'), q([[50, 36], [22, 100], [50, 100], [50, 36]], 'front'), q([[50, 36], [78, 100], [50, 100], [50, 36]], 'front')],
    F,
  ];
  return { title: 'Square base', step: { text: 'Square base. Push the corners together. It folds flat into a small square.', shapes: pre, symbols: [{ t: 'arrow', from: [-4, 50], to: [20, 50], bend: 0, tail: 'push' }, { t: 'arrow', from: [104, 50], to: [80, 50], bend: 0, tail: 'push' }], anim: { type: 'frames', frames }, tricky: true, minView: 100 } };
}
function petalLesson() {
  // Petal fold on a kite-shaped flap: the bottom point lifts, the sides fold in.
  const tri = (pts, face, e) => shape(pts, face, [], e);
  const before = [tri([[50, 10], [85, 60], [50, 100], [15, 60]], 'front', ['edge', 'edge', 'edge', 'edge']), tri([[50, 100], [85, 60], [50, 60]], 'back', ['fold', 'edge', 'edge']), tri([[50, 100], [15, 60], [50, 60]], 'back', ['fold', 'edge', 'edge'])];
  const mid = [tri([[50, 10], [85, 60], [50, 100], [15, 60]], 'front', ['edge', 'edge', 'edge', 'edge']), tri([[50, 50], [85, 60], [50, 60]], 'back', ['fold', 'edge', 'edge']), tri([[50, 50], [15, 60], [50, 60]], 'back', ['fold', 'edge', 'edge'])];
  const after = [tri([[50, 10], [85, 60], [50, 100], [15, 60]], 'front', ['edge', 'edge', 'edge', 'edge']), tri([[50, 20], [68, 60], [50, 60]], 'back', ['fold', 'edge', 'edge']), tri([[50, 20], [32, 60], [50, 60]], 'back', ['fold', 'edge', 'edge'])];
  return { title: 'Petal fold', step: { text: 'Petal fold. Lift the bottom point up while the sides fold in to the middle.', shapes: before, symbols: [{ t: 'valley', seg: [[15, 60], [85, 60]] }, { t: 'arrow', from: [50, 96], to: [50, 24], bend: 0.25 }], anim: { type: 'frames', frames: [before, mid, after] }, tricky: true, minView: 100 } };
}
function twistLesson() {
  const q = (pts, face) => shape(pts, face, [], ['fold', 'fold', 'fold', 'fold']);
  const before = [q([[30, 30], [70, 30], [70, 70], [30, 70]], 'front')];
  const mid = [q([[34, 26], [74, 34], [66, 74], [26, 66]], 'front')];
  const after = [q([[40, 24], [76, 40], [60, 76], [24, 60]], 'front')];
  return { title: 'Twist fold', step: { text: 'Twist fold. The center square turns while the sides pleat around it.', shapes: before, symbols: [{ t: 'rotate', at: [50, 50], deg: 45 }], anim: { type: 'frames', frames: [before, mid, after] }, tricky: true, minView: 100 } };
}
function curlLesson() {
  const tri = (pts, face) => shape(pts, face, [], ['fold', 'edge', 'edge']);
  const before = [tri([[50, 90], [30, 20], [70, 20]], 'front')];
  const mid = [tri([[50, 90], [26, 34], [74, 34]], 'front')];
  const after = [tri([[50, 90], [18, 50], [82, 50]], 'front')];
  return { title: 'Curling petals', step: { text: 'Curl the petals. Roll each tip around a pencil or your finger.', shapes: before, symbols: [{ t: 'arrow', from: [30, 14], to: [12, 46], bend: 0.4 }, { t: 'arrow', from: [70, 14], to: [88, 46], bend: -0.4 }], anim: { type: 'frames', frames: [before, mid, after] }, tricky: true, minView: 100 } };
}

const LESSONS = {
  1: [valleyLesson, mountainLesson],
  2: [waterbombLesson, rectLesson],
  3: [squashLesson, reverseLesson],
  4: [squareBaseLesson, petalLesson],
  5: [twistLesson, curlLesson],
};

export function lessonCards(level) {
  if (!cache[level]) cache[level] = (LESSONS[level] || []).map((f) => f());
  return cache[level];
}
