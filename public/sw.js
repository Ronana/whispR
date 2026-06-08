const CACHE = 'whispr-v2';
const STATIC_ASSETS = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Always network-first for HTML navigations (the app shell)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match('/') || caches.match(e.request))
    );
    return;
  }

  // Network-first for API and Supabase calls
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Cache-first for static assets (icons, fonts, etc.)
  if (STATIC_ASSETS.some(s => url.pathname === s) || url.pathname.startsWith('/icons/')) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }))
    );
    return;
  }

  // Everything else: network-first, no caching
  e.respondWith(fetch(e.request));
});
