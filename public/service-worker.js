const CACHE_NAME = "aegis-dashboard-v5";

const BASE_PATH = new URL(self.registration.scope).pathname;

const STATIC_ASSETS = [
  BASE_PATH,
  `${BASE_PATH}site.webmanifest`,
  `${BASE_PATH}favicon.ico`,
  `${BASE_PATH}apple-touch-icon.png`,
  `${BASE_PATH}android-chrome-192x192.png`,
  `${BASE_PATH}android-chrome-512x512.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(asset)))
    )
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});