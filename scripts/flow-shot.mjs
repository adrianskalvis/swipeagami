// Dev helper: walk the first-launch flow and screenshot each screen.
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] || 'http://localhost:5173/swipeagami/';
const out = process.argv[3] || '/tmp/flow';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('CONSOLE', m.type(), m.text()); });
const shot = (name) => page.screenshot({ path: `${out}/${name}.png` });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('01-splash');
await page.waitForSelector('.picker', { timeout: 5000 });
await page.waitForTimeout(300);
await shot('02-picker-paper');
await page.click('.pcard >> nth=0');
await page.waitForTimeout(300);
await shot('03-picker-color');
await page.click('.swatch >> nth=1');
await page.waitForTimeout(300);
await shot('04-picker-size');
await page.click('.primary');
await page.waitForSelector('.stepscreen');
await page.waitForTimeout(500);
await shot('05-step1');
// swipe left
const box = await page.locator('.deck').boundingBox();
const swipe = async (dx) => {
  const x0 = box.x + box.width / 2, y0 = box.y + box.height / 2;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(x0 + (dx * i) / 8, y0, { steps: 1 });
  await page.mouse.up();
  await page.waitForTimeout(450);
};
await swipe(-200);
await shot('06-step2');
await swipe(-200);
await shot('07-step3');
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await page.waitForTimeout(1200);
await shot('08-step3-anim');
await page.waitForTimeout(4000);
// swipe down → home
const x0 = box.x + box.width / 2, y0 = box.y + box.height / 3;
await page.mouse.move(x0, y0); await page.mouse.down();
for (let i = 1; i <= 8; i++) await page.mouse.move(x0, y0 + (220 * i) / 8);
await page.mouse.up();
await page.waitForTimeout(700);
await shot('09-home');
await page.click('.settings');
await page.waitForTimeout(400);
await shot('10-settings');
await browser.close();
console.log('done', out);
