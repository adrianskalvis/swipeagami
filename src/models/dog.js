// Traditional dog face. Sources: instructables.com/Easy-Origami-Dog, origami.guide (Easy Origami Dog Face).
import { builder } from '../lib/builder.js';
import { diamond } from '../lib/shapes.js';
import { lineAngle, reflect } from '../lib/geom.js';

export default function dog() {
  const b = builder({ id: 'dog', name: 'Dog face', level: 1, base: 'triangle', minPaperCm: 7, finishedSizeRatio: 1.2, sizeWord: 'wide', start: diamond('back') });
  const T = [50, 0], R = [100, 50], B = [50, 100], L = [0, 50];
  b.start('Start colored side down, as a diamond.');
  b.valley({ from: T, to: B }, { text: 'Fold the top corner down to the bottom corner.' });
  b.crease({ from: L, to: R }, { text: 'Fold in half, side to side. Unfold.' });
  // Ears: fold the side corners down along slanted lines from near the top center.
  const lineL = lineAngle([38, 50], 148), lineR = lineAngle([62, 50], 32);
  b.valley([{ line: lineL, moving: L, bend: 0.3 }, { line: lineR, moving: R, bend: 0.3 }], { text: 'Fold the corners down for the ears.' });
  // Nose: front layer tip up.
  b.valley({ line: [[0, 84], [100, 84]], moving: B, select: 'top', arrows: [[B, [50, 68]]], bend: 0.45 }, { text: 'Fold the front tip up for the nose.' });
  b.finish('The finished dog. Draw the eyes.');
  void reflect;
  return b;
}
