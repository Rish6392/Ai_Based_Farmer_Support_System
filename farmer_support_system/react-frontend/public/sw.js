// Service Worker with no caching
const CACHE_NAME = 'kisanSeva-v1';

// Install event 
self.addEventListener('install', (event) => {
  console.log('Service Worker installed.');
  self.skipWaiting();
});

// Activate event - Removed cache cleanup logic (can keep for version control/log)
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
  self.clients.claim();
});

// Fetch event - Only fetch from network, no cache storage
self.addEventListener('fetch', (event) => {
  // console.log('Intercepted request:', event.request.url);

  if (!event.request.url.startsWith('http')) {
    console.warn('Unsupported request scheme:', event.request.url);
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Fallback response if offline (can customize this or remove if not needed)
        return new Response("You are currently offline. Please check your connection.", {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

