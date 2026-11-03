// CRYPTO HUNTERS service worker: makes the site installable and opens the last seen version of a page without a network.
// Pages are always taken from the network first (so updates show at once); the copy in the cache is only a fallback.
// Requests to exchanges and other sites are not touched.
const CACHE = "ch-pages-v1";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && (r.mode === "navigate" || /\.(html|js|css|png|svg|webmanifest)$/.test(u.pathname) || u.pathname.endsWith("/"))) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match(new URL("./", self.registration.scope).href) : undefined)).then(m => m || new Response("Offline", { status: 503 }))));
});
