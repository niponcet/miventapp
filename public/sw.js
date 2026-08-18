/// <reference lib="webworker" />

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `miventapp-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `miventapp-dynamic-${CACHE_VERSION}`;

/**
 * Assets estáticos que se pre-cachean durante la instalación.
 */
const PRECACHE_ASSETS = [
  '/ventapp',
  '/ventapp/inventario',
  '/ventapp/analitica',
  '/manifest.json',
  '/icons/icon.svg',
  '/favicon.ico',
];

// ─── Instalación ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Pre-cache warning:', err))
  );
});

// ─── Activación y limpieza de caches obsoletos ─────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Intercepción de Peticiones Fetch ──────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no sean GET o que sean hacia la API de Supabase
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/supabase') || url.hostname.includes('supabase.co')) {
    return;
  }

  // 1. Assets estáticos (_next/static, fonts, icons, images) -> Cache-First con actualización de fondo
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.includes('fonts.googleapis.com') ||
    url.pathname.includes('fonts.gstatic.com') ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Navegación HTML -> Network-First con fallback al cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;

          // Fallback a la vista principal offline
          return caches.match('/ventapp');
        })
    );
    return;
  }

  // 3. Demás peticiones -> Network con fallback a cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
