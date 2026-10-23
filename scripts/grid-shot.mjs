// Dev helper: screenshot the step grid of a model. Usage: node scripts/grid-shot.mjs <url> <out.png> [frame-t]
import { chromium } from 'playwright';

const [url, out, frameT] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 2600 }, deviceScaleFactor: 1.5 });
page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
if (frameT) {
  await page.evaluate((t) => window.__showFrame && window.__showFrame(parseFloat(t)), frameT);
  await page.waitForTimeout(100);
}
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('wrote', out);
