// Visual check: screenshot every step of every model at iPhone (390x844) and small Android (360x780) sizes,
// plus one contact sheet per model and size for review.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { MODELS, ORDER } from '../src/models/index.js';

const base = process.argv[2] || 'http://localhost:4173/swipeagami/';
const out = process.argv[3] || 'shots';
mkdirSync(out, { recursive: true });

const sizes = [
  { name: 'iphone', width: 390, height: 844 },
  { name: 'android', width: 360, height: 780 },
];
const list = ORDER.map((id) => ({ id, steps: MODELS[id].steps.length }));

const browser = await chromium.launch();
const summary = [];
const errors = [];
for (const size of sizes) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${size.name}: ${e.message}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('swipegami.v1', JSON.stringify({ launched: true, paper: { type: 'origami', w: 15, h: 15, color: 'red' }, completed: {}, lastStep: {}, lessonsSeen: { 1: true, 2: true, 3: true, 4: true, 5: true }, swipeHintDone: true, installHintDone: true, unlockedAll: true })));
  for (const { id, steps } of list) {
    const files = [];
    for (let i = 1; i <= steps; i++) {
      await page.goto('about:blank');
      await page.goto(`${base}#m/${id}/${i}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.stepscreen');
      await page.waitForTimeout(100);
      const file = `${out}/${size.name}-${id}-${String(i).padStart(2, '0')}.png`;
      await page.screenshot({ path: file });
      files.push(file);
    }
    summary.push({ size: size.name, id, steps, files });
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 2));
if (errors.length) { console.error('PAGE ERRORS', errors); process.exit(1); }
console.log('screenshots written:', summary.reduce((n, s) => n + s.steps, 0), 'in', out);
