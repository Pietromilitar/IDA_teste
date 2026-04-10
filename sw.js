const CACHE = 'codepad-v2';
const STATIC = [
  '/', '/index.html', '/style.css', '/app.js', '/manifest.json', '/site.webmanifest',
  '/favicon.ico', '/favicon-16x16.png', '/favicon-32x32.png',
  '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => cached || new Response('Offline', {headers:{'Content-Type':'text/plain'}}));
    })
  );
});
