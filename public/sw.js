/* Service worker Opportix — installabilité PWA + cache de la coque statique.
   Conçu pour être SANS RISQUE sur les données : il ne touche jamais à /api,
   ni au WebSocket (/socket.io), ni aux requêtes non-GET (sauvegardes). Stratégie
   "réseau d'abord" pour le reste : on a toujours le code le plus récent en ligne,
   et la coque sert seulement de repli hors-ligne. */
const CACHE = 'opportix-shell-v1';
const SHELL = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return; // jamais les sauvegardes (PUT/POST)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // tiers : laisser passer
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return; // données live : jamais en cache

  // Réseau d'abord ; en cas d'échec (hors-ligne), repli sur le cache puis la coque.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match('/index.html')))
  );
});
