const CACHE_NAME = "aegis-dashboard-v2";

const STATIC_ASSETS = [
  "/aegis-link-dashboard/",
  "/aegis-link-dashboard/site.webmanifest",
  "/aegis-link-dashboard/favicon.ico",
  "/aegis-link-dashboard/apple-touch-icon.png",
  "/aegis-link-dashboard/android-chrome-192x192.png",
  "/aegis-link-dashboard/android-chrome-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Ignore browser-extension and chrome internal requests
  if (
    event.request.url.startsWith("chrome-extension://") ||
    event.request.url.includes("extension")
  ) {
    return;
  }

  // Navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/aegis-link-dashboard/")
      )
    );
    return;
  }

  // Static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => null)
      );
    })
  );
});