// Square base and bird base, built with the fold engine. Shared by the flapping bird, crane and lily.
// Sources: origami-fun.com/origami-crane.html, origami.me/crane/.
import { angleBisector } from '../lib/builder.js';
import { intersect } from '../lib/geom.js';
import { prelimBase, prelimCollapseFrames, PB } from './bases.js';

export function creasedForSquareBase(b) {
  b.start('Start colored side up, as a diamond.');
  b.crease([{ from: [0, 50], to: [100, 50], arrow: false }, { from: [50, 0], to: [50, 100], arrows: [[[50, 2], [50, 98]]] }], { text: 'Fold both diagonals, corner to corner. Unfold each.' });
  b.turnOver('Turn over.');
  b.crease([{ from: [25, 25], to: [75, 75], arrow: false }, { from: [75, 25], to: [25, 75], arrows: [[[73, 27], [27, 73]]] }], { text: 'Fold in half both ways, edge to edge. Unfold each.' });
}

export function collapseSquareBase(b) {
  const frames = prelimCollapseFrames().map((f) => f.map((s) => ({ ...s, face: s.face === 'front' ? 'back' : 'front' })));
  frames[2] = prelimBase();
  b.custom({
    text: 'Bring the four corners together at the bottom. Flatten.',
    shapes: frames[0],
    next: prelimBase(),
    frames,
    tricky: true,
    symbols: [{ t: 'mountain', line: [[0, 50], [100, 50]] }, { t: 'arrow', from: [-6, 44], to: [40, 84], bend: 0.25, tail: 'push' }, { t: 'arrow', from: [106, 44], to: [60, 84], bend: -0.25, tail: 'push' }, { t: 'arrow', from: [50, -6], to: [50, 20], bend: 0, tail: 'push' }],
    minView: 100,
  });
}

// Petal fold on the front flap of a square base: creases, then the lift.
export function petalFront(b, { leftTags, rightTags, frontTag, first, frontTags, text }) {
  const { T, B, L, R } = PB;
  const lineL = angleBisector(B, L, T), lineR = angleBisector(B, R, T);
  const SL = intersect(lineL, [T, L]), SR = intersect(lineR, [T, R]);
  const hinge = [SL, SR];
  b.crease([{ line: lineL, moving: L, select: 'top', bend: 0.25 }, { line: lineR, moving: R, select: 'top', bend: 0.25 }, { line: hinge, moving: T, select: 'top', bend: 0.3 }], {
    text: text || (first ? 'Crease the front edges to the center and the top down.' : 'Crease the edges to the center and the top down.'),
  });
  const isL = (s) => s.tags.some((t) => leftTags.includes(t)), isR = (s) => s.tags.some((t) => rightTags.includes(t));
  const ft = frontTags || [frontTag];
  const isF = (s) => s.tags.some((t) => ft.includes(t));
  // The front flap's side regions tuck behind the lifting point; the layer beneath folds in on top of its own inner part.
  b.combo([
    { mode: 'valley', specs: [{ line: lineL, moving: L, select: isF, mode: 'mountain', arrow: false }, { line: lineL, moving: L, select: isL, arrow: false, tag: 'leg' }, { line: lineR, moving: R, select: isF, mode: 'mountain', arrow: false }, { line: lineR, moving: R, select: isR, arrow: false, tag: 'leg' }], symbols: false },
    { mode: 'valley', specs: [{ line: hinge, moving: B, select: (s) => isF(s) && !s.tags.includes('leg'), arrows: [[B, [50, 6]]], bend: 0.3 }] },
  ], { text: 'Petal fold: lift the bottom point up. The sides fold in.', tricky: true, symbols: [{ t: 'valley', seg: hinge }, { t: 'mountain', seg: [B, SL] }, { t: 'mountain', seg: [B, SR] }, { t: 'arrow', from: [50, 73], to: [50, 8], bend: 0.3 }] });
  return { hinge, SL, SR };
}

// Full bird base from the creased diamond.
export function birdBase(b) {
  collapseSquareBase(b);
  petalFront(b, { leftTags: ['l2'], rightTags: ['r2'], frontTag: 'f1', first: true });
  b.turnOver('Turn over.');
  // After turning over the former back layer is in front; its side neighbours are l3/r3 (mirrored).
  petalFront(b, { leftTags: ['r3'], rightTags: ['l3'], frontTag: 'b4', first: false });
}

export { PB };
