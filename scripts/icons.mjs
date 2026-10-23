// Render the app icon (an original folded-corner mark) to PNG with Playwright.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const out = new URL('../public/icons/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const mark = (pad, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" fill="${bg}"/>
<g transform="translate(${pad} ${pad}) scale(${(64 - 2 * pad) / 64})">
<path d="M10 10h44v44H10z" fill="#f5f1e8" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M54 10v28L26 10z" fill="#c0392b" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M26 10l28 28" stroke="#1b1b1b" stroke-width="2.4" stroke-dasharray="4 3" stroke-linecap="round"/>
</g></svg>`;

writeFileSync(out + 'favicon.svg', mark(0, 'none'));

const browser = await chromium.launch();
const page = await browser.newPage();
const render = async (svg, size, file) => {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size }, omitBackground: true });
  writeFileSync(out + file, buf);
  console.log('wrote', file);
};
await render(mark(4, '#f5f1e8'), 512, 'icon-512.png');
await render(mark(4, '#f5f1e8'), 192, 'icon-192.png');
await render(mark(4, '#f5f1e8'), 180, 'apple-touch-icon.png');
await render(mark(12, '#f5f1e8'), 512, 'icon-maskable-512.png');
await browser.close();
