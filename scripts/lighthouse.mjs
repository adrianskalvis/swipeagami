// Lighthouse mobile: performance, accessibility and best practices must each score 95 or more.
// Usage: node scripts/lighthouse.mjs [url]   (production build served over http)
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFileSync, mkdirSync } from 'node:fs';

const url = process.argv[2] || 'http://localhost:4173/swipeagami/';
const chromePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const chrome = await launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
const result = await lighthouse(url, {
  port: chrome.port,
  output: 'json',
  logLevel: 'error',
  onlyCategories: ['performance', 'accessibility', 'best-practices'],
  formFactor: 'mobile',
  screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false },
  throttlingMethod: 'simulate',
});
await chrome.kill();
mkdirSync('shots', { recursive: true });
writeFileSync('shots/lighthouse.json', result.report);
const cats = result.lhr.categories;
let failed = 0;
for (const k of ['performance', 'accessibility', 'best-practices']) {
  const score = Math.round(cats[k].score * 100);
  const ok = score >= 95;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${k}: ${score}`);
}
const a = result.lhr.audits;
console.log(`     FCP ${a['first-contentful-paint'].displayValue}, LCP ${a['largest-contentful-paint'].displayValue}, TBT ${a['total-blocking-time'].displayValue}, CLS ${a['cumulative-layout-shift'].displayValue}, TTI ${a['interactive'] ? a['interactive'].displayValue : 'n/a'}`);
for (const k of ['performance', 'accessibility', 'best-practices']) {
  const fails = cats[k].auditRefs.map((r) => a[r.id]).filter((x) => x && x.score !== null && x.score < 1 && x.scoreDisplayMode !== 'informative');
  if (fails.length) console.log(`     ${k} audits below 1:`, fails.map((x) => `${x.id} (${Math.round((x.score || 0) * 100)})`).join(', '));
}
process.exit(failed ? 1 : 0);
