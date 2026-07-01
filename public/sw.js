/* Service worker Opportix — installabilité PWA + cache de la coque + lecture hors-ligne.
   Stratégie "réseau d'abord" partout : en ligne on a toujours les données les plus récentes,
   le cache ne sert que de repli hors-ligne. Les écritures (POST/PUT) et le WebSocket ne sont
   jamais interceptés — aucune donnée live n'est servie périmée quand le réseau est présent. */
const CACHE = 'opportix-shell-v1';
const API_CACHE = 'opportix-api-v1';
const SHELL = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = [CACHE, API_CACHE];
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                    // jamais les écritures (PUT/POST)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // tiers : laisser passer
  if (url.pathname.startsWith('/socket.io')) return;   // WebSocket : jamais en cache

  if (url.pathname.startsWith('/api')) {
    // API en lecture (GET) : réseau d'abord, on garde une copie pour le hors-ligne.
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(API_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req)) // hors-ligne : dernière réponse connue (ou undefined)
    );
    return;
  }

  // Coque statique : réseau d'abord, repli sur le cache puis index.html hors-ligne.
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
