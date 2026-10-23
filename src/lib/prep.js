// Preparation steps shown before a model: make a square from a rectangle,
// or make a rectangle from a square (for models that start from one).
import { builder } from './builder.js';
import { rect } from './shapes.js';
import { isRect } from './paper.js';

// Rectangle paper -> square. Fold a corner to the opposite edge, cut off the strip, unfold.
export function makeSquareSteps(paper) {
  const long = Math.max(paper.w, paper.h), short = Math.min(paper.w, paper.h);
  const ratio = Math.min(1.9, long / short);
  const w = 100 / ratio, h = 100; // portrait rectangle in the 100 box
  const b = builder({ start: rect(w, h, 'back') });
  const x0 = 50 - w / 2, x1 = 50 + w / 2, y0 = 0, y1 = 100;
  const TL = [x0, y0], TR = [x1, y0];
  // Fold the top-right corner down so the top edge lies on the left edge.
  b.valley({ line: [TL, [x0 + w, y0 + w]], moving: TR, arrows: [[TR, [x0, y0 + w]]], bend: 0.3 }, { text: 'Fold the top corner down to the side edge.' });
  const cutY = y0 + w;
  b.custom({
    text: paper.strip ? 'Cut or tear off the rest of the strip.' : 'Cut or tear off the strip below.',
    symbols: [{ t: 'cut', seg: [[x0 - 4, cutY], [x1 + 4, cutY]] }],
    next: b.state.filter((s) => s.pts.every((p) => p[1] <= cutY + 0.01)),
  });
  // Unfold: fold the triangle back along the same line (leaves a crease).
  const tri = b.state;
  b.valley({ line: [TL, [x0 + w, y0 + w]], moving: [x0 + 2, y0 + w - 2], select: (s) => s.face === 'front', arrows: [[[x0 + 1, y0 + w - 1], [x1 - 1, y0 + 1]]], bend: -0.3, unfold: true, head: 'hollow' }, { text: 'Unfold. You have a square.' });
  void tri;
  b.finish('Now follow the steps for a square.');
  // Drop the plain final card: the model's own first step follows.
  b.steps.pop();
  b.steps.forEach((s) => { s.prep = true; });
  return b.steps;
}

// Square paper -> 2:1 rectangle, for models that start from a rectangle.
export function makeRectSteps() {
  const b = builder({ start: rect(100, 100, 'back') });
  b.valley({ from: [50, 100], to: [50, 0], arrows: [[[50, 98], [50, 2]]] }, { text: 'Fold the square in half, bottom to top.' });
  b.steps.forEach((s) => { s.prep = true; });
  return b.steps;
}

export function prepSteps(model, paper) {
  if (model.startsFromRect) return isRect(paper) ? [] : makeRectSteps();
  return isRect(paper) ? makeSquareSteps(paper) : [];
}
