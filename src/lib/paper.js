// Paper types, colours and sizes. Sizes in centimetres.
export const PAPERS = [
  { id: 'origami', name: 'Origami paper', w: 15, h: 15, dim: '15 × 15 cm' },
  { id: 'small', name: 'Small origami or sticky note', w: 7.5, h: 7.5, dim: '7.5 × 7.5 cm' },
  { id: 'a4', name: 'A4 printer paper', w: 21, h: 29.7, dim: '21 × 29.7 cm' },
  { id: 'letter', name: 'US Letter', w: 21.6, h: 27.9, dim: '21.6 × 27.9 cm' },
  { id: 'receipt', name: 'Receipt', w: 8, h: 26, dim: 'a strip, about 8 cm wide', strip: true },
  { id: 'wrapper', name: 'Gum wrapper', w: 7, h: 5, dim: 'tiny, about 5 × 7 cm' },
  { id: 'custom', name: 'Something else', w: 12, h: 12, dim: 'drag the square to match', custom: true },
];

export const COLORS = [
  { id: 'red', name: 'Red', hex: '#d9483b' },
  { id: 'yellow', name: 'Yellow', hex: '#f1c232' },
  { id: 'blue', name: 'Blue', hex: '#4a86c8' },
  { id: 'green', name: 'Green', hex: '#5aa05a' },
  { id: 'orange', name: 'Orange', hex: '#ee8a2f' },
  { id: 'white', name: 'White', hex: '#ffffff' },
];

export const DEFAULT_PAPER = { type: 'origami', w: 15, h: 15, color: 'yellow' };

export const paperType = (p) => PAPERS.find((t) => t.id === (p && p.type)) || PAPERS[0];
export const colorHex = (p) => (COLORS.find((c) => c.id === (p && p.color)) || COLORS[1]).hex;
export const colorName = (p) => (COLORS.find((c) => c.id === (p && p.color)) || COLORS[1]).name;
export const squareSide = (p) => Math.min(p.w, p.h);
export const isRect = (p) => Math.abs(p.w - p.h) > 0.3;

export function paperLabel(p) {
  const t = paperType(p);
  if (t.custom) return `${Math.round(squareSide(p))} cm`;
  return t.name.split(' or ')[0];
}

// Finished size in cm for a model folded from this paper.
export function finishedSize(model, p) {
  const side = model.startsFromRect ? Math.max(p.w, p.h) * (isRect(p) ? 1 : 1) : squareSide(p);
  const base = model.startsFromRect ? (isRect(p) ? Math.min(p.w, p.h) : squareSide(p)) : side;
  return model.finishedSizeRatio * base;
}

export function sizeNote(model, p) {
  const cm = finishedSize(model, p);
  const r = cm >= 10 ? Math.round(cm) : Math.round(cm * 2) / 2;
  return `Your ${model.name.toLowerCase()} will be about ${r} cm ${model.sizeWord || 'across'}.`;
}

export function tooSmall(model, p) {
  return squareSide(p) < model.minPaperCm;
}
