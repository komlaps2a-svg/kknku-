const CACHE_NAME = 'kknku-pro-v1';
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Instalasi & Caching Aset Inti
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
});

// Pembersihan Cache Usang
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Strategi Stale-While-Revalidate untuk performa instan & offline
self.addEventListener('fetch', (event) => {
    // Abaikan request non-GET (seperti POST, PUT)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Hanya cache request yang valid dan berasal dari skema http/https
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return cache jika offline, abaikan error fetch
            });

            // Return cache secara instan jika ada, atau tunggu response jaringan jika kosong
            return cachedResponse || fetchPromise;
        })
    );
});
