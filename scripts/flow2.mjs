// Dev helper: swipe through a whole model, then the finish and "same paper" cards; open a level-2 model to see lessons.
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] || 'http://localhost:5173/swipeagami/';
const out = process.argv[3] || '/tmp/flow2';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
// Seed storage: launched, paper chosen, swan done at step 10.
await page.evaluate(() => localStorage.setItem('swipegami.v1', JSON.stringify({ launched: true, paper: { type: 'origami', w: 15, h: 15, color: 'blue' }, completed: {}, lastStep: { swan: 9 }, lessonsSeen: {}, swipeHintDone: true, installHintDone: true })));
await page.goto('about:blank');
await page.goto(url + '#m/swan', { waitUntil: 'networkidle' });
await page.waitForSelector('.stepscreen');
await page.waitForTimeout(400);
const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });
await shot('01-resume-step10');
const box = await page.locator('.deck').boundingBox();
const swipe = async (dx) => {
  const x0 = box.x + box.width / 2, y0 = box.y + box.height / 2;
  await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(x0 + (dx * i) / 8, y0);
  await page.mouse.up();
  await page.waitForTimeout(450);
};
await swipe(-220); await shot('02-step11');
await swipe(-220); await page.waitForTimeout(900); await shot('03-finish');
await swipe(-220); await shot('04-ask');
await page.click('.same');
await page.waitForSelector('.stepscreen');
await page.waitForTimeout(500);
await shot('05-cup-step1');
// Level 2 model with lessons.
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('swipegami.v1')); s.unlockedAll = true; localStorage.setItem('swipegami.v1', JSON.stringify(s)); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await shot('06-home-unlocked');
await page.click('.mcard >> nth=3');
await page.waitForSelector('.stepscreen');
await page.waitForTimeout(500);
await shot('07-lesson1');
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await page.waitForTimeout(1300);
await shot('08-lesson1-anim');
await page.waitForTimeout(4500);
await swipe(-220); await shot('09-lesson2');
await swipe(-220); await shot('10-fox-step1');
// Rectangular paper: prep steps.
await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('swipegami.v1')); s.paper = { type: 'a4', w: 21, h: 29.7, color: 'red' }; s.lastStep = {}; localStorage.setItem('swipegami.v1', JSON.stringify(s)); });
await page.goto('about:blank');
await page.goto(url + '#m/cup', { waitUntil: 'networkidle' });
await page.waitForSelector('.stepscreen');
await page.waitForTimeout(500);
await shot('11-prep1');
await swipe(-220); await shot('12-prep2');
await swipe(-220); await shot('13-prep3');
await swipe(-220); await shot('14-cup-step1-red');
await page.keyboard.press('Escape');
await page.waitForTimeout(600);
await shot('15-home-after-escape');
await browser.close();
console.log('done', out);
