// BigBite Staff POS PWA Service Worker
const CACHE_NAME = 'bigbite-staff-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512-maskable.png',
  '/icons/apple-touch-icon.png'
];

// 1. Install Event: Precache static core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Remove previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Smart routing & caching
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Prevent caching requests that do not start with http or https (such as chrome-extension://)
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // Skip non-GET, WebSockets, SSE, and live realtime synchronization
  if (request.method !== 'GET') return;
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;
  if (url.pathname.includes('/socket.io/')) return;
  // Realtime orders must never be stale
  if (url.pathname.includes('get_live_orders') || url.pathname.includes('get_kitchen_orders')) {
    return;
  }

  // Strategy A: HTML Navigation (SPA routes like /kitchen, /rider, /live-orders)
  // Network-First, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Strategy B: Static Assets (JS, CSS, Images, Fonts)
  // Stale-While-Revalidate (Instant UI rendering from cache)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
