// Offline check: load once, go offline, reload, open a model and the paper picker.
// Usage: node scripts/offline.mjs [baseUrl]   (needs the production build served, with sw.js)
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:4173/swipeagami/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${extra ? ' ' + extra : ''}`); if (!ok) failed++; };

await page.goto(base, { waitUntil: 'networkidle' });
// Wait for the service worker to install and precache everything.
const swState = await page.evaluate(async () => {
  if (!('serviceWorker' in navigator)) return 'unsupported';
  const reg = await navigator.serviceWorker.ready;
  await new Promise((r) => { if (reg.active && reg.active.state === 'activated') r(); else reg.active.addEventListener('statechange', () => reg.active.state === 'activated' && r()); });
  return reg.active ? reg.active.state : 'none';
});
check('service worker active after first load', swState === 'activated', swState);
const cached = await page.evaluate(async () => { const keys = await caches.keys(); const c = await caches.open(keys[0]); const reqs = await c.keys(); return { name: keys[0], count: reqs.length, urls: reqs.map((r) => new URL(r.url).pathname) }; });
check('precache holds every app file', cached.count >= 12, `${cached.count} entries in ${cached.name}`);
check('model data precached on first load', cached.urls.some((u) => /models-.*\.js$/.test(u)), cached.urls.filter((u) => u.includes('assets')).join(' '));

await ctx.setOffline(true);
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(500);
check('offline reload shows the app', (await page.locator('#app .screen').count()) >= 1);
// Deep link to a model while offline.
await page.goto('about:blank');
await page.goto(base + '#m/crane/12', { waitUntil: 'load' }).catch(() => {});
await page.waitForSelector('.stepscreen', { timeout: 8000 }).catch(() => {});
check('model opens offline', (await page.locator('.stepscreen').count()) === 1);
check('diagram rendered offline', (await page.locator('.card .diagram svg path').count()) > 5);
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
await page.click('.chip.paper');
await page.waitForSelector('.picker');
check('paper picker works offline', (await page.locator('.pcard').count()) === 7);
check('no page errors offline', errors.length === 0, errors.join('; '));
await browser.close();
console.log(failed ? `${failed} offline checks failed` : 'all offline checks passed');
process.exit(failed ? 1 : 0);
