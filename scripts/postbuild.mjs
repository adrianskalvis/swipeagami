// After `vite build`: write dist/sw.js with the full precache list and
// point the manifest at the deployed base path.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const base = process.env.BASE_PATH || '/swipeagami/';
const dist = new URL('../dist/', import.meta.url).pathname;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(dist)
  .map((p) => relative(dist, p).split('\\').join('/'))
  .filter((f) => f !== 'sw.js' && !f.endsWith('.map'));
files.sort();
const hash = createHash('sha256');
for (const f of files) hash.update(f + ':' + readFileSync(join(dist, f)));
const cacheName = 'swipegami-' + hash.digest('hex').slice(0, 12);

const list = files.map((f) => (f === 'index.html' ? '' : f)).concat(['index.html']);
const sw = readFileSync(new URL('./sw-template.js', import.meta.url), 'utf8')
  .replace('__CACHE_NAME__', cacheName)
  .replace('__BASE__', base)
  .replace('__FILES__', JSON.stringify(list));
writeFileSync(join(dist, 'sw.js'), sw);

const manifestPath = join(dist, 'manifest.webmanifest');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.start_url = base;
manifest.scope = base;
manifest.id = base;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

// 404.html keeps deep links working on GitHub Pages.
writeFileSync(join(dist, '404.html'), readFileSync(join(dist, 'index.html'), 'utf8'));
console.log(`sw.js: ${list.length} files precached as ${cacheName}`);
