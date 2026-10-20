/* Public offline fallback only. Application requests and personal data are never cached. */
const ROOT = new URL('./', self.location.href);
const CACHE = `be-smile-public-${ROOT.pathname}-2026-smile-disc-v1`;
const OFFLINE = new URL('offline.html', ROOT).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add(OFFLINE)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(`be-smile-public-${ROOT.pathname}-`) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname) || request.mode !== 'navigate' || url.pathname.includes('/api/')) return;
  event.respondWith(fetch(request).catch(async () => {
    const fallback = await caches.match(OFFLINE);
    return fallback || new Response('Be Smile — connect to the internet and try again.', {status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  }));
});
