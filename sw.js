// sw.js - SELF-DESTRUCT WORKER
// This service worker instantly deletes all caches and unregisters itself 
// to permanently resolve ERR_FAILED and stuck-cache issues across all browsers.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Transparent passthrough.
  return;
});
