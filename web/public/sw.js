const CACHE_NAME = 'shopmate-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    // Add other static assets if known, but Next.js hashes filenames so it's tricky. 
    // We will rely on runtime caching for those.
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // For now, network first, fallback to cache.
    // This ensures fresh data but allows partial offline for cached stuff.
    // For API calls (supabase), we let them fail or be handled by the app's persistent store.

    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
