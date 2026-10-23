// Traditional cup. Sources: origami-fun.com/origami-drinking-cup.html, origami.me/cup/.
import { builder } from '../lib/builder.js';
import { diamond, shape } from '../lib/shapes.js';

export default function cup() {
  const b = builder({ id: 'cup', name: 'Cup', level: 1, base: 'triangle', minPaperCm: 7, finishedSizeRatio: 0.42, sizeWord: 'tall', start: diamond('back') });
  const T = [50, 0], R = [100, 50], B = [50, 100], L = [0, 50];
  b.start('Start colored side down, as a diamond.');
  b.valley({ from: B, to: T }, { text: 'Fold the bottom corner up to the top corner.' });
  // Triangle: apex T, base L-R at y=50. The corners fold so the flap's top edge is level.
  const P = [70.71, 20.71], Q = [29.29, 20.71];
  b.valley({ from: L, to: P, bend: 0.25 }, { text: 'Fold the left corner over. Keep the top edge level.' });
  b.valley({ from: R, to: Q, bend: 0.25 }, { text: 'Fold the right corner across to the left edge.' });
  const hinge = [[0, 20.71], [100, 20.71]];
  b.valley({ line: hinge, moving: T, select: 'top', arrows: [[T, [50, 41]]], bend: 0.45 }, { text: 'Fold the front top flap down.' });
  b.mountain({ line: hinge, moving: T, select: 'top', arrows: [[[50, 1], [50, 41]]], bend: 0.5 }, { text: 'Fold the back top flap behind.' });
  // Open the cup: a shallow 3D view of the pocket.
  const flat = b.state;
  const front = shape([[29.29, 20.71], [70.71, 20.71], [58.58, 50], [41.42, 50]], 'front', ['cup'], ['edge', 'edge', 'fold', 'edge']);
  const inner = shape([[29.29, 20.71], [70.71, 20.71], [70.71, 20.71], [29.29, 20.71]], 'backDark', ['cup'], ['edge', 'edge', 'edge', 'edge']);
  const openInner = shape([[29.29, 20.71], [70.71, 20.71], [64, 11], [36, 11]], 'back', ['cup'], ['edge', 'edge', 'edge', 'edge']);
  const openFront = shape([[29.29, 20.71], [70.71, 20.71], [58.58, 50], [41.42, 50]], 'front', ['cup'], ['edge', 'edge', 'fold', 'edge']);
  const F0 = [inner, front];
  const F2 = [openInner, openFront];
  b.custom({
    text: 'Open the top and press the bottom flat.',
    shapes: flat,
    next: F2,
    frames: [F0, F2],
    tricky: true,
    symbols: [{ t: 'arrow', from: [50, 32], to: [50, 8], bend: 0.3, tail: 'open' }],
    minView: 70,
  });
  b.finish('The finished cup. It holds water with waxed paper.', { minView: 70 });
  return b;
}
