const CACHE_NAME = 'weather-app-v15';
const STATIC_ASSETS = [
  '/weather-demo/',
  '/weather-demo/index.html',
  '/weather-demo/style.css',
  '/weather-demo/app.js',
  '/weather-demo/manifest.json',
  '/weather-demo/icons/icon-192.png',
  '/weather-demo/icons/icon-512.png',
];

// Install — cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first for API calls, cache first for static assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API calls: always go to network (weather, Wikipedia, Wikimedia)
  if (url.hostname !== location.hostname) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Same-origin static assets: cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
