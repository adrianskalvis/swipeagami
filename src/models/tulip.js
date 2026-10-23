// Traditional tulip from the waterbomb base. Sources: origami-fun.com/origami-tulip.html, origami.me/tulip/.
import { builder } from '../lib/builder.js';
import { square, shape } from '../lib/shapes.js';
import { waterbombBase, waterbombCollapseFrames, WB } from './bases.js';

export function creasedForWaterbomb(b) {
  // Crease both diagonals on the white side, turn over, crease both halves.
  b.start('Start colored side down.');
  b.crease([{ from: [0, 0], to: [100, 100], arrow: false }, { from: [100, 0], to: [0, 100], arrows: [[[98, 2], [2, 98]]] }], { text: 'Fold both diagonals. Unfold each.' });
  b.turnOver('Turn over.');
  b.crease([{ from: [0, 50], to: [100, 50], arrow: false }, { from: [50, 0], to: [50, 100], arrows: [[[50, 2], [50, 98]]] }], { text: 'Fold in half both ways. Unfold each.' });
}

export function collapseWaterbomb(b) {
  const frames = waterbombCollapseFrames().map((f) => f.map((s) => ({ ...s, face: s.face === 'back' ? 'front' : s.face })));
  frames[2] = waterbombBase();
  b.custom({
    text: 'Push the sides in. Bring the top down to make a triangle.',
    shapes: frames[0],
    next: waterbombBase(),
    frames,
    tricky: true,
    symbols: [{ t: 'mountain', line: [[0, 0], [100, 100]] }, { t: 'mountain', line: [[100, 0], [0, 100]] }, { t: 'arrow', from: [-8, 50], to: [20, 50], bend: 0, tail: 'push' }, { t: 'arrow', from: [108, 50], to: [80, 50], bend: 0, tail: 'push' }, { t: 'arrow', from: [50, -8], to: [50, 20], bend: 0, tail: 'push' }],
    minView: 100,
  });
}

export default function tulip() {
  const b = builder({ id: 'tulip', name: 'Tulip', level: 2, base: 'waterbomb', minPaperCm: 7.5, finishedSizeRatio: 0.3, sizeWord: 'tall', start: square('back') });
  creasedForWaterbomb(b);
  collapseWaterbomb(b);
  const { A, CL, CR } = WB;
  // Front corners up to the top.
  b.valley([{ from: CL, to: A, select: 'top', bend: 0.3 }, { from: CR, to: A, select: 'top', bend: 0.3 }], { text: 'Fold the front corners up to the top point.' });
  b.turnOver('Turn over.');
  b.valley([{ from: CL, to: A, select: 'top', bend: 0.3 }, { from: CR, to: A, select: 'top', bend: 0.3 }], { text: 'Fold these corners up to the top point too.' });
  // Tuck: left and right corners past the center, one inside the other.
  const Lc = [25, 50], Rc = [75, 50];
  b.valley([{ from: Lc, to: [57, 50], select: 'top', bend: 0.3 }, { from: Rc, to: [43, 50], select: 'top', bend: 0.3 }], { text: 'Fold both corners past the center. Tuck one into the other.', tricky: true });
  b.turnOver('Turn over.');
  b.valley([{ from: Lc, to: [57, 50], select: 'top', bend: 0.3 }, { from: Rc, to: [43, 50], select: 'top', bend: 0.3 }], { text: 'Fold these corners past the center and tuck them too.', tricky: true });
  // Inflate: the bud puffs up (3D).
  const flat = b.state;
  const E6 = ['edge', 'edge', 'edge', 'edge', 'edge', 'edge'];
  const bud = (k) => shape([[50, 25], [57 + 8 * k, 40 - 2 * k], [59 + 10 * k, 62 + 4 * k], [50, 75 + 4 * k], [41 - 10 * k, 62 + 4 * k], [43 - 8 * k, 40 - 2 * k]], 'front', ['bud'], E6);
  const seam = (k) => shape([[50, 25], [50 + 1, 40], [50 + 1, 70 + 4 * k], [50, 75 + 4 * k], [50 - 1, 70 + 4 * k], [50 - 1, 40]], 'frontDark', ['seam'], E6);
  const B0 = [bud(0), seam(0)], B1 = [bud(1), seam(1)];
  b.custom({
    text: 'Blow into the hole at the bottom. The bud puffs up.',
    shapes: flat,
    next: B1,
    frames: [B0, B1],
    tricky: true,
    symbols: [{ t: 'arrow', from: [50, 96], to: [50, 80], bend: 0, tail: 'push' }],
    minView: 90,
  });
  // Petals: peel the four tips down and out.
  const petal = (cx, dir, k) => shape([[50, 25], [50 + dir * (6 + 14 * k), 25 + 10 * k], [50 + dir * (18 + 14 * k), 44 - 4 * k], [50 + dir * 8, 48]], 'front', ['petal'], ['fold', 'edge', 'edge', 'edge']);
  const P0 = [bud(1), seam(1), petal(50, -1, 0), petal(50, 1, 0)];
  const P1 = [bud(1), seam(1), petal(50, -1, 1), petal(50, 1, 1)];
  b.custom({
    text: 'Peel each petal down a little.',
    shapes: P0,
    next: P1,
    frames: [P0, P1],
    tricky: true,
    symbols: [{ t: 'arrow', from: [44, 28], to: [22, 40], bend: 0.3 }, { t: 'arrow', from: [56, 28], to: [78, 40], bend: -0.3 }],
    minView: 90,
  });
  b.finish('The finished tulip. Add a stem from a rolled strip.', { minView: 90 });
  return b;
}
