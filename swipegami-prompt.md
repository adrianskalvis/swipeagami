# Swipegami: build brief for Claude Code

Build **Swipegami**, a mobile-first, offline web app that teaches origami one step at a time with swipe gestures. Build the whole thing in this run, test it, and publish it to GitHub Pages. Don't stop to ask questions: make sensible choices and list them in your final summary.

---

## 1. The idea

Origami videos and apps need internet and are cluttered. Swipegami works on a bus with no signal. You open the site once in Safari and add it to the Home Screen. From then on it opens full-screen like a native app and works fully offline.

You pick the paper you have, then fold models step by step. Each screen shows one big, clear diagram, and you swipe left for the next step. Models are grouped into five levels, starting with a swan and ending with a rose as the final challenge. Progression hooks you, but you can always skip it.

The app is for anyone, beginners first. Everything must feel simple, calm and fast.

---

## 2. Hard requirements

- **Stack:** static PWA built with vanilla HTML/CSS/JS (ES modules), with Vite for the build. Use no UI framework, no runtime CDNs and no external web fonts.
- **Fully offline after the first visit:** the service worker precaches every app file and all model data on first load, not lazily. Any model must open in airplane mode.
- **Feels native on iPhone Safari and Android Chrome:**
  - Web app manifest with `display: standalone`, plus theme color and icons.
  - `apple-mobile-web-app-capable`, status-bar style and `apple-touch-icon`.
  - `viewport-fit=cover`, with safe-area insets respected.
  - `overscroll-behavior: none`, so there's no pull-to-refresh and no page rubber-banding.
  - No double-tap zoom, no text selection and no tap highlight on the UI.
  - No layout shift.
  - Check current iOS home-screen web app behavior and follow it.
- **Nothing in the way:** no accounts, cookies, analytics or consent banners, and no permission prompts of any kind (notifications, location, etc.).
- **One install hint only:** in Safari browser mode, but not when the app is opened from the Home Screen, show "Add to Home Screen to fold offline" once. It must be dismissible and never shown again.
- **Progress stays on the device:** use `localStorage` wrapped in try/catch. Store completed models, unlocked levels, the last step per model and the paper choice. The app must still work if storage fails.
- **Performance targets:**
  - First load under ~150 KB gzipped, excluding model data.
  - Interactive in under 1 s on 4G.
  - Swipes at 60 fps.
  - Lighthouse mobile scores of at least 95 for performance, accessibility and best practices.
- **Language:** English UI.

---

## 3. Look and feel

### UI: minimal, Japanese-inspired, black and white
- Warm off-white paper-tone background (like washi), ink-black text, lots of empty space and thin hairline rules.
- Small, quiet text: system font stack, light or regular weights, letter-spaced small-caps labels.
- One accent color, a red like a hanko seal, used sparingly.
- No visible buttons on the step screen.

### Diagrams: clean traditional-diagram style
- Match the style of `reference/rabbit-style.png`, the main style reference. `reference/bird-steps.png` shows the kind of numbered step content.
- **Draw everything originally.** The reference images are for style only. Do not copy or trace any existing diagram.
- **Paper:** flat shapes with thin black outlines (about 1.5–2 px at phone size) and a very subtle gradient for a paper feel.
- **Colors:** the front of the paper is the user's chosen color and the back is white. Use a slightly darker shade for inner or folded-under layers so layers stay readable.
- **Cards:** each step sits on a light grey card.
- **Symbols:** use the standard origami symbol set (Yoshizawa–Randlett), simplified:
  - Valley fold: black dashed line plus a curved arrow with a solid head.
  - Mountain fold: red dash-dot line plus an arrow with a hollow or half head, going behind.
  - Fold and unfold: an arrow going there and back.
  - Turn over: a loop of two curved arrows.
  - Inside reverse fold or push in: an arrow with a tail mark.
  - Squash or open: an arrow with an open-sign.
  - Hidden edges: dotted line.
- **Simpler than the reference:** use one arrow per step, two at most. The fold line and arrow are big and bold so the move is obvious at a glance.
- **Paper colors offered:** red, yellow, blue, green, orange and white. Diagrams render in the chosen color.

---

## 4. Screens and flow

### First launch
1. A short splash with the name.
2. One line: "Let's fold your first swan."
3. The paper picker.
4. Swan step 1, with a one-time swipe hint (an animated hand moving left). The hint disappears after the first swipe.

**The swan is always the first model. Do not change this.**

### Paper picker (2–3 taps, no maths)
**Tap 1: what paper do you have?** Show large cards, each drawn roughly to scale next to a phone outline:
- Origami paper, 15 × 15 cm
- Small origami paper or sticky note, ~7.5 × 7.5 cm
- A4 printer paper, 21 × 29.7 cm
- US Letter, 21.6 × 27.9 cm
- Receipt (a long strip, ~8 cm wide)
- Gum wrapper (tiny, ~5–7 cm)
- Something else: drag a square to roughly match the paper.

**Tap 2: paper color.**

**Then show one approximate number**, for example "Your swan will be about 10 cm long." Compute it from each model's finished-size ratio.

Special cases:
- **Rectangular paper:** the model starts with a short "Make it square" sequence (fold a corner to the opposite edge, then tear or cut off the strip). Skip this for models that start from a rectangle, like the jumping frog.
- **Paper too small:** each model has a minimum paper size. Below it, show a soft warning but still allow folding.
- **Next model:** when starting a new model after finishing one, ask "Same paper?" with two choices, Same or Change. One tap.

### Home (the path)
- A vertical scroll showing the 5 levels as a path. Each level shows its name, the new move it teaches, and model cards with a small drawing of the finished model.
- Finished models get a small red hanko-style stamp.
- Locked levels are faded, with a tiny lock.
- At the top: the app name in small type and a chip showing the current paper (tap it to change).
- A quiet settings sheet behind a small icon, containing:
  - "Unlock all levels" (skips progression)
  - "Reset progress" (asks for confirmation first)
  - Default paper
- Opening a model resumes at the step where the user left off.

### Step screen (the most important screen)
**Layout**
- Full screen, one step at a time. The diagram fills most of the screen, with the big fold symbol drawn over it.
- Top corner: a small black step counter, like "3 / 10".
- Bottom: one short instruction line of about 8 words at most, for example "Fold the edges to the center."

**Gestures (no buttons)**
- **Swipe left** (finger moves right to left): next step.
- **Swipe right** (finger moves left to right): previous step.
- Movement is free in both directions. Nothing is locked and there are no "Done" buttons.
- **Swipe down:** back to Home. The card shrinks back into its model card.
- **Tap:** plays that step's fold animation (2–3 s, loops twice, then stops).
- Tricky steps (squash, reverse, petal, pull-out, twist, or anything that goes 3D) show a faint "tap to see the move" under the text.

**Motion**
- The card follows the finger 1:1, then snaps with a soft spring of about 250 ms.
- It advances if dragged past ~25% of the screen width or flicked fast. Otherwise it snaps back.
- Add a rubber-band effect at the first and last step.
- Respect `prefers-reduced-motion`.
- Support arrow keys and Escape for desktop testing.

**Finishing a model**
- Reaching the last step marks the model as finished.
- Swiping left from the last step shows the finish card: the finished model, the red stamp landing, and "Next: Cup".
- Swiping left again shows "Same paper?" and then starts the next model.

### Level lessons
- Each level opens with 1–2 lesson cards in the same swipe format. They teach the level's new move with an animation, for example what a valley fold looks like compared with a mountain fold.
- Users can skip them by swiping past.

---

## 5. Levels and models

Use **traditional (public-domain) models**.

**Unlock rule:** finishing any one model in a level unlocks the next level. "Unlock all levels" overrides this.

| Level | New moves | Models, in order |
|---|---|---|
| 1 Starter | valley & mountain folds, turn over, kite fold | **Swan**, Cup, Dog face |
| 2 Beginner | waterbomb base, folding from a rectangle | Fox, Tulip, Jumping frog |
| 3 Intermediate | squash fold, inside reverse fold, inflating | Rabbit, Waterbomb balloon |
| 4 Advanced | square base, petal fold, bird base, frog base | Flapping bird, Crane, Lily |
| 5 Expert (final boss) | twist folds, curling petals | **Rose** |

**Research before drawing:**
- Look at beginner origami courses and traditional diagrams online to confirm this order and each model's standard folding sequence.
- **Cross-check every model's sequence against at least two independent sources before drawing it.**
- Minor reordering within levels is fine, but the swan stays first and the rose stays last.

**Rose:** prefer a traditional design. If the best rose has a known creator (for example the Kawasaki rose), credit them on the model's first card and in the README. Also list it under "Check before sharing publicly".

### Swan reference sequence (must be perfect)
1. Start with a square, colored side down, turned as a diamond.
2. Fold in half corner to corner, then unfold, making a vertical center crease.
3. Fold the two lower edges to the center crease. This makes a kite.
4. Turn over.
5. Fold the two lower edges to the center crease again.
6. Fold the bottom point up to the top point. This becomes the neck.
7. Fold the tip of the neck down a little. This becomes the head.
8. Mountain-fold in half along the center, sides going back.
9. Pull the neck up away from the body and pinch it in place. This is a tricky step and needs an animation.
10. Pull the head forward a little. This is also a tricky step.
11. The finished swan.

Verify this sequence against sources like every other model, but keep it this simple.

---

## 6. How to draw the diagrams (accuracy matters most)

**Store each model as data** (a JSON or JS module) with these fields:
- `id`, `name`, `level`, `base`, `minPaperCm`, `finishedSizeRatio`
- `steps[]`, where each step has:
  - `text`
  - `shapes`: polygons with front/back face color and layer order
  - `symbols`: fold lines and arrows
  - `tricky`: true or false
  - `animation`

**Compute the geometry instead of eyeballing it.**
- Write small helpers: reflect points across a fold line, and split a polygon by a line.
- Generate each step's shapes from the previous step's shapes, so every step starts exactly where the last one ended.
- Use coordinates in a 0–100 unit square.

**Animating flat folds** (valley and mountain): a flap rotating around its fold line, seen from above, is the flap scaled along the fold's normal from +1 to −1. Switch the visible face color at 0.

**Animating complex folds** (squash, reverse, petal, pull-out and twist):
- Author 3–5 keyframes and tween the polygon points between them.
- Add a small side view whenever it makes the 3D movement clearer. These "fold it up and forward" moments are exactly what confuses beginners.

**Rules for every step**
- Introduce one new move per step, never two. Split a confusing move into extra steps rather than adding arrows.
- Each step's text and drawing must agree.

---

## 7. Build order (all in this run)
1. Scaffold the PWA, design tokens, Home, paper picker, the step screen with gestures, storage and offline support.
2. Write the diagram helpers and finish the swan completely. Check it end to end before continuing.
3. Add the remaining models level by level, plus the level lessons.
4. Create the icons (a simple, original paper-fold mark in ink black and seal red), manifest and splash.
5. Run the checks in section 8.
6. Publish.

---

## 8. Checks before you finish
- **Visual check with Playwright** at iPhone size (390 × 844) and a small Android size (360 × 780). If the network blocks Playwright's browser download, use Puppeteer with Chrome for Testing instead:
  - Screenshot every step of every model and look at each screenshot.
  - Fix anything unclear, cropped or overlapping, and anything that doesn't match the step before it.
- **Gestures:** simulate swipes and taps. Swipe left, swipe right, swipe down and tap all work, snapping feels right, and there's no accidental page scroll or zoom.
- **Offline:** load the app once, go offline, reload, and open any model. Everything must work.
- **Lighthouse mobile:** performance, accessibility and best practices all at least 95.
- **First launch** lands on swan step 1.
- **Final summary:** list any step you are not fully sure is correct.

---

## 9. Publish
- This runs in a Claude Code cloud session. The public repo `swipegami` already exists on GitHub and contains this brief and the `reference/` images. GitHub Pages is already set to deploy from GitHub Actions.
- Add a GitHub Actions workflow that builds the app and deploys it to GitHub Pages on every push to `main`. Set Vite's `base` and the manifest's `start_url` and `scope` so the app works under `/swipegami/`.
- When every check passes, push the finished work to `main` so it deploys. If pushing to `main` isn't possible, push your branch and say so in the summary.
- Never commit tokens or secrets.
- Write a README covering:
  - What the app is
  - How to run it locally
  - How to add a model (the data format)
  - Credits
  - A "Check before sharing publicly" section
- End with the live URL (`https://<owner>.github.io/swipegami/`) and a 3-line note on how to install the app on an iPhone.
