// Service Worker – Kickr Training PRO
// CACHE_KEY wird beim Deploy automatisch durch GitHub Actions ersetzt
const CACHE = 'kickr-BUILD_TIMESTAMP';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // index.html und Root immer frisch vom Netzwerk — nie aus Cache
  if (e.request.url.includes('index.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() => caches.match('/index.html'))
    );
    return;
  }
  // Cache-first für Assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
