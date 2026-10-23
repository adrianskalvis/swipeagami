// Gesture check: swipe left, swipe right, swipe down, tap, snap-back, rubber band, keyboard.
// Also confirms no page scroll or zoom happens. Usage: node scripts/gestures.mjs [baseUrl]
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4173/swipeagami/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' ' + extra : ''}`); if (!ok) failed++; };

await page.goto(base, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.setItem('swipegami.v1', JSON.stringify({ launched: true, paper: { type: 'origami', w: 15, h: 15, color: 'green' }, completed: {}, lastStep: {}, lessonsSeen: { 1: true }, swipeHintDone: false, installHintDone: true })));
await page.goto('about:blank');
await page.goto(base + '#m/swan', { waitUntil: 'networkidle' });
await page.waitForSelector('.stepscreen');
await page.waitForTimeout(200);

const counter = () => page.locator('.counter').textContent();
const box = await page.locator('.deck').boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
const drag = async (dx, dy, steps = 10, fast = false) => {
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(cx + (dx * i) / steps, cy + (dy * i) / steps); if (!fast) await page.waitForTimeout(12); }
  await page.mouse.up();
  await page.waitForTimeout(420);
};

check('starts at step 1', (await counter()) === '1 / 11', await counter());
check('swipe hint shown once', (await page.locator('.swipehint').count()) === 1);
await drag(-200, 0);
check('swipe left -> next', (await counter()) === '2 / 11', await counter());
check('swipe hint gone after first swipe', (await page.locator('.swipehint').count()) === 0);
await drag(200, 0);
check('swipe right -> previous', (await counter()) === '1 / 11', await counter());
await drag(-40, 0);
check('short drag snaps back', (await counter()) === '1 / 11', await counter());
await drag(-70, 0, 3, true);
check('fast flick advances', (await counter()) === '2 / 11', await counter());
// Rubber band at the start: dragging right on step 1 moves the deck less than the finger.
await drag(200, 0);
await page.mouse.move(cx, cy); await page.mouse.down();
for (let i = 1; i <= 8; i++) await page.mouse.move(cx + (160 * i) / 8, cy);
const tx = await page.evaluate(() => getComputedStyle(document.querySelector('.deck')).transform);
await page.mouse.up(); await page.waitForTimeout(400);
const m = tx.match(/matrix\(([^)]+)\)/);
const shift = m ? parseFloat(m[1].split(',')[4]) : 0;
check('rubber band at first step', shift > 10 && shift < 100, `deck moved ${shift.toFixed(0)}px for 160px drag`);
// Tap plays the animation: symbols fade while playing.
await drag(-200, 0); await drag(-200, 0); // step 3 (kite fold)
await page.mouse.click(cx, cy);
await page.waitForTimeout(300);
check('tap plays animation', await page.evaluate(() => !!document.querySelector('.symbols.faded')));
await page.waitForTimeout(6000);
check('animation stops after two loops', await page.evaluate(() => !document.querySelector('.symbols.faded')));
// Keyboard.
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(400);
check('ArrowRight -> next', (await counter()) === '4 / 11', await counter());
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
check('ArrowLeft -> previous', (await counter()) === '3 / 11', await counter());
// No page scroll or zoom.
const scroll = await page.evaluate(() => [window.scrollX, window.scrollY, document.documentElement.scrollTop, document.body.scrollTop]);
check('no page scroll', scroll.every((v) => v === 0), JSON.stringify(scroll));
// Double taps on the body are swallowed by touch-action: manipulation; the step screen blocks pinch with touch-action: none.
await page.touchscreen.tap(cx, cy); await page.touchscreen.tap(cx, cy);
await page.waitForTimeout(300);
const vp = await page.evaluate(() => ({ scale: window.visualViewport ? window.visualViewport.scale : 1, bodyTouch: getComputedStyle(document.body).touchAction }));
check('no zoom after double tap', vp.scale === 1 && vp.bodyTouch === 'manipulation', JSON.stringify(vp));
const ta = await page.evaluate(() => getComputedStyle(document.querySelector('.stepscreen')).touchAction);
check('step screen touch-action none', ta === 'none', ta);
const ob = await page.evaluate(() => getComputedStyle(document.documentElement).overscrollBehavior || getComputedStyle(document.body).overscrollBehavior);
check('overscroll-behavior none', /none/.test(ob), ob);
// Swipe down -> home.
await drag(0, 220);
await page.waitForTimeout(500);
check('swipe down -> home', (await page.locator('.home').count()) === 1);
// Escape from a step goes home too.
await page.goto('about:blank');
await page.goto(base + '#m/cup', { waitUntil: 'networkidle' });
await page.waitForSelector('.stepscreen');
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
check('Escape -> home', (await page.locator('.home').count()) === 1);
// Progress persisted.
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('swipegami.v1')));
check('last step stored', stored.lastStep.swan === 2, JSON.stringify(stored.lastStep));
check('swipe hint flag stored', stored.swipeHintDone === true);
check('no page errors', errors.length === 0, errors.join('; '));
await browser.close();
console.log(failed ? `${failed} gesture checks failed` : 'all gesture checks passed');
process.exit(failed ? 1 : 0);
