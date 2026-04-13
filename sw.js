// ============================================================
// sw.js — CreatorHub Service Worker
// Handles: caching, offline fallback, push notifications
// ============================================================

const CACHE_NAME = 'creatorhub-v1.3.1';
const OFFLINE_URL = '/404.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/explore.html',
  '/products.html',
  '/profile.html',
  '/become-seller.html',
  '/orders.html',
  '/request.html',
  '/seller.html',
  '/admin.html',
  '/404.html',
  '/css/main.css',
  '/css/home.css',
  '/css/explore.css',
  '/css/products.css',
  '/css/forms.css',
  '/css/orders.css',
  '/css/seller.css',
  '/css/admin.css',
  '/js/data.js',
  '/js/auth.js',
  '/js/home.js',
  '/js/explore.js',
  '/js/products.js',
  '/js/profile.js',
  '/js/nav.js',
  '/js/pwa.js',
  '/icon-192.png',
  '/icon-512.png',
];

// ——— Install: Pre-cache static assets ———
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Add assets individually so one failure doesn't break all caching
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// ——— Activate: Clean up old caches ———
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ——— Fetch: Cache-first for same-origin, network-first for external ———
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // External resources (fonts, avatars): network with cache fallback
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then(res => res || new Response('', { status: 504, statusText: 'Gateway Timeout' })))
    );
    return;
  }

  // Same-origin: Cache-first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          // Cache the fresh response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (request.destination === 'document') {
            return caches.match(OFFLINE_URL).then(cachedOffline => {
              return cachedOffline || new Response('<html><body><h2>Offline - Site cannot be reached</h2><p>Please check your connection and refresh.</p></body></html>', { headers: { 'Content-Type': 'text/html' }});
            });
          }
          return new Response('', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});

// ——— Push Notifications ———
self.addEventListener('push', (event) => {
  let data = {
    title: 'CreatorHub',
    body: 'You have a new update.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    tag: 'creatorhub',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: { url: data.url },
      tag: data.tag,
      renotify: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: '👀 View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

// ——— Notification Click ———
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});

// ——— Background Sync (future: retry failed orders) ———
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    // Placeholder for future order sync logic
    console.log('[SW] Background sync: sync-orders');
  }
});
