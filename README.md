# Swipegami

Fold origami one swipe at a time. Swipegami is a mobile-first web app that teaches 12 traditional models in 5 levels, from a swan to a rose. Open it once, add it to your Home Screen, and it works fully offline. No accounts, no cookies, no analytics, no permission prompts.

Live app: https://adrianskalvis.github.io/swipeagami/

## What it is

- Pick the paper you have (origami paper, sticky note, A4, Letter, a receipt, a gum wrapper, or drag a square to match) and its color. The app tells you roughly how big the model will be and shows every diagram in your paper color.
- Each step is one card with one big diagram and one line of text. Swipe left for the next step, right to go back, down to go home. Tap a step to see the fold move as a short animation.
- Rectangular paper gets a short "make it square" sequence first. The jumping frog starts from a rectangle instead.
- Five levels unlock one after the other. Finishing any model in a level unlocks the next. "Unlock all levels" in settings skips that.
- Progress (finished models, the last step of each model, the paper choice) stays on the device in `localStorage`. The app still works if storage is blocked.

| Level | New moves | Models |
|---|---|---|
| 1 Starter | valley and mountain folds, turn over, kite fold | Swan, Cup, Dog face |
| 2 Beginner | waterbomb base, folding from a rectangle | Fox, Tulip, Jumping frog |
| 3 Intermediate | squash fold, inside reverse fold, inflating | Rabbit, Waterbomb |
| 4 Advanced | square base, petal fold, bird base, frog base | Flapping bird, Crane, Lily |
| 5 Expert | twist folds, curling petals | Rose |

## Run it locally

```
npm install
npm run dev        # http://localhost:5173/swipeagami/
npm run build      # dist/ with sw.js and a patched manifest
npm run preview    # serves dist/ at http://localhost:4173/swipeagami/
```

Checks run against the preview server. They need Playwright (`npm i -D playwright && npx playwright install chromium`); Lighthouse uses the Chromium at `CHROME_PATH` or `/opt/pw-browsers`:

```
npm run shots            # screenshots every step of every model at 390x844 and 360x780 into shots/
python3 scripts/sheets.py shots   # one contact sheet per model and size
npm run check:gestures   # swipe left, right, down, tap, flick, rubber band, keyboard, no scroll or zoom
npm run check:offline    # load once, go offline, reload, open a model and the paper picker
npm run check:lighthouse # mobile performance, accessibility and best practices, each 95 or more
```

Set `BASE_PATH` to deploy under a different path (the default is `/swipeagami/`). The GitHub Actions workflow in `.github/workflows/deploy.yml` builds on every push to `main` and deploys `dist/` to GitHub Pages.

## How the app is built

- Vanilla HTML, CSS and ES modules, bundled with Vite. No framework, no runtime CDN, no web fonts. The app shell is about 23 KB gzipped, the model data about 10 KB.
- `scripts/postbuild.mjs` writes `dist/sw.js` with the full list of built files. The service worker precaches all of them on the first load, so any model opens in airplane mode. It serves navigations from the cached `index.html`, which keeps deep links such as `#m/crane/12` working offline.
- Diagrams are SVG, computed from fold data. `src/lib/geom.js` has the 2D helpers (reflect a point across a line, split a polygon by a line). `src/lib/shapes.js` folds a stack of paper facets: a fold splits every selected facet along the line, reflects the moving pieces, flips their face and puts them on top (valley) or behind (mountain). Each facet keeps links to the facets it is physically joined to, so "fold the top flap" selects the right layers. Every step starts from the exact result of the step before.
- Flat folds animate by scaling the moving flap along the fold normal from +1 to -1 and switching the face color at 0. Squash, reverse, petal, twist and inflate moves use 3 to 5 hand-authored keyframes that are tweened.

## How to add a model

Models live in `src/models/`, one file each, and are registered in `src/models/index.js` (add the id to a level in `LEVELS` and to `builders`). A model file exports a function that returns a builder:

```js
import { builder } from '../lib/builder.js';
import { diamond } from '../lib/shapes.js';

export default function cup() {
  const b = builder({
    id: 'cup', name: 'Cup', level: 1, base: 'triangle',
    minPaperCm: 7,            // soft warning below this square size
    finishedSizeRatio: 0.42,  // finished size as a fraction of the square side
    sizeWord: 'tall',         // "Your cup will be about 6 cm tall."
    start: diamond('back'),   // the paper, colored side down, as a diamond
  });
  b.start('Start colored side down, as a diamond.');
  b.valley({ from: [50, 100], to: [50, 0] }, { text: 'Fold the bottom corner up to the top corner.' });
  b.valley({ line: [[0, 20.71], [100, 20.71]], moving: [50, 0], select: 'top' }, { text: 'Fold the front top flap down.' });
  b.mountain({ line: [[0, 20.71], [100, 20.71]], moving: [50, 0], select: 'top' }, { text: 'Fold the back top flap behind.' });
  b.finish('The finished cup.');
  return b;
}
```

Coordinates are in a 0 to 100 unit square. Each op records one step: the diagram before the move, the Yoshizawa-Randlett symbols for it, the animation, and the resulting paper for the next step.

- `b.valley(spec)` / `b.mountain(spec)`: a fold. `spec.from` and `spec.to` fold point `from` onto `to`, or give `spec.line` (two points) and `spec.moving` (a point on the side that moves). `select` is `'all'` (default), `'top'` (the flap under `moving`), a tag name, or a function over facets. `tag` names the moved pieces for later selection. `reverse: true` makes an inside reverse fold. Pass an array of specs for two folds in one step.
- `b.crease(spec)`: fold and unfold, leaves a thin crease line.
- `b.combo([{ mode, specs }, ...], opts)`: several folds shown as one step, animated one after the other (used for the petal fold).
- `b.turnOver(text)`, `b.rotate(deg)` (silent).
- `b.custom({ text, shapes, next, frames, symbols, tricky })`: a hand-authored 3D step. `frames` are keyframes with the same shapes and point counts; `tricky: true` shows "tap to see the move".
- `b.finish(text)`: the final card. Its shapes become the model's thumbnail and finish card.

A facet is `{ pts, edges, face, tags, pid, links }`: `edges[i]` is `'edge'` (cut paper edge), `'fold'` (folded edge, drawn thick) or `'crease'` (drawn thin); `face` is `'front'` (the paper color) or `'back'` (white). Symbols: `{ t: 'valley' | 'mountain' | 'hidden' | 'cut', line | seg }`, `{ t: 'arrow', from, to, bend, tail: 'push' | 'open' | 'repeat', back }`, `{ t: 'turn', at }`, `{ t: 'rotate', at, deg }`.

Level lessons are in `src/models/lessons.js`, one or two cards per level in the same card format.

## Credits

- All diagrams, the icon and the UI are original drawings for this app. The two images in `reference/` were used only as style references.
- Models are traditional, public-domain designs. Sequences were checked against: origami-fun.com (cup, tulip, jumping frog, flapping bird, crane, lily), origami.me (fox, rabbit, dog, cup, tulip, jumping frog, crane, lily), origami.guide (fox, dog face), instructables.com (dog face), origami-resource-center.com and mancunion.com (waterbomb), and the paperkawaii rabbit diagram used as the style reference.
- The rose is a simplified version of the Kawasaki rose by Toshikazu Kawasaki (the twist-fold rose). The credit is shown on its first card. The Winson Chan diagram (1996) and the Wikipedia article on the Kawasaki rose were used as references.
- Fold symbols follow the Yoshizawa-Randlett system.

## Check before sharing publicly

- The rose is derived from the Kawasaki rose, a design by Toshikazu Kawasaki. The app credits him. Check whether a public release needs his estate's permission for a derived diagram.
- The 3D shaping steps of the swan, fox, rabbit, tulip, waterbomb, crane, flapping bird, lily and rose are hand-drawn approximations, not computed geometry. Fold them from paper once and compare.
- The lily's third and fourth petal folds and the rabbit's squash step are simplified. Compare them with a paper model.
- The reference images in `reference/` come from paperkawaii.com and a wikiHow-style sheet. They are not part of the app bundle, but they are in this repository. Remove them or confirm their licence before making the repository widely public.
- Paper sizes are rounded ("about 10 cm"). The custom-size drag is approximate by design.
