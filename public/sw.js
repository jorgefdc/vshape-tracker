// V Shape Tracker offline shell. No application data is stored here: workout data remains in localStorage.
const CACHE = 'vshape-app-v3';
const PRECACHE = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];
const sameOrigin = url => new URL(url, self.location.origin).origin === self.location.origin;

async function precacheApplication() {
  const cache = await caches.open(CACHE);
  // Discover the fingerprinted Vite assets from the compiled HTML, not from source index.html.
  const response = await fetch('/', { cache: 'reload' });
  if (!response.ok) throw new Error('Could not fetch app shell');
  const html = await response.clone().text();
  await cache.put('/', response);
  const urls = [...new Set([...html.matchAll(/(?:src|href)=["'](\\/assets\\/[^"']+)["']/g)].map(m => m[1]))];
  await Promise.all([...PRECACHE.slice(1), ...urls].map(async path => {
    try {
      const res = await fetch(path, { cache: 'reload' });
      if (res.ok) await cache.put(path, res);
    } catch (err) { console.warn('Offline precache:', path, err); }
  }));
}
self.addEventListener('install', event => {
  event.waitUntil(precacheApplication().then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('vshape-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || !sameOrigin(req.url)) return;
  const url = new URL(req.url);
  if (url.pathname === '/sw.js') return; // Always allow the browser to update this file.

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) {
          const cache = await caches.open(CACHE);
          await cache.put('/', res.clone());
        }
        return res;
      } catch {
        return (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }
  // Assets are cache-first to keep the JS/CSS from the same successful build available offline.
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res.ok) {
        const cache = await caches.open(CACHE);
        event.waitUntil(cache.put(req, res.clone()));
      }
      return res;
    } catch {
      // Never return HTML for a JS/CSS request: that produces confusing script errors.
      return Response.error();
    }
  })());
});
