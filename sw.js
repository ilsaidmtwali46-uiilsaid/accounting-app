const CACHE_NAME = 'pos-app-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './db.js',
  './manifest.json',
  './icon.svg',
  './sales.html',
  './purchases.html',
  './treasury.html',
  './suppliers.html',
  './stock.html',
  './settings.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
