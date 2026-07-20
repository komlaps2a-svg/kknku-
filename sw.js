// Ganti angka ini setiap kali Anda merilis update/perbaikan pada index.html atau aset lainnya
const APP_VERSION = '5'; 
const CACHE_NAME = `kknku-pro-v${APP_VERSION}`;

const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (event) => {
    // Memaksa SW baru segera terinstal tanpa menunggu halaman ditutup
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    // Hapus cache aset lama jika versinya (APP_VERSION) berbeda
                    // PERHATIAN: Ini tidak akan menghapus data localStorage pengguna
                    if (name.startsWith('kknku-pro-v') && name !== CACHE_NAME) {
                        return caches.delete(name); 
                    }
                })
            );
        })
    );
    // Langsung ambil alih kontrol jaringan halaman yang sedang terbuka
    self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Abaikan error fetch jika sedang offline
            });
            
            return cachedResponse || fetchPromise;
        })
    );
});

// Listener komunikasi antara SW dan index.html untuk proses skipWaiting paksa
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
