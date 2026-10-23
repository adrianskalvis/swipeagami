// Model registry and levels. Each model is built from its fold data the first time it is asked for.
import swan from './swan.js';
import cup from './cup.js';
import dog from './dog.js';
import fox from './fox.js';
import tulip from './tulip.js';
import frog from './frog.js';
import rabbit from './rabbit.js';
import waterbomb from './waterbomb.js';
import flapper from './flapper.js';
import crane from './crane.js';
import lily from './lily.js';
import rose from './rose.js';

export const LEVELS = [
  { n: 1, name: 'Starter', moves: 'Valley and mountain folds, turn over, kite fold', models: ['swan', 'cup', 'dog'] },
  { n: 2, name: 'Beginner', moves: 'Waterbomb base, folding from a rectangle', models: ['fox', 'tulip', 'frog'] },
  { n: 3, name: 'Intermediate', moves: 'Squash fold, inside reverse fold, inflating', models: ['rabbit', 'waterbomb'] },
  { n: 4, name: 'Advanced', moves: 'Square base, petal fold, bird base, frog base', models: ['flapper', 'crane', 'lily'] },
  { n: 5, name: 'Expert', moves: 'Twist folds, curling petals. The final challenge.', models: ['rose'] },
];

const builders = { swan, cup, dog, fox, tulip, frog, rabbit, waterbomb, flapper, crane, lily, rose };
const built = {};

// MODELS.swan etc. build lazily, so the first launch only computes the swan.
export const MODELS = new Proxy({}, {
  get(_, id) {
    if (typeof id !== 'string' || !builders[id]) return undefined;
    if (!built[id]) { const b = builders[id](); built[id] = { ...b.meta, steps: b.steps }; }
    return built[id];
  },
  has(_, id) { return typeof id === 'string' && !!builders[id]; },
  ownKeys() { return Object.keys(builders); },
  getOwnPropertyDescriptor(_, id) { return builders[id] ? { enumerable: true, configurable: true, value: MODELS[id] } : undefined; },
});

export const ORDER = LEVELS.flatMap((l) => l.models).filter((id) => builders[id]);
export const levelOf = (id) => LEVELS.find((l) => l.models.includes(id));
export const nextModelId = (id) => ORDER[ORDER.indexOf(id) + 1] || null;
