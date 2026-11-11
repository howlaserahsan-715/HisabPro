/* HisabPro service worker — app-shell caching + offline support */
const VERSION = 'hisabpro-v1.2.0';
const ASSET_VERSION = '1.2.0';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css?v=' + ASSET_VERSION,
  './css/print.css?v=' + ASSET_VERSION,
  './js/i18n.js?v=' + ASSET_VERSION,
  './js/seed.js?v=' + ASSET_VERSION,
  './js/core.js?v=' + ASSET_VERSION,
  './js/views.js?v=' + ASSET_VERSION,
  './js/actions.js?v=' + ASSET_VERSION,
  './manifest.webmanifest?v=' + ASSET_VERSION,
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // Navigation requests: network-first, fall back to cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Static assets: network-first so updates appear immediately, cache for offline.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || Response.error()))
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
