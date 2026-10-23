// Traditional waterbomb (balloon). Sources: origami-resource-center.com/waterbomb-base/, mancunion.com/2014/02/22/origami-how-to/.
import { builder } from '../lib/builder.js';
import { square, shape, linkAll } from '../lib/shapes.js';
import { WB } from './bases.js';
import { creasedForWaterbomb, collapseWaterbomb } from './tulip.js';

export default function waterbomb() {
  const b = builder({ id: 'waterbomb', name: 'Waterbomb', level: 3, base: 'waterbomb', minPaperCm: 7.5, finishedSizeRatio: 0.33, sizeWord: 'across', start: square('back') });
  creasedForWaterbomb(b);
  collapseWaterbomb(b);
  const { A, CL, CR } = WB;
  const oneSide = (first) => {
    b.valley([{ from: CL, to: A, select: 'top', bend: 0.3 }, { from: CR, to: A, select: 'top', bend: 0.3 }], { text: first ? 'Fold the front corners up to the top point.' : 'Fold these corners up to the top point too.' });
    b.valley([{ from: [25, 50], to: [50, 50], select: 'top', bend: 0.3 }, { from: [75, 50], to: [50, 50], select: 'top', bend: 0.3 }], { text: 'Fold the side corners in to the center.' });
    b.valley([{ line: [[0, 37.5], [100, 37.5]], moving: [47, 27], select: 'top', arrows: [[[47, 27], [47, 48]]], bend: 0.35 }, { line: [[0, 37.5], [100, 37.5]], moving: [53, 27], select: 'top', arrows: [[[53, 27], [53, 48]]], bend: -0.35 }], { text: 'Fold the two loose top corners down to the center.' });
    // Tuck: the small triangles slide into the side pockets.
    const st = b.state;
    const tips = st.map((s) => s.tags.includes('tip'));
    void tips;
    const before = st;
    const slid = st.map((s, i) => (i >= st.length - 2 ? { ...s, pts: s.pts.map((p) => [p[0], p[1] + 2]) } : s));
    const next = st.slice(0, st.length - 2);
    // Put the two tucked tips beneath the pocket layers.
    const tucked = [next[0], next[1], st[st.length - 2], st[st.length - 1]].concat(next.slice(2));
    b.custom({ text: 'Tuck the small triangles into the side pockets.', shapes: before, next: tucked, frames: [before, slid], tricky: true, symbols: [{ t: 'arrow', from: [44, 41], to: [36, 52], bend: 0.2, tail: 'push' }, { t: 'arrow', from: [56, 41], to: [64, 52], bend: -0.2, tail: 'push' }] });
  };
  oneSide(true);
  b.turnOver('Turn over.');
  oneSide(false);
  // Inflate: the flat hexagon becomes a cube seen from a corner.
  const flat = b.state;
  const E = ['edge', 'edge', 'edge', 'edge'];
  const hex = (k) => {
    // k 0: flat shape, 1: cube.
    const top = shape([[50, 25 + 10 * k], [72 - 4 * k, 37 + 2 * k], [50, 50 + 2 * k], [28 + 4 * k, 37 + 2 * k]], 'front', ['top'], E);
    const left = shape([[28 + 4 * k, 37 + 2 * k], [50, 50 + 2 * k], [50, 75 - 2 * k], [28 + 4 * k, 62 - 2 * k]], 'frontDark', ['left'], E);
    const right = shape([[72 - 4 * k, 37 + 2 * k], [50, 50 + 2 * k], [50, 75 - 2 * k], [72 - 4 * k, 62 - 2 * k]], 'front', ['right'], E);
    return [left, right, top];
  };
  const C0 = hex(0), C1 = hex(1);
  b.custom({
    text: 'Blow into the hole at the bottom. It puffs into a cube.',
    shapes: flat,
    next: C1,
    frames: [C0, C1],
    tricky: true,
    symbols: [{ t: 'arrow', from: [50, 96], to: [50, 80], bend: 0, tail: 'push' }],
    minView: 90,
  });
  b.finish('The finished waterbomb. Fill it with water, or not.', { minView: 90 });
  void linkAll;
  return b;
}
