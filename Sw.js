const CACHE_NAME = 'kara-voice-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.jpg',
  './icon-512.png',
  './KARAVOICE_ROUGE_ET_VERT.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Ne pas cacher les blob: (videos locales)
  if (e.request.url.startsWith('blob:')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // cache dynamique pour les petites ressources
        if (res.ok && e.request.method === 'GET' && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
