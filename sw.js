// ============================================================
// sw.js — Self-Destruct Sequence
// ============================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing self-destruct worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] Unregistering service worker...');
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});
