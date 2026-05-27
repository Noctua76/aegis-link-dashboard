const CACHE_NAME = "aegis-dashboard-v3";

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
      .then((cache) => cache.addAll(STATIC_ASSETS))
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
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});