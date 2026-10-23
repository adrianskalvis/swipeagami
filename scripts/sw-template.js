// Swipegami service worker. Precaches every app file and all model data on install.
const CACHE = '__CACHE_NAME__';
const BASE = '__BASE__';
const FILES = __FILES__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES.map((f) => BASE + f))).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Navigations always get the app shell, so deep links and reloads work offline.
  if (req.mode === 'navigate') {
    event.respondWith(caches.match(BASE + 'index.html', { ignoreVary: true }).then((r) => r || fetch(req)));
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true, ignoreVary: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
