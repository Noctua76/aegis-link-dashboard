self.__AEGIS_DASHBOARD_SW_VERSION__ = "2026-09-16-settings-refresh-1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const openClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    await Promise.all(
      openClients.map((client) => client.navigate(client.url))
    );
  })());
});
