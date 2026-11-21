// MyGirivalam Service Worker v2
// Strategies:
//  - App shell (HTML + Vite assets): network-first, fall back to cache
//  - Map tiles (CARTO / Esri / MapTiler): cache-first, fetch & cache on miss, max 600 tiles
//  - Everything else: network-only (Supabase API, auth, etc.)

const APP_CACHE  = 'gv-app-v3';
const TILE_CACHE = 'gv-tiles-v4';
const MAX_TILES  = 600;

// Tile CDN patterns
// Tile CDN patterns. OpenStreetMap's volunteer servers (tile.openstreetmap.org,
// tile.openstreetmap.fr) are deliberately absent: their Tile Usage Policy
// forbids app basemaps and bulk/offline tile caching, and they block clients
// that do it. Basemaps come from CDNs built for app traffic instead.
const TILE_HOSTS = [
  'basemaps.cartocdn.com',
  'server.arcgisonline.com',
  'arcgisonline.com',
  'api.maptiler.com',
];

// Static app-shell assets cached at install time
const APP_SHELL = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== APP_CACHE && k !== TILE_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Map tiles: cache-first
  if (TILE_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(handleTile(request));
    return;
  }

  // Skip Supabase, auth, and external APIs — never intercept
  if (
    url.hostname.includes('supabase') ||
    url.hostname.includes('googleapis') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // App shell / Vite assets / navigation: network-first with cache fallback
  event.respondWith(handleApp(request, url));
});

// ─── Tile handler: cache-first, evict LRU when full ─────────────────────────

// Pre-built transparent 1×1 PNG as Uint8Array (used when offline and not cached)
const TRANSPARENT_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
function transparentPng() {
  const str   = atob(TRANSPARENT_PNG_B64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return new Response(bytes, { status: 200, headers: { 'Content-Type': 'image/png' } });
}

async function handleTile(request) {
  const cache = await caches.open(TILE_CACHE);

  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    // Fetch the tile URL without inheriting the original img request's no-cors mode
    // so we get a readable (non-opaque) response that can be stored in Cache API.
    const tileReq = new Request(request.url, {
      method:         'GET',
      credentials:    'omit',       // tiles need no credentials
      referrerPolicy: 'no-referrer',
    });
    const response = await fetch(tileReq);
    if (response && response.status === 200) {
      // Evict oldest tile when at capacity (simple LRU)
      const keys = await cache.keys();
      if (keys.length >= MAX_TILES) {
        await cache.delete(keys[0]);
      }
      // Cache against the original URL so it matches future img requests
      cache.put(request.url, response.clone());
    }
    return response;
  } catch {
    // Offline and not cached — return transparent 1×1 PNG so Leaflet shows grey
    return transparentPng();
  }
}

// ─── App handler: network-first, fall back to cache or index.html ────────────

async function handleApp(request, url) {
  const cache = await caches.open(APP_CACHE);

  try {
    const response = await fetch(request.clone());
    // Cache successful same-origin responses (JS/CSS/HTML)
    if (response.ok && (url.origin === self.location.origin || response.type === 'basic')) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline fallback
    const cached = await cache.match(request);
    if (cached) return cached;

    // SPA fallback: any navigation request → serve cached index.html
    if (request.mode === 'navigate') {
      const index = await cache.match('/') || await cache.match('/index.html');
      if (index) return index;
    }

    return new Response('Offline — please reconnect to continue.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
