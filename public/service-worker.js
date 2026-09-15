self.__AEGIS_DASHBOARD_SW_VERSION__ = "2026-09-16-stable-refresh-2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
